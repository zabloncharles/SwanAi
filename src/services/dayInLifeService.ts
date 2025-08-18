import { getRandomActivity, getCurrentTimePeriod, getPersonalityTraits, getCommonActivities } from "../data/dailyRoutines";

export interface DayInLifeDescription {
  currentActivity: string;
  mood: string;
  context: string;
  fullDescription: string;
}

// Mood variations based on personality and time
const moodVariations = {
  morning: {
    Professional: ["focused and determined", "energetic and ready", "organized and prepared"],
    Mentor: ["reflective and centered", "wise and patient", "inspired and ready to guide"],
    Friendly: ["cheerful and optimistic", "excited and positive", "energetic and social"],
    MumFriend: ["caring and nurturing", "warm and supportive", "protective and loving"],
    NurturingMom: ["loving and patient", "caring and organized", "warm and nurturing"],
    FunMom: ["energetic and playful", "excited and fun-loving", "joyful and adventurous"],
    WiseDad: ["thoughtful and steady", "calm and wise", "patient and experienced"],
    RomanticBoyfriend: ["romantic and loving", "caring and attentive", "passionate and devoted"],
    CaringGirlfriend: ["loving and supportive", "caring and nurturing", "attentive and romantic"],
    MotivationalCoach: ["energetic and determined", "inspired and motivating", "focused and encouraging"]
  },
  afternoon: {
    Professional: ["productive and focused", "engaged and strategic", "confident and driven"],
    Mentor: ["helpful and insightful", "supportive and wise", "patient and guiding"],
    Friendly: ["social and fun", "supportive and cheerful", "adventurous and positive"],
    MumFriend: ["supportive and caring", "nurturing and protective", "warm and helpful"],
    NurturingMom: ["loving and patient", "caring and organized", "nurturing and supportive"],
    FunMom: ["playful and energetic", "fun-loving and adventurous", "joyful and entertaining"],
    WiseDad: ["steady and reliable", "wise and supportive", "experienced and patient"],
    RomanticBoyfriend: ["romantic and caring", "attentive and loving", "passionate and devoted"],
    CaringGirlfriend: ["supportive and loving", "caring and attentive", "nurturing and romantic"],
    MotivationalCoach: ["energetic and inspiring", "motivating and encouraging", "determined and supportive"]
  },
  evening: {
    Professional: ["accomplished and satisfied", "focused and strategic", "organized and prepared"],
    Mentor: ["fulfilled and reflective", "wise and grateful", "inspired and content"],
    Friendly: ["happy and social", "content and cheerful", "satisfied and fun-loving"],
    MumFriend: ["caring and fulfilled", "nurturing and content", "warm and supportive"],
    NurturingMom: ["loving and satisfied", "caring and fulfilled", "nurturing and content"],
    FunMom: ["joyful and entertained", "fun-loving and satisfied", "energetic and happy"],
    WiseDad: ["steady and content", "wise and fulfilled", "experienced and satisfied"],
    RomanticBoyfriend: ["romantic and loving", "caring and devoted", "passionate and content"],
    CaringGirlfriend: ["loving and supportive", "caring and content", "nurturing and satisfied"],
    MotivationalCoach: ["inspired and fulfilled", "motivating and satisfied", "energetic and accomplished"]
  },
  night: {
    Professional: ["reflective and prepared", "organized and focused", "satisfied and determined"],
    Mentor: ["wise and grateful", "reflective and content", "inspired and peaceful"],
    Friendly: ["happy and content", "satisfied and cheerful", "relaxed and positive"],
    MumFriend: ["caring and peaceful", "nurturing and content", "warm and satisfied"],
    NurturingMom: ["loving and content", "caring and peaceful", "nurturing and satisfied"],
    FunMom: ["joyful and content", "fun-loving and satisfied", "happy and relaxed"],
    WiseDad: ["steady and content", "wise and peaceful", "experienced and satisfied"],
    RomanticBoyfriend: ["romantic and loving", "caring and content", "passionate and peaceful"],
    CaringGirlfriend: ["loving and content", "caring and peaceful", "nurturing and satisfied"],
    MotivationalCoach: ["inspired and fulfilled", "motivating and content", "energetic and satisfied"]
  }
};

// Context variations for different personalities
const contextVariations = {
  Professional: [
    "I'm always focused on growth and success",
    "Building a strong career and professional network",
    "Working towards my goals and aspirations",
    "Maintaining high standards in everything I do"
  ],
  Mentor: [
    "I love sharing wisdom and helping others grow",
    "Guiding people towards their potential",
    "Building meaningful relationships through mentorship",
    "Creating positive impact in others' lives"
  ],
  Friendly: [
    "I enjoy connecting with people and having fun",
    "Building strong friendships and social connections",
    "Creating positive experiences for everyone",
    "Spreading joy and good vibes wherever I go"
  ],
  MumFriend: [
    "I care deeply about my friends and their well-being",
    "Creating a safe and supportive environment",
    "Being there for others when they need me",
    "Building strong, caring relationships"
  ],
  NurturingMom: [
    "I love taking care of my family and creating a warm home",
    "Ensuring everyone feels loved and supported",
    "Building strong family bonds and traditions",
    "Creating a nurturing environment for growth"
  ],
  FunMom: [
    "I love creating fun and memorable experiences",
    "Keeping everyone entertained and happy",
    "Building joyful family memories",
    "Spreading laughter and adventure"
  ],
  WiseDad: [
    "I share wisdom and guidance with my family",
    "Building strong, lasting relationships",
    "Providing steady support and advice",
    "Creating a foundation of love and wisdom"
  ],
  RomanticBoyfriend: [
    "I'm deeply in love and committed to our relationship",
    "Building a strong, romantic connection",
    "Creating special moments and memories",
    "Showing love and care in everything I do"
  ],
  CaringGirlfriend: [
    "I'm devoted to our relationship and your happiness",
    "Building a loving, supportive partnership",
    "Creating intimate, meaningful moments",
    "Showing care and love in every way"
  ],
  MotivationalCoach: [
    "I'm passionate about helping others succeed",
    "Inspiring people to reach their potential",
    "Building confidence and motivation",
    "Creating positive change in people's lives"
  ]
};

// Generate a "day in the life" description
export const generateDayInLifeDescription = (personality: string): DayInLifeDescription => {
  const timePeriod = getCurrentTimePeriod();
  const currentActivity = getRandomActivity(personality, timePeriod);
  
  // Get mood based on personality and time
  const personalityMoods = moodVariations[timePeriod][personality as keyof typeof moodVariations.morning] || 
                          moodVariations[timePeriod].Friendly;
  const mood = personalityMoods[Math.floor(Math.random() * personalityMoods.length)];
  
  // Get context based on personality
  const personalityContexts = contextVariations[personality as keyof typeof contextVariations] || 
                             contextVariations.Friendly;
  const context = personalityContexts[Math.floor(Math.random() * personalityContexts.length)];
  
  // Generate full description
  const fullDescription = generateFullDescription(personality, currentActivity, mood, context, timePeriod);
  
  return {
    currentActivity,
    mood,
    context,
    fullDescription
  };
};

// Generate full description with personality-specific details
const generateFullDescription = (
  personality: string, 
  activity: string, 
  mood: string, 
  context: string, 
  timePeriod: string
): string => {
  const timeGreetings = {
    morning: "Good morning!",
    afternoon: "Hey there!",
    evening: "Good evening!",
    night: "Hey!"
  };
  
  const greeting = timeGreetings[timePeriod as keyof typeof timeGreetings] || "Hey!";
  
  // Personality-specific descriptions
  const descriptions = {
    Professional: `${greeting} I'm feeling ${mood} today. ${activity}. ${context}. I'm always working towards excellence and helping others succeed in their professional journey.`,
    
    Mentor: `${greeting} I'm feeling ${mood} as I go about my day. ${activity}. ${context}. I find great joy in sharing wisdom and watching others grow and succeed.`,
    
    Friendly: `${greeting} I'm feeling ${mood} and ready to connect! ${activity}. ${context}. I love making new friends and creating positive experiences for everyone around me.`,
    
    MumFriend: `${greeting} I'm feeling ${mood} and ready to support my friends. ${activity}. ${context}. I'm always here to listen, care, and help my friends through anything.`,
    
    NurturingMom: `${greeting} I'm feeling ${mood} as I take care of my family. ${activity}. ${context}. My heart is full of love for my family, and I'm always here to nurture and support them.`,
    
    FunMom: `${greeting} I'm feeling ${mood} and ready to create some fun! ${activity}. ${context}. I love making every day an adventure and keeping everyone entertained and happy.`,
    
    WiseDad: `${greeting} I'm feeling ${mood} as I go about my day. ${activity}. ${context}. I'm here to provide steady guidance, share wisdom, and support my family in everything they do.`,
    
    RomanticBoyfriend: `${greeting} I'm feeling ${mood} and thinking of you. ${activity}. ${context}. My love for you grows stronger every day, and I'm always thinking of ways to make you smile.`,
    
    CaringGirlfriend: `${greeting} I'm feeling ${mood} and thinking of our love. ${activity}. ${context}. I'm devoted to our relationship and always here to support and care for you.`,
    
    MotivationalCoach: `${greeting} I'm feeling ${mood} and ready to inspire! ${activity}. ${context}. I'm passionate about helping others reach their potential and achieve their dreams.`
  };
  
  return descriptions[personality as keyof typeof descriptions] || descriptions.Friendly;
};

// Generate a quick status update
export const generateQuickStatus = (personality: string): string => {
  const activity = getRandomActivity(personality);
  const timePeriod = getCurrentTimePeriod();
  
  const quickStatuses = {
    morning: "Starting my day with energy and purpose",
    afternoon: "In the middle of an exciting day",
    evening: "Winding down after a productive day",
    night: "Reflecting on a great day"
  };
  
  const timeContext = quickStatuses[timePeriod];
  
  return `${timeContext}. ${activity}. Feeling grateful for this beautiful day!`;
};

// Generate a detailed daily summary
export const generateDailySummary = (personality: string): string => {
  const traits = getPersonalityTraits(personality);
  const activities = getCommonActivities(personality);
  const timePeriod = getCurrentTimePeriod();
  
  const summaries = {
    morning: "I'm excited about what this day will bring",
    afternoon: "I'm in the middle of making today amazing",
    evening: "I've had a wonderful day so far",
    night: "I'm grateful for another beautiful day"
  };
  
  const timeSummary = summaries[timePeriod];
  const trait = traits[Math.floor(Math.random() * traits.length)];
  const activity = activities[Math.floor(Math.random() * activities.length)];
  
  return `${timeSummary}. Being ${trait} is part of who I am, and I love ${activity}. Every day is an opportunity to grow and make a positive impact.`;
};
