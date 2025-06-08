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
      { role: 'system', content: 'Summarize the following conversation for future context.' },
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
      { role: 'system', content: 'You are an assistant that extracts and updates user profiles. Given the current profile and recent conversation, return an updated JSON profile.' },
      { role: 'user', content: `Current profile: ${JSON.stringify(profile)}. Conversation: ${JSON.stringify(history)}` }
    ];
    const profileResult = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: profilePrompt,
    });
    try {
      profile = JSON.parse(profileResult.choices[0].message.content);
    } catch (e) {
      // fallback: keep old profile if parsing fails
      console.error('Failed to parse profile JSON:', profileResult.choices[0].message.content);
    }

    // Save updated summary, history, and profile
    console.log('Saving to Firestore:', { summary, history, profile, userId });
    await setDoc(userRef, { ...userSnap.data(), summary, history, profile }, { merge: true });
    console.log('Saved to Firestore:', { summary, history, profile, userId });

    // Use profile and summary in the system prompt, and integrate personality
    const personality = userData.aiPersonality || 'friendly';
    const chatPrompt = [
      {
        role: 'system',
        content: `You are an AI assistant texting with the user. Your personality is: ${personality}. Always reply in a natural, friendly, and conversational style, like a real person would in a text message. Be concise, casual, and use everyday language. Feel free to use emojis or informal expressions if it fits the context. Avoid sounding robotic or overly formal. Here is what you know about the user: ${JSON.stringify(profile)}.`
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

    // Add AI response to history and save
    history.push({ role: 'assistant', content: aiResponse });
    console.log('Saving to Firestore (after AI):', { summary, history, profile, userId });
    await setDoc(userRef, { ...userSnap.data(), summary, history, profile }, { merge: true });
    console.log('Saved to Firestore (after AI):', { summary, history, profile, userId });

    // Send SMS response via Vonage API
    const smsResponse = await sendSms({
      apiKey: process.env.VONAGE_API_KEY,
      apiSecret: process.env.VONAGE_API_SECRET,
      from: process.env.VONAGE_PHONE_NUMBER,
      to: from,
      text: aiResponse,
    });
    console.log('Vonage SMS API response:', JSON.stringify(smsResponse));

    // Log the interaction
    await addDoc(collection(db, 'messages'), {
      userId: userDoc.id,
      timestamp: new Date(),
      incomingMessage: text,
      outgoingMessage: aiResponse,
      responseTime,
    });

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