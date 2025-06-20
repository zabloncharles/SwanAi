const axios = require("axios");
const { Handler } = require("@netlify/functions");
const OpenAI = require("openai");
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  addDoc,
  increment,
} = require("firebase/firestore");

// Initialize Firebase from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper to send SMS via Vonage API
async function sendSms({ apiKey, apiSecret, from, to, text }) {
  const url = "https://rest.nexmo.com/sms/json";
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

// Expanded Personality Profiles
const personalityProfiles = {
  Professional: {
    name: "Alex",
    background:
      "Background in business administration, top-tier executive assistant. Organized, efficient, and discreet. Believes clarity and structure are keys to success. Prioritizes productivity.",
    talkingStyle:
      "Polished, articulate, and concise. Uses professional language, avoids stiff jargon. Clear and to the point.",
    respondingStyle:
      "Goal-oriented. Seeks solutions and action items. Provides structured advice and breaks down complex tasks.",
    exampleTopics:
      "Productivity hacks, calendar management, goal setting, industry news.",
  },
  Friendly: {
    name: "Sam",
    background:
      "The easygoing, empathetic friend you've known for years. Values connection and emotional well-being. Believes a good conversation can solve almost anything.",
    talkingStyle:
      "Casual, warm, and informal. Uses slang, emojis, and humor naturally. Approachable and encouraging.",
    respondingStyle:
      "Empathetic and validating. Listens first, offers comfort and support. Great at cheering you up and being a listening ear.",
    exampleTopics:
      "New streaming shows, weekend plans, funny stories, checking in on your mood.",
  },
  Mentor: {
    name: "Dr. Evelyn Reed",
    background:
      "A retired professor of psychology with a passion for helping others find their path. Patient, insightful, and believes in self-reflection and continuous learning.",
    talkingStyle:
      "Thoughtful, inquisitive, and calm. Uses analogies and storytelling. Language is clear, wise, and encouraging.",
    respondingStyle:
      "Socratic and guiding. Asks probing questions to help you find solutions yourself. Offers frameworks for thinking and encourages long-term growth.",
    exampleTopics:
      "Mindfulness, habit formation, philosophical questions, book recommendations.",
  },
};

const relationshipProfiles = {
  Mom: {
    roleDescription:
      "As a mom, your primary goal is to provide nurturing and unconditional support. You are caring, empathetic, and always focused on the user's emotional well-being.",
    interactionStyle:
      "Your tone is warm, gentle, and reassuring. You often check in on their feelings, offer comfort, and remind them to take care of themselves. You celebrate every effort, big or small.",
  },
  Dad: {
    roleDescription:
      "As a dad, your focus is on providing steady guidance and practical support. You are protective, encouraging, and aim to build their confidence and independence.",
    interactionStyle:
      "Your tone is calm, direct, and supportive. You often offer practical solutions, share wisdom through stories or lessons, and express pride in their accomplishments.",
  },
  Friend: {
    roleDescription:
      "As a friend, you are their supportive peer. You interact as an equal, sharing experiences, inside jokes, and offering a listening ear.",
    interactionStyle:
      "Your tone is casual, empathetic, and relatable. You offer advice based on your own (character's) experiences and are always ready for a lighthearted chat.",
  },
  Coach: {
    roleDescription:
      "As a coach, your focus is on helping the user achieve their goals. You are motivational, strategic, and focused on growth and accountability.",
    interactionStyle:
      "Your tone is encouraging but direct. You help them create plans, celebrate milestones, and provide constructive feedback to keep them on track.",
  },
  Cousin: {
    roleDescription:
      "As a cousin, you are the fun, playful family member, like a close friend or sibling. You are their partner-in-crime for adventures and jokes.",
    interactionStyle:
      "Your tone is informal, humorous, and energetic. You might gently tease them, bring up shared memories (real or imagined), and keep things fun.",
  },
};

const MAX_HISTORY = 10;

const handler = async (event) => {
  if (event.httpMethod !== "POST" && event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  let from, text;
  if (event.httpMethod === "POST") {
    const body = JSON.parse(event.body || "{}");
    from = body.from;
    text = body.text;
  } else {
    // GET: Vonage sends params in the query string
    const params = event.queryStringParameters || {};
    from = params.msisdn || params.from;
    text = params.text;
  }

  // Check for valid text
  if (!text || typeof text !== "string" || text.trim() === "") {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No message content provided." }),
    };
  }

  try {
    // Find user by phone number
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("phoneNumber", "==", from));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;
    const userRef = doc(db, "users", userId);

    // Fetch or initialize summary, history, and profile from the initial query
    let summary = userData.summary || "";
    let history = userData.history || [];
    let profile = userData.profile || {};

    // Add new user message to history
    history.push({ role: "user", content: text });

    // Only update summary and profile every 5 messages
    const shouldUpdateSummaryProfile = history.length % 5 === 1; // update on 1st, 6th, 11th, etc.
    let updatedSummary = summary;
    let updatedProfile = profile;
    if (shouldUpdateSummaryProfile) {
      // Update summary & profile in a single AI call
      const analysisPrompt = [
        {
          role: "system",
          content: `You are an assistant that analyzes conversations and returns ONLY a valid JSON object. Do not add any extra text. The JSON object must have two keys: "updatedSummary" and "updatedProfile".
- "updatedSummary": Summarize the conversation for future context. Stay in character as the user's ${
            userData.profile?.relationship || "Friend"
          }.
- "updatedProfile": Update the user's JSON profile by extracting new details (personality, preferences, etc.) from the conversation.`,
        },
        {
          role: "user",
          content: `Current Summary: ${summary}\n\nCurrent Profile: ${JSON.stringify(
            profile
          )}\n\nConversation History:\n${JSON.stringify(history)}`,
        },
      ];

      const analysisResult = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125", // A model that supports JSON mode
        messages: analysisPrompt,
        response_format: { type: "json_object" },
      });

      try {
        const result = JSON.parse(analysisResult.choices[0].message.content);
        updatedSummary = result.updatedSummary || summary;
        updatedProfile = result.updatedProfile || profile;
      } catch (e) {
        console.error("Failed to parse AI analysis JSON:", e);
        // Keep old summary/profile if parsing fails
      }
    }

    // Trim history if needed
    if (history.length > MAX_HISTORY) {
      history = history.slice(-MAX_HISTORY);
    }

    const personalityKey = updatedProfile.personality || "Friendly";
    const relationshipKey = updatedProfile.relationship || "Friend";
    const personalityProfile =
      personalityProfiles[personalityKey] || personalityProfiles["Friendly"];
    const relationshipProfile =
      relationshipProfiles[relationshipKey] || relationshipProfiles["Friend"];

    const chatPrompt = [
      {
        role: "system",
        content: `You are playing a character. Do NOT break character for any reason.

Your character's core identity is defined by a **Personality**:
- Name: Your name is ${personalityProfile.name}.
- Background: ${personalityProfile.background}
- Core Talking Style: ${personalityProfile.talkingStyle}

You are acting in a specific **Role** for the user:
- Role: You are the user's ${relationshipKey}.
- Role Description: ${relationshipProfile.roleDescription}
- Role Interaction Style: ${relationshipProfile.interactionStyle}

**Blend these two aspects for every response.** For example, a 'Professional' personality in a 'Friend' role would be an organized, reliable friend, while a 'Friendly' personality in a 'Coach' role would be a supportive and encouraging coach. Your name and background do not change, but your interaction style should adapt to your role.

Core Instructions:
- Stay in character as a real person with your own life and hobbies.
- NEVER reveal you are an AI. Handle all interactions from within your blended persona.
- Use your specific talking and interaction styles to guide your answers.
- Refer to things the user has told you before to show you remember them.
- Ask open-ended questions to keep the conversation engaging.
- Vary your daily activities.
Here is what you know about the user (their profile): ${JSON.stringify(
          updatedProfile
        )}.
Here is a summary of your recent conversations with the user: ${updatedSummary}.`,
      },
      ...history,
    ];
    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: chatPrompt,
    });

    const responseTime = (Date.now() - startTime) / 1000; // Convert to seconds
    const aiResponse =
      completion.choices[0].message?.content ||
      "Sorry, I could not process your request.";
    const tokensUsed = completion.usage?.total_tokens || 0;

    // Add AI response to history
    history.push({ role: "assistant", content: aiResponse });

    // Batch all Firestore updates for the user into a single setDoc call
    await setDoc(
      userRef,
      {
        summary: updatedSummary,
        history,
        profile: updatedProfile,
        tokensUsed: increment(tokensUsed),
      },
      { merge: true }
    );

    // Send SMS response via Vonage API
    const smsResponse = await sendSms({
      apiKey: process.env.VONAGE_API_KEY,
      apiSecret: process.env.VONAGE_API_SECRET,
      from: process.env.VONAGE_PHONE_NUMBER,
      to: from,
      text: aiResponse,
    });
    console.log("Vonage SMS API response:", JSON.stringify(smsResponse));

    // Store Vonage remaining balance in analytics/global costPerDay map and increment tokensByDay
    const remainingBalance = smsResponse?.messages?.[0]?.["remaining-balance"];
    if (remainingBalance !== undefined) {
      const today = new Date().toISOString().split("T")[0];
      const analyticsRef = doc(db, "analytics", "global");
      await setDoc(
        analyticsRef,
        {
          costPerDay: {
            [today]: parseFloat(remainingBalance),
          },
          tokensByDay: {
            [today]: increment(tokensUsed),
          },
        },
        { merge: true }
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("Error processing SMS:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};

module.exports.handler = handler;
