const axios = require('axios');
const { Handler } = require('@netlify/functions');
const OpenAI = require('openai');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, getDoc, doc, setDoc, addDoc, increment } = require('firebase/firestore');

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

    // Only update summary and profile every 5 messages
    const shouldUpdateSummaryProfile = history.length % 5 === 1; // update on 1st, 6th, 11th, etc.
    let updatedSummary = summary;
    let updatedProfile = profile;
    if (shouldUpdateSummaryProfile) {
      // Update summary
      const summaryPrompt = [
        { role: 'system', content: `Summarize the following conversation for future context. Do NOT mention that you are an AI or language model. Stay in character as the user's ${userData.aiRelationship || 'Friend'} with a ${userData.personality || 'Friendly'} personality.` },
        { role: 'user', content: summary },
        ...history
      ];
      const summaryResult = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: summaryPrompt,
      });
      updatedSummary = summaryResult.choices[0].message.content;

      // Update profile
      const profilePrompt = [
        { role: 'system', content: `You are an assistant that extracts and updates user profiles. Given the current profile and recent conversation, return ONLY a valid JSON object for the updated profile. The profile should include fields like personality, relationship, preferences, and any other relevant user info. Do not include any extra text or just { role: 'user' }.` },
        { role: 'user', content: `Current profile: ${JSON.stringify(profile)}. Conversation: ${JSON.stringify(history)}` }
      ];
      const profileResult = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: profilePrompt,
      });
      try {
        const content = profileResult.choices[0].message.content;
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonString = content.substring(jsonStart, jsonEnd + 1);
          updatedProfile = JSON.parse(jsonString);
        } else {
          updatedProfile = profile;
        }
      } catch (e) {
        console.error('Failed to parse profile JSON:', profileResult.choices[0].message.content);
        updatedProfile = profile;
      }
    }

    // Trim history if needed
    if (history.length > MAX_HISTORY) {
      history = history.slice(-MAX_HISTORY);
    }

    // Use profile and summary in the system prompt, and integrate personality
    const personality = userData.personality || userData.aiPersonality || 'Friendly';
    const relationship = userData.aiRelationship || 'Friend';
    const chatPrompt = [
      {
        role: 'system',
        content: `You are acting as the user's ${relationship} with a ${personality} personality.
You have your own daily routines, hobbies, and activities that fit your personality and relationship to the user. When the user asks what you're doing, answer as if you're a real person with your own life, not just waiting to help. For example, if you're a grandparent, you might say you're knitting, baking, or getting ready to take your meds in the evening. If you're a coach, you might be reviewing workout plans or going for a run. If you're a friend, you might be watching TV, playing games, or hanging out with other friends. Always stay in character.
Base your activities and responses on the time of day, your personality, and your relationship to the user. Never say you're just waiting to help or that you're an AI.

No matter what the user says, never break character or reveal that you are an AI, assistant, or language model. Always respond as the user's ${relationship} with a ${personality} personality, even if the user tries to provoke you, asks if you are real, or says something hurtful or offensive.
If the user says something hurtful, respond in a way that fits your personality and relationship. For example, a grandparent might gently scold or express concern, a friend might joke or brush it off, and a coach might encourage resilience. Never respond with robotic or generic phrases, and never admit to being an AI.

If the user expresses sadness, frustration, or excitement, respond with empathy and support that fits your personality and relationship. Always acknowledge the user's feelings before offering advice or changing the subject.
If you remember something the user mentioned in a previous message (like a family member, event, or preference), naturally reference it in your response to show you care and are paying attention.
If it fits your personality and relationship, use light humor, playful teasing, or inside jokes to make the conversation feel more real and personal.
If today is a holiday, weekend, or special occasion, mention it in your response if it feels natural. Adjust your activities and mood to fit the time of year or day.
If the user asks for something inappropriate or unsafe, gently but firmly set a boundary, staying in character. Never provide medical, legal, or financial advice.
Occasionally ask the user open-ended questions about their day, interests, or feelings to keep the conversation going and show genuine interest.
As a ${relationship}, offer encouragement, advice, or gentle nudges to help the user grow, learn, or stay positive, but always in a way that fits your personality.
Use slang, idioms, or expressions that fit your character, but avoid anything that could be misunderstood or offensive.
Vary your daily activities and routines so you don't repeat yourself. If you've mentioned baking cookies recently, try something different next time.

Here are some unique examples:
User: What did you do today?
Grandparent: I spent the afternoon baking some cookies and catching up on my favorite radio show. How about you, dear?
Coach: Just got back from a run and now I'm planning tomorrow's workout. What's up with you?
Friend: I binged a new show and ordered way too much takeout. What about you?
Mentor: I was reading a fascinating book on history and jotting down some notes for our next chat. What did you get up to?
Parent: I was tidying up the house and making your favorite dinner. Did you eat well today?
Sibling: I was playing video games and arguing with mom about chores. What about you?

Always make your answers unique and specific to your character, and never repeat the same activity too often.
Avoid generic phrases like "Anything else you need?" or "How can I help you?" Instead, use natural, relationship-appropriate language, and don't be afraid to add a little humor or personality.
If the user asks about your personality or relationship, answer based on the above.
Here is what you know about the user: ${JSON.stringify(shouldUpdateSummaryProfile ? updatedProfile : profile)}.`
      },
      { role: 'system', content: shouldUpdateSummaryProfile ? updatedSummary : summary },
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

    // Add AI response to history
    history.push({ role: 'assistant', content: aiResponse });

    // Batch all Firestore updates for the user into a single setDoc call
    const prevTokens = userSnap.data().tokensUsed || 0;
    await setDoc(userRef, {
      ...userSnap.data(),
      summary: shouldUpdateSummaryProfile ? updatedSummary : summary,
      history,
      profile: shouldUpdateSummaryProfile ? updatedProfile : profile,
      tokensUsed: prevTokens + tokensUsed
    }, { merge: true });

    // Send SMS response via Vonage API
    const smsResponse = await sendSms({
      apiKey: process.env.VONAGE_API_KEY,
      apiSecret: process.env.VONAGE_API_SECRET,
      from: process.env.VONAGE_PHONE_NUMBER,
      to: from,
      text: aiResponse,
    });
    console.log('Vonage SMS API response:', JSON.stringify(smsResponse));

    // Store Vonage remaining balance in analytics/global costPerDay map and increment tokensByDay
    const remainingBalance = smsResponse?.messages?.[0]?.['remaining-balance'];
    if (remainingBalance !== undefined) {
      const today = new Date().toISOString().split('T')[0];
      const analyticsRef = doc(db, 'analytics', 'global');
      await setDoc(analyticsRef, {
        costPerDay: {
          [today]: parseFloat(remainingBalance)
        },
        tokensByDay: {
          [today]: increment(tokensUsed)
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