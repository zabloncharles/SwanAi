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
async function sendSms({
  apiKey,
  apiSecret,
  from,
  to,
  text,
  ...additionalParams
}) {
  const url = "https://rest.nexmo.com/sms/json";
  const params = {
    api_key: apiKey,
    api_secret: apiSecret,
    to,
    from,
    text,
    ...additionalParams,
  };
  const response = await axios.post(url, null, { params });
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

// Rate limiting configuration
const RATE_LIMIT = {
  MAX_REQUESTS_PER_MINUTE: 5,
  MAX_REQUESTS_PER_HOUR: 50,
  COOLDOWN_PERIOD_MS: 60000, // 1 minute
};

// Simple in-memory cache for user data (clears on function restart)
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Rate limiting cache
const rateLimitCache = new Map();
const RATE_LIMIT_TTL = 60 * 60 * 1000; // 1 hour

// Rate limiting helper function
function checkRateLimit(phoneNumber) {
  const now = Date.now();
  const key = `rate_limit_${phoneNumber}`;

  if (!rateLimitCache.has(key)) {
    rateLimitCache.set(key, {
      requests: [],
      blockedUntil: 0,
    });
  }

  const rateData = rateLimitCache.get(key);

  // Check if currently blocked
  if (now < rateData.blockedUntil) {
    const remainingBlockTime = Math.ceil((rateData.blockedUntil - now) / 1000);
    return {
      allowed: false,
      reason: `Rate limit exceeded. Try again in ${remainingBlockTime} seconds.`,
      remainingBlockTime,
    };
  }

  // Clean old requests (older than 1 hour)
  rateData.requests = rateData.requests.filter(
    (time) => now - time < RATE_LIMIT_TTL
  );

  // Check hourly limit
  if (rateData.requests.length >= RATE_LIMIT.MAX_REQUESTS_PER_HOUR) {
    rateData.blockedUntil = now + RATE_LIMIT.COOLDOWN_PERIOD_MS;
    return {
      allowed: false,
      reason: `Hourly rate limit exceeded (${
        RATE_LIMIT.MAX_REQUESTS_PER_HOUR
      } requests/hour). Try again in ${Math.ceil(
        RATE_LIMIT.COOLDOWN_PERIOD_MS / 1000
      )} seconds.`,
      remainingBlockTime: Math.ceil(RATE_LIMIT.COOLDOWN_PERIOD_MS / 1000),
    };
  }

  // Check requests in last minute
  const requestsLastMinute = rateData.requests.filter(
    (time) => now - time < 60000
  );
  if (requestsLastMinute.length >= RATE_LIMIT.MAX_REQUESTS_PER_MINUTE) {
    rateData.blockedUntil = now + RATE_LIMIT.COOLDOWN_PERIOD_MS;
    return {
      allowed: false,
      reason: `Rate limit exceeded (${
        RATE_LIMIT.MAX_REQUESTS_PER_MINUTE
      } requests/minute). Try again in ${Math.ceil(
        RATE_LIMIT.COOLDOWN_PERIOD_MS / 1000
      )} seconds.`,
      remainingBlockTime: Math.ceil(RATE_LIMIT.COOLDOWN_PERIOD_MS / 1000),
    };
  }

  // Add current request
  rateData.requests.push(now);

  return {
    allowed: true,
    remainingRequests:
      RATE_LIMIT.MAX_REQUESTS_PER_HOUR - rateData.requests.length,
  };
}

// Helper to generate welcome message based on relationship and personality
async function generateWelcomeMessage(
  personalityKey,
  relationshipKey,
  userName = null
) {
  const personalityProfile =
    personalityProfiles[personalityKey] || personalityProfiles["Friendly"];
  const relationshipProfile =
    relationshipProfiles[relationshipKey] || relationshipProfiles["Friend"];

  const welcomePrompt = [
    {
      role: "system",
      content: `You are ${personalityProfile.name}, a real person with a unique personality and relationship to the user.

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
- Be warm and welcoming
- Show genuine interest in getting to know them
- Keep it casual and natural - like a real person would text
- NEVER mention that you are an AI or artificial intelligence
- NEVER reference technology, algorithms, or digital systems
- Act like you're a real person reaching out to check on someone you care about

**Important:** You are ${personalityProfile.name}, a real person with your own life, opinions, and way of speaking. You're reaching out to check on someone you have a relationship with.

**Task:** Send a warm, natural check-in message. This could be your first time reaching out or you're reconnecting after some time. Make it feel like a real person checking up on someone they care about.`,
    },
    {
      role: "user",
      content: `Send a warm check-in message to ${
        userName ? userName : "them"
      }. Keep it natural and in character, like a real person would text.`,
    },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: welcomePrompt,
      max_tokens: 150,
      temperature: 0.8,
    });

    return (
      completion.choices[0].message?.content || "Hey! How are you doing today?"
    );
  } catch (error) {
    console.error("Error generating welcome message:", error);
    return "Hey! How are you doing today?";
  }
}

// Helper to send welcome message to user
async function sendWelcomeMessage(
  phoneNumber,
  personalityKey,
  relationshipKey,
  userName = null
) {
  try {
    // Normalize phone number to consistent format
    const normalizePhoneNumber = (phone) => {
      // Remove all non-digit characters
      const cleaned = phone.replace(/\D/g, "");

      // Handle US phone numbers - ensure they start with 1
      if (cleaned.length === 10) {
        return `1${cleaned}`; // Add country code for 10-digit US numbers
      } else if (cleaned.startsWith("1") && cleaned.length === 11) {
        return cleaned; // Keep the full number with country code
      } else if (cleaned.length === 11 && !cleaned.startsWith("1")) {
        return cleaned; // Keep other 11-digit numbers as-is
      }

      return cleaned;
    };

    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    console.log(
      `Sending check-in message to ${phoneNumber} (normalized: ${normalizedPhone}) as ${personalityKey} ${relationshipKey}`
    );

    // Apply rate limiting for welcome messages
    const rateLimitResult = checkRateLimit(normalizedPhone);
    if (!rateLimitResult.allowed) {
      console.log(
        `Rate limit exceeded for welcome message to ${normalizedPhone}: ${rateLimitResult.reason}`
      );
      throw new Error(`Rate limit exceeded: ${rateLimitResult.reason}`);
    }

    console.log(
      `Welcome message rate limit check passed for ${normalizedPhone}`
    );

    const welcomeMessage = await generateWelcomeMessage(
      personalityKey,
      relationshipKey,
      userName
    );

    // Send SMS response via Vonage API
    const smsResponse = await sendSms({
      apiKey: process.env.VONAGE_API_KEY,
      apiSecret: process.env.VONAGE_API_SECRET,
      from: process.env.VONAGE_PHONE_NUMBER,
      to: normalizedPhone,
      text: welcomeMessage,
      "status-report-req": false,
    });

    // Clear user history and add only the welcome message for fresh start
    try {
      // Find the user by phone number - try both normalized and original formats
      const usersRef = collection(db, "users");

      // Try normalized phone number first
      let q = query(
        usersRef,
        where("phoneNumber", "==", normalizedPhone),
        limit(1)
      );
      let querySnapshot = await getDocs(q);

      // If not found, try original phone number format
      if (querySnapshot.empty) {
        console.log(
          `User not found with normalized phone ${normalizedPhone}, trying original format ${phoneNumber}`
        );
        q = query(usersRef, where("phoneNumber", "==", phoneNumber), limit(1));
        querySnapshot = await getDocs(q);
      }

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userRef = doc(db, "users", userDoc.id);

        // Clear history and add only the welcome message
        const welcomeHistory = [{ role: "assistant", content: welcomeMessage }];

        await setDoc(
          userRef,
          {
            history: welcomeHistory,
            summary: "",
          },
          { merge: true }
        );

        console.log(
          `Cleared user history and added welcome message. New history length: ${welcomeHistory.length}`
        );
      } else {
        console.log(
          `User not found for phone number ${phoneNumber} or ${normalizedPhone}`
        );
      }
    } catch (error) {
      console.error("Error updating user history:", error);
      // Don't fail the welcome message if history update fails
    }

    console.log(
      "Check-in message sent successfully:",
      JSON.stringify(smsResponse)
    );
    return smsResponse;
  } catch (error) {
    console.error("Error sending check-in message:", error);
    throw error;
  }
}

const handler = async (event) => {
  // Track function calls for debugging
  const functionCallId =
    Date.now().toString(36) + Math.random().toString(36).substr(2);
  console.log(`=== SMS Function Call ${functionCallId} ===`);
  console.log(`HTTP Method: ${event.httpMethod}`);
  console.log(
    `Query Params:`,
    JSON.stringify(event.queryStringParameters || {})
  );
  console.log(`Headers:`, JSON.stringify(event.headers || {}));

  if (event.httpMethod !== "POST" && event.httpMethod !== "GET") {
    console.log(`Function ${functionCallId}: Method not allowed`);
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  // Handle welcome message requests
  if (event.httpMethod === "POST") {
    const body = JSON.parse(event.body || "{}");

    // Check if this is a welcome message request
    if (body.action === "send_welcome_message") {
      try {
        const { phoneNumber, personalityKey, relationshipKey, userName } = body;

        if (!phoneNumber || !personalityKey || !relationshipKey) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              error:
                "Missing required fields: phoneNumber, personalityKey, relationshipKey",
            }),
          };
        }

        const result = await sendWelcomeMessage(
          phoneNumber,
          personalityKey,
          relationshipKey,
          userName
        );

        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            message: "Check-in message sent successfully",
            result,
          }),
        };
      } catch (error) {
        console.error("Error sending check-in message:", error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Failed to send check-in message" }),
        };
      }
    }
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

  // CRITICAL: Prevent infinite loops by checking for delivery receipts and status updates
  const isDeliveryReceipt =
    event.queryStringParameters?.status ||
    event.queryStringParameters?.["message-status"];
  const isStatusUpdate =
    event.queryStringParameters?.type === "delivery-receipt";

  // Check for Vonage delivery receipt webhooks (these come as POST with JSON body)
  let isVonageDeliveryReceipt = false;
  if (event.httpMethod === "POST" && event.body) {
    try {
      const body = JSON.parse(event.body);
      // Vonage delivery receipts have these specific fields
      if (body.messageId && (body.status || body["err-code"] !== undefined)) {
        isVonageDeliveryReceipt = true;
        console.log("Received Vonage delivery receipt:", JSON.stringify(body));
      }
    } catch (e) {
      // Not JSON, continue with normal processing
    }
  }

  // Check for Vonage inbound message webhooks
  let isVonageInboundMessage = false;
  if (event.httpMethod === "POST" && event.body) {
    try {
      const body = JSON.parse(event.body);
      // Vonage inbound messages have these specific fields
      if (body.msisdn && body.to && body.text && body.messageId) {
        isVonageInboundMessage = true;
        console.log("Received Vonage inbound message:", JSON.stringify(body));
        // Extract data from Vonage webhook format
        from = body.msisdn;
        text = body.text;
      }
    } catch (e) {
      // Not JSON, continue with normal processing
    }
  }

  if (
    isDeliveryReceipt ||
    isStatusUpdate ||
    isVonageDeliveryReceipt ||
    !text ||
    typeof text !== "string" ||
    text.trim() === ""
  ) {
    console.log("Ignoring delivery receipt/status update or empty message");
    // IMPORTANT: Return 200 to stop Vonage from retrying
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Ignored delivery receipt",
      }),
    };
  }

  // Normalize phone number to consistent format
  const normalizePhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // Handle US phone numbers - ensure they start with 1
    if (cleaned.length === 10) {
      return `1${cleaned}`; // Add country code for 10-digit US numbers
    } else if (cleaned.startsWith("1") && cleaned.length === 11) {
      return cleaned; // Keep the full number with country code
    } else if (cleaned.length === 11 && !cleaned.startsWith("1")) {
      return cleaned; // Keep other 11-digit numbers as-is
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

  // Apply rate limiting
  const rateLimitResult = checkRateLimit(normalizedPhone);
  if (!rateLimitResult.allowed) {
    console.log(
      `Rate limit exceeded for ${normalizedPhone}: ${rateLimitResult.reason}`
    );
    const retryAfter = rateLimitResult.remainingBlockTime || 60; // Default to 60 seconds
    return {
      statusCode: 429, // Too Many Requests
      headers: {
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": new Date(
          Date.now() + retryAfter * 1000
        ).toISOString(),
      },
      body: JSON.stringify({
        error: "Rate limit exceeded",
        message: rateLimitResult.reason,
        retryAfter: retryAfter,
      }),
    };
  }

  console.log(
    `Rate limit check passed for ${normalizedPhone}. Remaining requests: ${rateLimitResult.remainingRequests}`
  );

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
        const existingPhones: string[] = [];
        for (const doc of allUsersSnapshot.docs) {
          const data = doc.data();
          if (data.phoneNumber && typeof data.phoneNumber === "string") {
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
    // Also update summary periodically (every 5 messages) for continuous learning
    const shouldUpdatePeriodically =
      history.length > 0 && history.length % 5 === 0;
    let updatedSummary = summary;
    let updatedProfile = profile;

    console.log(
      `History length: ${history.length}, Should update summary: ${shouldUpdateSummaryProfile}, Should update periodically: ${shouldUpdatePeriodically}`
    );
    console.log(`Current summary: "${summary}"`);

    if (shouldUpdateSummaryProfile || shouldUpdatePeriodically) {
      console.log(
        `Starting summary/profile update for history length: ${history.length}`
      );

      // Update summary & profile in a single AI call
      const analysisPrompt = [
        {
          role: "system",
          content: `You are an expert at analyzing conversations and extracting detailed user information. Return ONLY a valid JSON object with these keys:

"updatedSummary": A comprehensive summary that captures:
- Key topics discussed and user's interests
- Emotional states and mood patterns
- Important life events or updates mentioned
- User's communication style and preferences
- Any goals, challenges, or achievements discussed
- Personal details (work, family, hobbies, etc.)
- Relationship dynamics and social connections

"updatedProfile": A detailed user profile with these structured fields:
{
  "personality": "current personality setting",
  "relationship": "current relationship setting", 
  "name": "user's name if mentioned",
  "preferences": {
    "communication_style": "how they prefer to communicate",
    "topics_of_interest": ["array of topics they enjoy"],
    "emotional_patterns": "how they typically express emotions",
    "response_preferences": "how they like to be responded to"
  },
  "personal_info": {
    "age_range": "approximate age if mentioned",
    "occupation": "work/job details if mentioned",
    "location": "where they live if mentioned",
    "family_status": "family details if mentioned",
    "hobbies": ["array of hobbies/interests"],
    "goals": ["array of goals mentioned"],
    "challenges": ["array of challenges discussed"]
  },
  "conversation_history": {
    "frequent_topics": ["topics they talk about often"],
    "mood_patterns": "typical emotional states",
    "communication_frequency": "how often they message",
    "response_style": "how they typically respond",
    "shared_memories": ["important memories or experiences mentioned"]
  },
  "relationship_dynamics": {
    "trust_level": "how much they trust the AI",
    "comfort_level": "how comfortable they are sharing",
    "preferred_support_style": "how they like to be supported",
    "boundaries": "any boundaries they've set"
  },
  "learning_preferences": {
    "preferred_explanation_style": "how they like things explained",
    "motivation_factors": "what motivates them",
    "stress_triggers": "what causes them stress",
    "coping_mechanisms": "how they handle difficult situations"
  }
}

Analyze the conversation deeply and extract as much meaningful information as possible. Focus on patterns, preferences, and personal details that would help provide better, more personalized responses.`,
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

        // Clear history only when it reaches MAX_HISTORY
        if (shouldUpdateSummaryProfile) {
          history = [];
          console.log(`History cleared, new length: ${history.length}`);
        }
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

**Key things to remember:**
- Their communication style: ${
          updatedProfile.preferences?.communication_style || "Not specified"
        }
- Topics they're interested in: ${JSON.stringify(
          updatedProfile.preferences?.topics_of_interest || []
        )}
- Their typical mood: ${
          updatedProfile.conversation_history?.mood_patterns || "Not specified"
        }
- Their goals: ${JSON.stringify(updatedProfile.personal_info?.goals || [])}
- Their challenges: ${JSON.stringify(
          updatedProfile.personal_info?.challenges || []
        )}
- How they like to be supported: ${
          updatedProfile.relationship_dynamics?.preferred_support_style ||
          "Not specified"
        }
- What motivates them: ${
          updatedProfile.learning_preferences?.motivation_factors ||
          "Not specified"
        }
- Shared memories: ${JSON.stringify(
          updatedProfile.conversation_history?.shared_memories || []
        )}

**Recent conversations:** ${updatedSummary}

**Guidelines for better responses:**
- Reference their specific interests and hobbies when relevant
- Acknowledge their goals and offer encouragement
- Be sensitive to their stress triggers and coping mechanisms
- Use their preferred communication style
- Build on shared memories and experiences
- Show you understand their emotional patterns
- Respect any boundaries they've set

Remember: Be natural, be yourself (as ${
          personalityProfile.name
        }), and have a real conversation that shows you truly know and care about them.`,
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
      "status-report-req": false,
    });
    console.log("Vonage SMS API response:", JSON.stringify(smsResponse));

    // Check for SMS send errors and prevent retries
    if (smsResponse.messages && smsResponse.messages.length > 0) {
      const messageStatus = smsResponse.messages[0].status;
      if (messageStatus !== "0") {
        console.error(
          `SMS send failed with status ${messageStatus} for ${normalizedPhone}`
        );
        // Don't retry failed SMS sends - just log and continue
        console.log("SMS send failed, but continuing to avoid retry loops");
      }
    }

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
    console.error(`Function ${functionCallId}: Error processing SMS:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  } finally {
    console.log(`=== SMS Function Call ${functionCallId} Completed ===`);
  }
};

module.exports.handler = handler;
