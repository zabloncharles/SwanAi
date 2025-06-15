const axios = require('axios');
const { Handler } = require('@netlify/functions');
const OpenAI = require('openai');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, getDoc, doc, setDoc, addDoc } = require('firebase/firestore');

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC3yv52V3iyyO2JlsH7Q-TQqk9yqiBOpJM",
  authDomain: "swanapp-9b41b.firebaseapp.com",
  projectId: "swanapp-9b41b",
  storageBucket: "swanapp-9b41b.firebasestorage.app",
  messagingSenderId: "557847973376",
  appId: "1:557847973376:web:fcbbca18103a19cb3052e5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper to send SMS via Vonage API
async function sendSms({ apiKey, apiSecret, from, to, text }) {
  const url = 'https://rest.nexmo.com/sms/json';
  const response = await axios.post(url, null, {
    params: {
      api_key: apiKey,
      api_secret: apiSecret,
      to,
      from,
      text,
    },
  });
  return response.data;
}

// Initialize OpenAI (v4+)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_HISTORY = 10;

const handler = async (event) => {
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  let from, text;
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');
    from = body.from;
    text = body.text;
  } else {
    // GET: Vonage sends params in the query string
    const params = event.queryStringParameters || {};
    from = params.msisdn || params.from;
    text = params.text;
  }

  // Check for valid text
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No message content provided.' }),
    };
  }

  try {
    // Find user by phone number
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phoneNumber', '==', from));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    // Fetch or initialize summary, history, and profile
    let summary = userSnap.exists() && userSnap.data().summary ? userSnap.data().summary : '';
    let history = userSnap.exists() && userSnap.data().history ? userSnap.data().history : [];
    let profile = userSnap.exists() && userSnap.data().profile ? userSnap.data().profile : {};

    // Add new user message to history
    history.push({ role: 'user', content: text });

    // Always generate/update summary after every message
    const summaryPrompt = [
      { role: 'system', content: `Summarize the following conversation for future context. Do NOT mention that you are an AI or language model. Stay in character as the user's ${userData.aiRelationship || 'Friend'} with a ${userData.personality || 'Friendly'} personality.` },
      { role: 'user', content: summary },
      ...history
    ];
    const summaryResult = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: summaryPrompt,
    });
    summary = summaryResult.choices[0].message.content;

    // Trim history if needed
    if (history.length > MAX_HISTORY) {
      history = history.slice(-MAX_HISTORY);
    }

    // Update profile using OpenAI
    const profilePrompt = [
      { role: 'system', content: `You are an assistant that extracts and updates user profiles. Given the current profile and recent conversation, return ONLY a valid JSON object for the updated profile. The profile should include fields like personality, relationship, preferences, and any other relevant user info. Do not include any extra text or just { role: 'user' }.` },
      { role: 'user', content: `Current profile: ${JSON.stringify(profile)}. Conversation: ${JSON.stringify(history)}` }
    ];
    const profileResult = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: profilePrompt,
    });
    try {
      // Try to find the first { and last } and parse that substring
      const content = profileResult.choices[0].message.content;
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = content.substring(jsonStart, jsonEnd + 1);
        profile = JSON.parse(jsonString);
      } else {
        profile = {};
      }
    } catch (e) {
      // fallback: keep old profile if parsing fails
      console.error('Failed to parse profile JSON:', profileResult.choices[0].message.content);
    }

    // Save updated summary, history, and profile
    console.log('Saving to Firestore:', { summary, history, profile, userId });
    await setDoc(userRef, { ...userSnap.data(), summary, history, profile }, { merge: true });
    console.log('Saved to Firestore:', { summary, history, profile, userId });

    // Use profile and summary in the system prompt, and integrate personality
    const personality = userData.personality || userData.aiPersonality || 'Friendly';
    const relationship = userData.aiRelationship || 'Friend';
    const chatPrompt = [
      {
        role: 'system',
        content: `You are acting as the user's ${relationship} with a ${personality} personality.
Always sound like a real person—casual, warm, and natural, just like a ${relationship.toLowerCase()} texting.
Use contractions, everyday language, and a bit of personality.
If it fits, add a touch of humor or encouragement, and use emojis sparingly.
Never sound robotic or overly formal. 
Avoid generic phrases like "Anything else you need?" or "How can I help you?" Instead, use natural, relationship-appropriate language, and don't be afraid to add a little humor or personality.
If the user asks about your personality or relationship, answer based on the above.
Here is what you know about the user: ${JSON.stringify(profile)}.`
      },
      { role: 'system', content: summary },
      ...history
    ];
    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: chatPrompt,
    });

    const responseTime = (Date.now() - startTime) / 1000; // Convert to seconds
    const aiResponse = completion.choices[0].message?.content || 'Sorry, I could not process your request.';
    const tokensUsed = completion.usage?.total_tokens || 0;

    // Add AI response to history and save
    history.push({ role: 'assistant', content: aiResponse });
    await setDoc(userRef, { ...userSnap.data(), summary, history, profile }, { merge: true });

    // Update running total tokens used
    const prevTokens = userSnap.data().tokensUsed || 0;
    await setDoc(userRef, { ...userSnap.data(), tokensUsed: prevTokens + tokensUsed }, { merge: true });

    // Send SMS response via Vonage API
    const smsResponse = await sendSms({
      apiKey: process.env.VONAGE_API_KEY,
      apiSecret: process.env.VONAGE_API_SECRET,
      from: process.env.VONAGE_PHONE_NUMBER,
      to: from,
      text: aiResponse,
    });
    console.log('Vonage SMS API response:', JSON.stringify(smsResponse));

    // Store Vonage remaining balance in analytics/global tokensByDay map
    const remainingBalance = smsResponse?.messages?.[0]?.['remaining-balance'];
    if (remainingBalance !== undefined) {
      const today = new Date().toISOString().split('T')[0];
      const analyticsRef = doc(db, 'analytics', 'global');
      await setDoc(analyticsRef, {
        tokensByDay: {
          [today]: parseFloat(remainingBalance)
        }
      }, { merge: true });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error processing SMS:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

module.exports.handler = handler; 