const { Handler } = require('@netlify/functions');
const Vonage = require('@vonage/server-sdk').default;
const { Configuration, OpenAIApi } = require('openai');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, addDoc } = require('firebase/firestore');

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

// Initialize Vonage
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

// Initialize OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { from, text } = body;

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

    // Get AI response
    const startTime = Date.now();
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant with a ${userData.aiPersonality || 'friendly'} personality. Keep responses concise and helpful.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
    });

    const responseTime = (Date.now() - startTime) / 1000; // Convert to seconds
    const aiResponse = completion.data.choices[0].message?.content || 'Sorry, I could not process your request.';

    // Send SMS response
    await vonage.message.sendSms(
      process.env.VONAGE_PHONE_NUMBER,
      from,
      aiResponse
    );

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