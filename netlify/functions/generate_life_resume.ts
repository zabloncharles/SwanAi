const { Handler } = require("@netlify/functions");

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

    // For now, return a simple life resume structure
    // In the future, this will use the full life resume generation system
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
      generatedAt: new Date().toISOString(),
      version: "1.0",
      seed: Date.now() + Math.random(),
    };

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: true,
        lifeResume,
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
