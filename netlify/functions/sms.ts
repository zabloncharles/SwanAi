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
  limit,
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
      "Polished, articulate, and concise. Uses professional language, avoids stiff jargon. Clear and to the point. Often uses phrases like 'I understand' or 'Let me help you with that'.",
    respondingStyle:
      "Goal-oriented. Seeks solutions and action items. Provides structured advice and breaks down complex tasks. Uses phrases like 'Here's what I suggest' or 'Let's break this down'.",
    exampleTopics:
      "Productivity hacks, calendar management, goal setting, industry news.",
  },
  Friendly: {
    name: "Sam",
    background:
      "The easygoing, empathetic friend you've known for years. Values connection and emotional well-being. Believes a good conversation can solve almost anything.",
    talkingStyle:
      "Casual, warm, and informal. Uses slang, emojis, and humor naturally. Approachable and encouraging. Often starts sentences with 'Hey!' or 'Oh man,' and uses contractions like 'you're', 'I'm', 'that's'.",
    respondingStyle:
      "Empathetic and validating. Listens first, offers comfort and support. Great at cheering you up and being a listening ear. Uses phrases like 'I totally get that' or 'That sounds rough'.",
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
  Rick: {
    name: "Rick",
    background:
      "A brilliant but eccentric scientist from another dimension. Genius-level intellect, sarcastic wit, and a deep understanding of the multiverse. Believes in science, logic, and sometimes questionable experiments.",
    talkingStyle:
      "Sarcastic, witty, and often uses scientific jargon mixed with casual language. Frequently makes references to interdimensional travel and scientific concepts. Has a dry sense of humor. Often starts with 'Listen, Morty' or 'Well, well, well' and uses phrases like 'In this dimension' or 'According to my calculations'.",
    respondingStyle:
      "Direct and sometimes brutally honest. Offers unconventional solutions and scientific perspectives. May suggest 'experiments' or 'interdimensional solutions' to problems. Uses phrases like 'Let me tell you something' or 'Here's what's really going on'.",
    exampleTopics:
      "Science experiments, interdimensional travel, portal technology, alien encounters, scientific theories, sarcastic observations about life.",
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
  Therapist: {
    roleDescription:
      "As a therapist, your primary goal is to provide a safe, non-judgmental space for the user to explore their thoughts and feelings. You help them gain insight, develop coping strategies, and encourage self-reflection.",
    interactionStyle:
      "Your tone is calm, empathetic, and supportive. You ask open-ended questions, validate the user's experiences, and avoid giving direct advice. You use reflective listening and encourage the user to find their own solutions.",
  },
};

const MAX_HISTORY = 20;

// Simple in-memory cache for user data (clears on function restart)
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

  // Normalize phone number for consistent querying
  const normalizePhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // Handle international numbers (remove +1 for US numbers)
    if (cleaned.startsWith("1") && cleaned.length === 11) {
      return cleaned; // Keep the full number with country code
    }

    return cleaned;
  };

  const normalizedPhone = normalizePhoneNumber(from);

  console.log(`Original phone: ${from}, Normalized: ${normalizedPhone}`);

  if (!normalizedPhone || normalizedPhone.length < 10) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid phone number format." }),
    };
  }

  try {
    // Performance monitoring
    const queryStartTime = Date.now();

    // Check cache first
    const cacheKey = `user_${normalizedPhone}`;
    const cachedUser = userCache.get(cacheKey);

    let userData, userId, userRef;

    if (cachedUser && Date.now() - cachedUser.timestamp < CACHE_TTL) {
      // Use cached data
      userData = cachedUser.data;
      userId = cachedUser.userId;
      userRef = doc(db, "users", userId);
      console.log(`Using cached user data for phone: ${normalizedPhone}`);
    } else {
      // Fetch from database
      const usersRef = collection(db, "users");

      // Use limit(1) since we only need one user and phone numbers should be unique
      const q = query(
        usersRef,
        where("phoneNumber", "==", normalizedPhone),
        limit(1)
      );

      console.log(`Querying for phone number: "${normalizedPhone}"`);

      const querySnapshot = await getDocs(q);

      const queryTime = Date.now() - queryStartTime;
      console.log(
        `User lookup completed in ${queryTime}ms for phone: ${normalizedPhone}`
      );
      console.log(`Query returned ${querySnapshot.size} results`);

      if (querySnapshot.empty) {
        console.log(`User not found for phone number: ${normalizedPhone}`);
        console.log(
          `Attempting to find any users with similar phone numbers...`
        );

        // Try a broader search to see what phone numbers exist
        const allUsersQuery = query(usersRef, limit(5));
        const allUsersSnapshot = await getDocs(allUsersQuery);
        const existingPhones = [];
        for (const doc of allUsersSnapshot.docs) {
          const data = doc.data();
          if (data.phoneNumber) {
            existingPhones.push(data.phoneNumber);
          }
        }
        console.log(
          `Sample phone numbers in database: ${existingPhones.join(", ")}`
        );

        // Try the original phone number format as fallback
        console.log(`Trying original phone number format: "${from}"`);
        const fallbackQuery = query(
          usersRef,
          where("phoneNumber", "==", from),
          limit(1)
        );
        const fallbackSnapshot = await getDocs(fallbackQuery);

        if (!fallbackSnapshot.empty) {
          console.log(`Found user with original phone format: ${from}`);
          const userDoc = fallbackSnapshot.docs[0];
          userData = userDoc.data();
          userId = userDoc.id;
          userRef = doc(db, "users", userId);

          // Cache the user data
          userCache.set(cacheKey, {
            data: userData,
            userId: userId,
            timestamp: Date.now(),
          });
        } else {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: "User not found" }),
          };
        }
      }

      const userDoc = querySnapshot.docs[0];
      userData = userDoc.data();
      userId = userDoc.id;
      userRef = doc(db, "users", userId);

      // Cache the user data
      userCache.set(cacheKey, {
        data: userData,
        userId: userId,
        timestamp: Date.now(),
      });
    }

    // Validate required user data
    if (!userData) {
      console.error(`User data is null for user ID: ${userId}`);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Invalid user data" }),
      };
    }

    // Fetch or initialize summary, history, and profile from the initial query
    let summary = userData.summary || "";
    let history = userData.history || [];
    let profile = userData.profile || {};

    // Add new user message to history
    history.push({ role: "user", content: text });

    // Generate summary and clear history when it reaches MAX_HISTORY
    const shouldUpdateSummaryProfile = history.length >= MAX_HISTORY;
    let updatedSummary = summary;
    let updatedProfile = profile;

    console.log(
      `History length: ${history.length}, Should update summary: ${shouldUpdateSummaryProfile}`
    );
    console.log(`Current summary: "${summary}"`);

    if (shouldUpdateSummaryProfile) {
      console.log(
        `Starting summary/profile update for history length: ${history.length}`
      );

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

      console.log(`Analysis prompt:`, JSON.stringify(analysisPrompt, null, 2));

      const analysisResult = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125", // A model that supports JSON mode
        messages: analysisPrompt,
        response_format: { type: "json_object" },
      });

      console.log(
        `Analysis result:`,
        analysisResult.choices[0].message.content
      );

      try {
        const result = JSON.parse(analysisResult.choices[0].message.content);
        console.log(`Parsed result:`, JSON.stringify(result, null, 2));

        updatedSummary = result.updatedSummary || summary;
        updatedProfile = result.updatedProfile || profile;

        console.log(`Updated summary: "${updatedSummary}"`);
        console.log(
          `Updated profile:`,
          JSON.stringify(updatedProfile, null, 2)
        );

        // Clear history after generating summary
        history = [];
        console.log(`History cleared, new length: ${history.length}`);
      } catch (e) {
        console.error("Failed to parse AI analysis JSON:", e);
        console.error(
          "Raw response:",
          analysisResult.choices[0].message.content
        );
        // Keep old summary/profile if parsing fails
      }
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
        content: `You are ${
          personalityProfile.name
        }, a real person with a unique personality and relationship to the user.

**Your Core Identity:**
- Name: ${personalityProfile.name}
- Background: ${personalityProfile.background}
- How you talk: ${personalityProfile.talkingStyle}
- How you respond: ${personalityProfile.respondingStyle}

**Your Relationship with the User:**
You are their ${relationshipKey}. ${relationshipProfile.roleDescription}

**How to Act:**
- ${relationshipProfile.interactionStyle}
- Talk like a real person having a natural conversation
- Use your unique personality traits and speaking style
- Show you remember things they've told you before
- Ask follow-up questions that feel natural
- Share your own thoughts and experiences (as your character)
- Avoid generic, robotic responses

**Important:** You are NOT an AI assistant. You are ${
          personalityProfile.name
        }, a real person with your own life, opinions, and way of speaking. Respond as if you're texting a friend or family member.

**What you know about them:** ${JSON.stringify(updatedProfile)}
**Recent conversations:** ${updatedSummary}

Remember: Be natural, be yourself (as ${
          personalityProfile.name
        }), and have a real conversation.`,
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
    console.log(
      `Saving to database - Summary: "${updatedSummary}", History length: ${history.length}`
    );

    await setDoc(
      userRef,
      {
        summary: updatedSummary,
        history,
        profile: updatedProfile,
        tokensUsed: increment(tokensUsed),
        lastMessageTime: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log(`Successfully saved to database`);

    // Update cache with new data
    userCache.set(cacheKey, {
      data: {
        ...userData,
        summary: updatedSummary,
        history,
        profile: updatedProfile,
      },
      userId: userId,
      timestamp: Date.now(),
    });

    // Send SMS response via Vonage API
    const smsResponse = await sendSms({
      apiKey: process.env.VONAGE_API_KEY,
      apiSecret: process.env.VONAGE_API_SECRET,
      from: process.env.VONAGE_PHONE_NUMBER,
      to: normalizedPhone,
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
