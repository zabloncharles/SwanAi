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

function getCommunicationStyle(personality: string): string {
  const styles = {
    Professional: "Clear, professional, and goal-oriented",
    Mentor: "Wise, patient, and encouraging",
    Friendly: "Casual, warm, and approachable",
    MumFriend: "Nurturing, supportive, and caring",
    NurturingMom: "Loving, patient, and gentle",
    FunMom: "Energetic, playful, and enthusiastic",
    WiseDad: "Steady, thoughtful, and experienced",
    RomanticBoyfriend: "Romantic, devoted, and passionate",
    CaringGirlfriend: "Supportive, loving, and attentive",
    MotivationalCoach: "Inspiring, energetic, and encouraging",
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
