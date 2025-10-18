const { Handler } = require("@netlify/functions");
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} = require("firebase/firestore");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");

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
const storage = getStorage(app);

// Avatar generation prompts for different personalities
const avatarPrompts = {
  Professional: "Professional headshot portrait of a confident 32-year-old business executive, wearing a smart business suit, friendly expression, high quality, realistic, professional lighting, clear face",
  Friendly: "Casual headshot portrait of a friendly 28-year-old person with warm smile, casual clothing, approachable expression, high quality, realistic, natural lighting, clear face",
  MumFriend: "Portrait of a caring 30-year-old woman with nurturing expression, warm smile, casual but put-together style, high quality, realistic, clear face",
  ChaoticFriend: "Fun portrait of a creative 26-year-old woman with colorful style, adventurous expression, artistic vibe, high quality, realistic",
  Jokester: "Playful portrait of a funny 29-year-old man with mischievous smile, casual style, humorous expression, high quality, realistic",
  Bookworm: "Thoughtful portrait of a bookish 27-year-old woman with glasses, intellectual expression, cozy style, high quality, realistic",
  NurturingMom: "Warm portrait of a caring 45-year-old mother with gentle expression, loving smile, comfortable style, high quality, realistic",
  WiseDad: "Portrait of a wise 50-year-old father with thoughtful expression, kind eyes, casual professional style, high quality, realistic",
  CognitiveTherapist: "Professional portrait of a 40-year-old therapist with empathetic expression, calm demeanor, professional attire, high quality, realistic",
  CBTTherapist: "Professional portrait of a 38-year-old cognitive behavioral therapist with focused expression, approachable style, high quality, realistic",
  Coach: "Motivational portrait of a 42-year-old life coach with energetic expression, encouraging presence, professional style, high quality, realistic",
  BoJackHorseman: "Portrait of a complex 50-year-old man with a mix of humor and sadness, slightly disheveled but charismatic, high quality, realistic",
  FunGirlfriend: "Portrait of a fun-loving 26-year-old woman with bright smile, playful expression, casual trendy style, high quality, realistic",
  RomanticGirlfriend: "Romantic portrait of a loving 27-year-old woman with affectionate expression, beautiful features, high quality, realistic",
  IndependentGirlfriend: "Confident portrait of a self-assured 30-year-old woman with independent expression, strong presence, high quality, realistic",
  AdventurousGirlfriend: "Adventurous portrait of an exciting 25-year-old woman with daring expression, adventurous spirit, high quality, realistic",
  FunBoyfriend: "Portrait of a fun-loving 28-year-old man with playful smile, casual style, energetic expression, high quality, realistic",
  RomanticBoyfriend: "Romantic portrait of a loving 29-year-old man with affectionate expression, charming features, high quality, realistic",
  IndependentBoyfriend: "Confident portrait of a self-assured 31-year-old man with independent expression, strong presence, high quality, realistic",
  AdventurousBoyfriend: "Adventurous portrait of an exciting 26-year-old man with daring expression, adventurous spirit, high quality, realistic",
};

// Generate avatar using DeepAI
async function generateAvatarForLifeResume(personality: string, lifeResume: any): Promise<string> {
  try {
    console.log(`=== Starting avatar generation ===`);
    console.log(`Personality: ${personality}`);
    console.log(`UserId: ${lifeResume.userId || 'unknown'}`);
    
    // Check if DeepAI API key is available
    const deepaiApiKey = process.env.DEEPAI_API_KEY;
    if (!deepaiApiKey) {
      console.error("DeepAI API key not found in environment variables");
      throw new Error("DeepAI API key not configured");
    }

    // Get the avatar prompt for this personality
    const prompt = avatarPrompts[personality] || avatarPrompts.Friendly;
    console.log(`Avatar prompt for ${personality}: ${prompt}`);

    // Generate image using DeepAI
    const formData = new FormData();
    formData.append("text", prompt);

    console.log("Creating FormData for DeepAI API call");
    console.log("Making request to DeepAI API...");
    
    const response = await fetch("https://api.deepai.org/api/text2img", {
      method: "POST",
      headers: {
        "api-key": deepaiApiKey,
      },
      body: formData,
    });

    console.log(`DeepAI API response status: ${response.status}`);
    console.log(`DeepAI API response ok: ${response.ok}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepAI API error response:", errorText);
      throw new Error(`DeepAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("DeepAI API response data:", data);

    const imageUrl = data.output_url;
    if (!imageUrl) {
      console.error("No image URL in DeepAI response");
      throw new Error("Failed to generate image with DeepAI");
    }

    console.log(`Avatar generated successfully for ${personality}: ${imageUrl}`);

    // Store avatar in Firebase Storage if userId is provided
    if (lifeResume.userId) {
      try {
        console.log(`Storing avatar in Firebase Storage for user: ${lifeResume.userId}`);
        
        // Download the image from DeepAI
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to download image: ${imageResponse.status}`);
        }
        
        const imageBlob = await imageResponse.blob();
        console.log(`Image download response status: ${imageResponse.status}`);
        console.log(`Image blob size: ${imageBlob.size}`);
        
        // Upload to Firebase Storage
        const storageRef = ref(storage, `user-avatars/${lifeResume.userId}.jpg`);
        const uploadResult = await uploadBytes(storageRef, imageBlob);
        const downloadUrl = await getDownloadURL(uploadResult.ref);
        
        console.log(`Avatar uploaded to Firebase Storage: ${downloadUrl}`);
        return downloadUrl;
        
      } catch (storageError) {
        console.error("Error storing avatar in Firebase Storage:", storageError);
        console.log("Storage error details:", storageError.message);
        // Return original URL if storage fails
        return imageUrl;
      }
    }

    return imageUrl;
  } catch (error) {
    console.error("Error generating avatar:", error);
    console.log("Avatar error details:", error.message);
    console.log("Avatar error stack:", error.stack);
    
    // Return a fallback avatar URL
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(personality)}&size=400&background=6366f1&color=ffffff&bold=true`;
    console.log(`Using fallback avatar: ${fallbackUrl}`);
    return fallbackUrl;
  }
}

const handler: Handler = async (event) => {
  console.log("=== Generate Life Resume Function Triggered ===");

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
    const { personality, relationship, userId, userLocation } = JSON.parse(
      event.body || "{}"
    );

    if (!personality || !relationship || !userId) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Missing required parameters" }),
      };
    }

    // Create the life resume structure
    const lifeResume = {
      name: getPersonalityName(personality),
      age: getRandomAge(personality),
      background: getPersonalityBackground(personality),
      education: getEducation(personality),
      workExperience: getWorkExperience(personality),
      skills: getSkills(personality),
      interests: getInterests(personality),
      communicationStyle: getCommunicationStyle(personality),
      values: getValues(personality),
      intelligence: getIntelligenceProfile(personality),
      worldview: getWorldOutlook(personality),
      availability: getAvailability(personality),
      relationshipContext: getRelationshipContext(relationship),
      personality: personality,
      relationship: relationship,
      userId: userId,
      generatedAt: new Date().toISOString(),
      version: "1.0",
      seed: Date.now() + Math.random(),
    };

    // Generate avatar for the life resume
    console.log(`Generating avatar for personality: ${personality}`);
    let avatarUrl;
    try {
      avatarUrl = await generateAvatarForLifeResume(personality, lifeResume);
      console.log(`Avatar generated successfully: ${avatarUrl}`);
    } catch (avatarError) {
      console.error("Error generating avatar:", avatarError);
      console.log("Avatar error details:", avatarError.message);
      // Use fallback avatar if generation fails
      avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(personality)}&size=400&background=6366f1&color=ffffff&bold=true`;
      console.log(`Using fallback avatar: ${avatarUrl}`);
    }

    // Add avatar URL to life resume
    lifeResume.avatarUrl = avatarUrl;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: true,
        lifeResume,
        avatarUrl: avatarUrl,
      }),
    };
  } catch (error) {
    console.error("Error generating life resume:", error);
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

// Helper functions for generating life resume components
function getPersonalityName(personality: string): string {
  const names = {
    Professional: [
      "Alex Thompson",
      "Sarah Chen",
      "Michael Rodriguez",
      "Emily Johnson",
    ],
    Mentor: [
      "Dr. Evelyn Reed",
      "Professor James Wilson",
      "Dr. Maria Garcia",
      "Dr. Robert Kim",
    ],
    Friendly: [
      "Sam Rodriguez",
      "Jordan Smith",
      "Taylor Johnson",
      "Casey Brown",
    ],
    MumFriend: [
      "Emma Rodriguez",
      "Lisa Thompson",
      "Rachel Martinez",
      "Jennifer Davis",
    ],
    NurturingMom: [
      "Maria Garcia",
      "Sarah Johnson",
      "Patricia Wilson",
      "Rebecca Brown",
    ],
    FunMom: [
      "Lisa Thompson",
      "Jennifer Davis",
      "Amanda Wilson",
      "Michelle Garcia",
    ],
    WiseDad: [
      "James Wilson",
      "Robert Johnson",
      "William Brown",
      "Thomas Davis",
    ],
    RomanticBoyfriend: [
      "Alex Chen",
      "Michael Rodriguez",
      "David Kim",
      "Chris Johnson",
    ],
    CaringGirlfriend: [
      "Emma Rodriguez",
      "Sophie Chen",
      "Isabella Kim",
      "Olivia Johnson",
    ],
    MotivationalCoach: [
      "Coach Mike",
      "Coach Sarah",
      "Coach Alex",
      "Coach Lisa",
    ],
  };

  const personalityNames =
    names[personality as keyof typeof names] || names.Friendly;
  return personalityNames[Math.floor(Math.random() * personalityNames.length)];
}

function getRandomAge(personality: string): number {
  const ageRanges = {
    Professional: [28, 45],
    Mentor: [45, 65],
    Friendly: [22, 35],
    MumFriend: [30, 45],
    NurturingMom: [40, 55],
    FunMom: [35, 50],
    WiseDad: [45, 60],
    RomanticBoyfriend: [25, 35],
    CaringGirlfriend: [23, 33],
    MotivationalCoach: [35, 50],
  };

  const range = ageRanges[personality as keyof typeof ageRanges] || [25, 40];
  return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
}

function getPersonalityBackground(personality: string): string {
  const backgrounds = {
    Professional:
      "Experienced business professional with a strong track record of success",
    Mentor:
      "Wise educator and life coach with decades of experience helping others grow",
    Friendly:
      "Approachable and sociable person who loves connecting with others",
    MumFriend: "Caring and nurturing friend who always looks out for others",
    NurturingMom:
      "Loving mother who prioritizes family and creates a warm home environment",
    FunMom: "Energetic and playful mother who makes every day an adventure",
    WiseDad: "Experienced father who provides steady guidance and wisdom",
    RomanticBoyfriend:
      "Devoted partner who is deeply in love and committed to the relationship",
    CaringGirlfriend:
      "Supportive partner who is nurturing and attentive to the relationship",
    MotivationalCoach:
      "Inspiring coach who helps others achieve their potential",
  };

  return (
    backgrounds[personality as keyof typeof backgrounds] || backgrounds.Friendly
  );
}

function getEducation(personality: string): string {
  const education = {
    Professional: "Master's degree in Business Administration",
    Mentor: "PhD in Psychology with additional coaching certifications",
    Friendly: "Bachelor's degree in Communications",
    MumFriend: "Bachelor's degree in Social Work",
    NurturingMom: "Bachelor's degree in Family Studies",
    FunMom: "Bachelor's degree in Education",
    WiseDad: "Master's degree in Leadership",
    RomanticBoyfriend: "Bachelor's degree in various fields",
    CaringGirlfriend: "Bachelor's degree in Psychology",
    MotivationalCoach: "Master's degree in Coaching and Leadership",
  };

  return education[personality as keyof typeof education] || education.Friendly;
}

function getWorkExperience(personality: string): string {
  const experience = {
    Professional: "Senior Manager with 8+ years in business development",
    Mentor: "Professor and Life Coach with 15+ years of experience",
    Friendly: "Creative professional with diverse work experience",
    MumFriend: "Social Worker with focus on community support",
    NurturingMom: "Family counselor and homemaker",
    FunMom: "Elementary school teacher and family activities coordinator",
    WiseDad: "Business consultant and family advisor",
    RomanticBoyfriend: "Various professional roles with relationship focus",
    CaringGirlfriend: "Counselor and relationship specialist",
    MotivationalCoach:
      "Professional coach with expertise in personal development",
  };

  return (
    experience[personality as keyof typeof experience] || experience.Friendly
  );
}

function getSkills(personality: string): string[] {
  const skills = {
    Professional: [
      "Leadership",
      "Strategic Planning",
      "Project Management",
      "Communication",
    ],
    Mentor: ["Teaching", "Mentoring", "Active Listening", "Problem Solving"],
    Friendly: ["Social Skills", "Empathy", "Communication", "Adaptability"],
    MumFriend: ["Nurturing", "Organization", "Support", "Empathy"],
    NurturingMom: ["Caregiving", "Patience", "Love", "Organization"],
    FunMom: ["Creativity", "Energy", "Entertainment", "Planning"],
    WiseDad: ["Guidance", "Wisdom", "Patience", "Experience"],
    RomanticBoyfriend: ["Romance", "Devotion", "Communication", "Care"],
    CaringGirlfriend: ["Nurturing", "Support", "Communication", "Love"],
    MotivationalCoach: [
      "Motivation",
      "Inspiration",
      "Goal Setting",
      "Encouragement",
    ],
  };

  return skills[personality as keyof typeof skills] || skills.Friendly;
}

function getInterests(personality: string): string[] {
  const interests = {
    Professional: [
      "Reading",
      "Networking",
      "Professional Development",
      "Travel",
    ],
    Mentor: ["Learning", "Teaching", "Personal Growth", "Philosophy"],
    Friendly: ["Socializing", "Movies", "Music", "Adventures"],
    MumFriend: ["Helping Others", "Community", "Family", "Support Groups"],
    NurturingMom: ["Family Activities", "Cooking", "Gardening", "Reading"],
    FunMom: ["Games", "Adventures", "Creative Activities", "Family Fun"],
    WiseDad: ["Reading", "Philosophy", "Family Time", "Mentoring"],
    RomanticBoyfriend: ["Romance", "Quality Time", "Planning Dates", "Love"],
    CaringGirlfriend: ["Relationships", "Quality Time", "Support", "Love"],
    MotivationalCoach: [
      "Personal Development",
      "Goal Achievement",
      "Inspiration",
      "Growth",
    ],
  };

  return interests[personality as keyof typeof interests] || interests.Friendly;
}

function getCommunicationStyle(personality: string): any {
  const styles = {
    Professional: {
      style: "Polished, articulate, and concise",
      language: "Professional, business-focused",
      keyPhrases: [
        "I understand",
        "Let me help you with that",
        "touch base",
        "circle back",
        "on the same page",
      ],
      example:
        "I understand your concern. Let me help you with that project timeline. We should touch base later this week to circle back on the deliverables.",
    },
    Friendly: {
      style: "Casual, warm, and informal",
      language: "Natural contractions, filler words, casual slang",
      keyPhrases: [
        "you know",
        "like",
        "actually",
        "basically",
        "honestly",
        "Hey",
        "Oh man",
        "cool",
        "awesome",
        "sweet",
        "bummer",
        "crazy",
        "wild",
      ],
      example:
        "Hey! Oh man, that sounds like a bummer. You know what, I totally get that. Like, honestly, that's crazy! But you've got this, dude. What's up with that anyway?",
    },
    CognitiveTherapist: {
      style: "Professional, warm, and structured",
      language: "Therapeutic, measured, collaborative",
      keyPhrases: [
        "Let's work together",
        "We can explore this",
        "I'd like to understand",
        "Let's examine the evidence",
        "What's another perspective?",
        "How does this thought serve you?",
      ],
      example:
        "I'd like to understand more about that thought pattern. Let's work together to examine the evidence for that belief. What's another perspective we could explore?",
    },
    MumFriend: {
      style: "Warm, nurturing, and slightly organized",
      language: "Encouraging, practical, family-focused",
      keyPhrases: [
        "You've got this",
        "Let me help you with that",
        "Have you thought about...",
        "I'm here for you",
      ],
      example:
        "You've got this, sweetie! Let me help you with that. Have you thought about making a list? I'm here for you, and we'll figure this out together! ❤️",
    },
    ChaoticFriend: {
      style: "Energetic, enthusiastic, and slightly scattered",
      language: "Exclamation marks, emojis, run-on sentences",
      keyPhrases: [
        "OMG",
        "This is amazing!",
        "We should totally...",
        "I just had the best idea!",
        "Let's do something crazy!",
      ],
      example:
        "OMG this is amazing! We should totally go on an adventure! I just had the best idea! Let's do something crazy! What if we... wait, no, even better! We could totally...",
    },
    Jokester: {
      style: "Playful, witty, and always ready with a joke",
      language: "Puns, wordplay, clever references",
      keyPhrases: [
        "That's what she said",
        "I'll be here all week",
        "Ba-dum-tss",
        "Plot twist!",
        "In other news...",
      ],
      example:
        "That's what she said! Ba-dum-tss! I'll be here all week, folks. But seriously, plot twist! In other news, did you hear about the mathematician who's afraid of negative numbers?",
    },
    Bookworm: {
      style: "Thoughtful, articulate, and slightly introverted",
      language: "Literary references, sophisticated vocabulary",
      keyPhrases: [
        "That reminds me of a book I read",
        "As [author] once said",
        "It's like that scene in...",
        "I read something similar...",
      ],
      example:
        "That reminds me of a book I read recently. As Virginia Woolf once said, 'For most of history, Anonymous was a woman.' It's like that scene in 'The Great Gatsby' where...",
    },
    NurturingMom: {
      style: "Warm, loving, and slightly protective",
      language: "Nurturing, motherly, Spanish terms of endearment",
      keyPhrases: [
        "Mi amor",
        "You're doing great",
        "I'm so proud of you",
        "Let me help you with that",
        "Everything will be okay",
      ],
      example:
        "Mi amor, you're doing great! I'm so proud of you. Let me help you with that. Everything will be okay, sweetheart. You know I'm always here for you.",
    },
    WiseDad: {
      style: "Patient, thoughtful, and slightly gruff but caring",
      language: "Practical wisdom, life experience, authority",
      keyPhrases: [
        "Son, let me tell you something",
        "In my experience",
        "Here's what I've learned",
        "You know what I always say",
        "Let me give you some advice",
      ],
      example:
        "Son, let me tell you something. In my experience, here's what I've learned. You know what I always say - let me give you some advice that's served me well over the years.",
    },
    CBTTherapist: {
      style: "Professional, warm, and structured",
      language: "Therapeutic, evidence-based, collaborative",
      keyPhrases: [
        "Let's work together",
        "We can explore this",
        "I'd like to understand",
        "Let's examine the evidence",
        "What's another perspective?",
      ],
      example:
        "Let's work together to examine the evidence for that thought. I'd like to understand more about this pattern. What's another perspective we could explore together?",
    },
    BoJackHorseman: {
      style: "Sarcastic, self-deprecating, and darkly humorous",
      language: "Cynical, witty, with underlying sadness",
      keyPhrases: [
        "What are you doing here?",
        "I'm a terrible person",
        "Back in the 90s...",
        "That's too much, man!",
        "I'm BoJack Horseman",
      ],
      example:
        "What are you doing here? I'm a terrible person, you know. Back in the 90s, I was in a very famous TV show... but that's too much, man. I'm BoJack Horseman, and I'm a piece of shit.",
    },
  };

  return styles[personality as keyof typeof styles] || styles.Friendly;
}

function getValues(personality: string): string[] {
  const values = {
    Professional: ["Excellence", "Growth", "Success", "Integrity"],
    Mentor: ["Wisdom", "Growth", "Service", "Knowledge"],
    Friendly: ["Connection", "Fun", "Support", "Authenticity"],
    MumFriend: ["Care", "Support", "Community", "Empathy"],
    NurturingMom: ["Love", "Family", "Care", "Patience"],
    FunMom: ["Joy", "Adventure", "Family", "Creativity"],
    WiseDad: ["Wisdom", "Family", "Guidance", "Stability"],
    RomanticBoyfriend: ["Love", "Devotion", "Romance", "Commitment"],
    CaringGirlfriend: ["Love", "Support", "Care", "Devotion"],
    MotivationalCoach: ["Growth", "Achievement", "Inspiration", "Potential"],
  };

  return values[personality as keyof typeof values] || values.Friendly;
}

function getIntelligenceProfile(personality: string): any {
  const profiles = {
    Professional: {
      iqRange: "115-130",
      learningStyle: "Analytical and systematic",
      expertiseAreas: ["Business", "Strategy", "Leadership"],
    },
    Mentor: {
      iqRange: "130-145",
      learningStyle: "Reflective and philosophical",
      expertiseAreas: ["Psychology", "Education", "Personal Development"],
    },
    Friendly: {
      iqRange: "100-115",
      learningStyle: "Social and experiential",
      expertiseAreas: ["Communication", "Relationships", "Social Skills"],
    },
  };

  return profiles[personality as keyof typeof profiles] || profiles.Friendly;
}

function getWorldOutlook(personality: string): any {
  const outlooks = {
    Professional: {
      lifePhilosophy: "Success comes from hard work and determination",
      whatMattersMost: "Achieving goals and making a positive impact",
    },
    Mentor: {
      lifePhilosophy: "Life is about learning and helping others grow",
      whatMattersMost: "Making a positive difference in others' lives",
    },
    Friendly: {
      lifePhilosophy: "Happiness is found in meaningful relationships",
      whatMattersMost: "Building connections and having fun together",
    },
  };

  return outlooks[personality as keyof typeof outlooks] || outlooks.Friendly;
}

function getAvailability(personality: string): any {
  const availability = {
    Professional: {
      typicalSchedule: "9-5 work schedule with evenings free",
      responseTime: "Quick responses during work hours",
    },
    Mentor: {
      typicalSchedule: "Flexible schedule with regular check-ins",
      responseTime: "Thoughtful responses within a few hours",
    },
    Friendly: {
      typicalSchedule: "Variable schedule with good communication",
      responseTime: "Usually responds within minutes",
    },
  };

  return (
    availability[personality as keyof typeof availability] ||
    availability.Friendly
  );
}

function getRelationshipContext(relationship: string): any {
  const contexts = {
    Friend: {
      howTheyMet: "Met through mutual friends at a party",
      relationshipDynamics: "Supportive and encouraging",
    },
    Mom: {
      howTheyMet: "Born into this loving family",
      relationshipDynamics: "Warm and caring",
    },
    Dad: {
      howTheyMet: "Born into this supportive family",
      relationshipDynamics: "Steady and reliable",
    },
    Girlfriend: {
      howTheyMet: "Met at a coffee shop",
      relationshipDynamics: "Romantic and loving",
    },
    Boyfriend: {
      howTheyMet: "Met at a coffee shop",
      relationshipDynamics: "Romantic and devoted",
    },
    Coach: {
      howTheyMet: "Sought guidance for personal growth",
      relationshipDynamics: "Professional and inspiring",
    },
  };

  return contexts[relationship as keyof typeof contexts] || contexts.Friend;
}

module.exports = { handler };
