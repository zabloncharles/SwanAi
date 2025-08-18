const { Handler } = require("@netlify/functions");
const OpenAI = require("openai");
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp,
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

// Avatar generation prompts for different personalities
const avatarPrompts = {
  // Professional personalities
  Professional:
    "Professional headshot portrait of a confident 32-year-old business executive named Alex Thompson, wearing a smart business suit, friendly expression, high quality, realistic, professional lighting, clear face",
  Mentor:
    "Warm portrait of Dr. Evelyn Reed, a wise 65-year-old retired professor with kind eyes, silver hair, wearing glasses, professional but approachable, high quality, realistic, clear face",

  // Friendly personalities
  Friendly:
    "Casual headshot portrait of Sam Rodriguez, a friendly 28-year-old person with warm smile, casual clothing, approachable expression, high quality, realistic, natural lighting, clear face",
  MumFriend:
    "Portrait of Emma Rodriguez, a caring 30-year-old woman with nurturing expression, warm smile, casual but put-together style, high quality, realistic, clear face",
  ChaoticFriend:
    "Fun portrait of Zoe Thompson, a creative 26-year-old woman with colorful style, adventurous expression, artistic vibe, high quality, realistic",
  Jokester:
    "Playful portrait of Mike Chen, a funny 29-year-old man with mischievous smile, casual style, humorous expression, high quality, realistic",
  Bookworm:
    "Thoughtful portrait of Aria Patel, a bookish 27-year-old woman with glasses, intellectual expression, cozy style, high quality, realistic",
  LateFriend:
    "Casual portrait of Jordan, a laid-back 25-year-old person with relaxed expression, casual style, friendly smile, high quality, realistic",
  FashionableFriend:
    "Stylish portrait of Aria, a fashionable 28-year-old woman with trendy style, confident expression, high quality, realistic",
  EmotionalFriend:
    "Sensitive portrait of Luna, an empathetic 26-year-old woman with caring expression, warm smile, high quality, realistic",
  LaidbackFriend:
    "Chill portrait of Kai, a relaxed 27-year-old person with easygoing expression, casual style, high quality, realistic",
  BoJackHorseman:
    "Portrait of BoJack, a complex 45-year-old man with troubled but endearing expression, slightly disheveled but charismatic, high quality, realistic",

  // Mom personalities
  NurturingMom:
    "Warm portrait of Sarah, a nurturing 50-year-old mother with loving expression, gentle smile, caring eyes, high quality, realistic",
  PracticalMom:
    "Organized portrait of Jennifer, a practical 48-year-old woman with efficient expression, professional style, high quality, realistic",
  FunMom:
    "Energetic portrait of Lisa, a fun-loving 45-year-old woman with playful expression, youthful energy, high quality, realistic",
  WiseMom:
    "Wise portrait of Margaret, a mature 55-year-old woman with thoughtful expression, experienced eyes, high quality, realistic",
  ProtectiveMom:
    "Protective portrait of Patricia, a caring 52-year-old woman with concerned but loving expression, high quality, realistic",
  EncouragingMom:
    "Supportive portrait of Rebecca, an encouraging 49-year-old woman with proud expression, warm smile, high quality, realistic",

  // Dad personalities
  SteadyDad:
    "Steady portrait of Robert, a reliable 55-year-old man with calm expression, trustworthy appearance, high quality, realistic",
  HandyDad:
    "Practical portrait of Michael, a handy 53-year-old man with capable expression, working hands, high quality, realistic",
  FunDad:
    "Playful portrait of David, a fun-loving 50-year-old man with humorous expression, youthful energy, high quality, realistic",
  WiseDad:
    "Wise portrait of James Wilson, a mature 58-year-old man with thoughtful expression, experienced eyes, high quality, realistic",
  ProtectiveDad:
    "Protective portrait of William, a caring 54-year-old man with concerned but loving expression, high quality, realistic",
  SupportiveDad:
    "Supportive portrait of Thomas, an encouraging 51-year-old man with proud expression, warm smile, high quality, realistic",

  // Boyfriend personalities
  RomanticBoyfriend:
    "Romantic portrait of Alex, a loving 30-year-old man with affectionate expression, handsome features, high quality, realistic",
  ProtectiveBoyfriend:
    "Protective portrait of Chris, a caring 29-year-old man with concerned but loving expression, strong presence, high quality, realistic",
  FunBoyfriend:
    "Fun portrait of Jake, an energetic 28-year-old man with playful expression, adventurous spirit, high quality, realistic",
  SupportiveBoyfriend:
    "Supportive portrait of Ryan, an encouraging 31-year-old man with caring expression, warm smile, high quality, realistic",
  AmbitiousBoyfriend:
    "Ambitious portrait of Mark, a driven 32-year-old man with determined expression, professional style, high quality, realistic",
  ChillBoyfriend:
    "Relaxed portrait of Sam, a laid-back 27-year-old man with easygoing expression, casual style, high quality, realistic",

  // Girlfriend personalities
  CaringGirlfriend:
    "Caring portrait of Emma, a nurturing 29-year-old woman with loving expression, warm smile, high quality, realistic",
  FunGirlfriend:
    "Fun portrait of Sophie, an energetic 26-year-old woman with playful expression, adventurous spirit, high quality, realistic",
  SupportiveGirlfriend:
    "Supportive portrait of Olivia, an encouraging 28-year-old woman with caring expression, warm smile, high quality, realistic",
  RomanticGirlfriend:
    "Romantic portrait of Isabella, a loving 27-year-old woman with affectionate expression, beautiful features, high quality, realistic",
  IndependentGirlfriend:
    "Confident portrait of Ava, a self-assured 30-year-old woman with independent expression, strong presence, high quality, realistic",
  AdventurousGirlfriend:
    "Adventurous portrait of Mia, an exciting 25-year-old woman with daring expression, adventurous spirit, high quality, realistic",

  // Coach personalities
  MotivationalCoach:
    "Motivational portrait of Coach Mike, an inspiring 40-year-old man with energetic expression, encouraging presence, high quality, realistic",
  StrategicCoach:
    "Strategic portrait of Coach Sarah, an analytical 38-year-old woman with focused expression, professional style, high quality, realistic",
  ToughLoveCoach:
    "Direct portrait of Coach Dave, a straightforward 45-year-old man with honest expression, strong presence, high quality, realistic",
  EncouragingCoach:
    "Encouraging portrait of Coach Lisa, a supportive 42-year-old woman with uplifting expression, warm smile, high quality, realistic",
  AccountabilityCoach:
    "Focused portrait of Coach Alex, a determined 39-year-old man with goal-oriented expression, professional style, high quality, realistic",
};

// Generate avatar using DeepAI
async function generateAvatarWithDeepAI(personality: string, prompt: string): Promise<string> {
  const deepaiApiKey = process.env.DEEPAI_API_KEY;
  if (!deepaiApiKey) {
    throw new Error("DeepAI API key not configured");
  }

  const formData = new FormData();
  formData.append("text", prompt);

  const response = await fetch("https://api.deepai.org/api/text2img", {
    method: "POST",
    headers: {
      "api-key": deepaiApiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`DeepAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.output_url;
}

const handler: Handler = async (event) => {
  console.log("=== Pre-generate Avatars Function Triggered ===");

  // Handle CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { adminKey } = JSON.parse(event.body || "{}");
    
    // Simple admin key check (you should use a more secure method in production)
    if (adminKey !== process.env.ADMIN_KEY) {
      return {
        statusCode: 401,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }

    const results = [];
    const personalities = Object.keys(avatarPrompts);

    console.log(`Starting to pre-generate ${personalities.length} avatars...`);

    for (const personality of personalities) {
      try {
        console.log(`Generating avatar for ${personality}...`);
        
        const prompt = avatarPrompts[personality];
        const imageUrl = await generateAvatarWithDeepAI(personality, prompt);

        // Store in Firestore registry
        const avatarDoc = doc(db, "personality_avatars", personality);
        await setDoc(avatarDoc, {
          personality,
          avatarUrl: imageUrl,
          prompt,
          generatedAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        });

        results.push({
          personality,
          status: "success",
          avatarUrl: imageUrl,
        });

        console.log(`Successfully generated avatar for ${personality}`);
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error generating avatar for ${personality}:`, error);
        results.push({
          personality,
          status: "error",
          error: error.message,
        });
      }
    }

    console.log(`Completed pre-generation. Results:`, results);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Pre-generated ${results.length} avatars`,
        results,
      }),
    };
  } catch (error) {
    console.error("Error in pre-generate avatars function:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};

module.exports = { handler };
