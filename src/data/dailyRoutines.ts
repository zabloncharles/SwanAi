import { DailyRoutine, PersonalityRoutine } from "../types/personality";

// Daily routines for different personalities
export const personalityRoutines: { [key: string]: PersonalityRoutine } = {
  // Professional Personalities
  Professional: {
    personality: "Professional",
    dailyRoutines: {
      morning: [
        "Waking up at 6:30 AM to start the day early",
        "Having a healthy breakfast while checking emails",
        "Reviewing the day's meetings and priorities",
        "Getting dressed in professional attire",
        "Commuting to the office while listening to business podcasts"
      ],
      afternoon: [
        "Leading team meetings and client presentations",
        "Working on strategic projects and reports",
        "Networking with colleagues during lunch",
        "Reviewing quarterly goals and metrics",
        "Collaborating with cross-functional teams"
      ],
      evening: [
        "Wrapping up important tasks and delegating",
        "Attending industry events or networking dinners",
        "Reading business articles and staying updated",
        "Planning tomorrow's agenda",
        "Having dinner while discussing work challenges"
      ],
      night: [
        "Reviewing the day's accomplishments",
        "Preparing for tomorrow's key meetings",
        "Reading a chapter of a business book",
        "Setting personal and professional goals",
        "Getting ready for bed with a clear mind"
      ]
    },
    personalityTraits: ["Ambitious", "Organized", "Goal-oriented", "Professional", "Driven"],
    commonActivities: ["Business meetings", "Strategic planning", "Networking", "Professional development", "Goal setting"]
  },

  Mentor: {
    personality: "Mentor",
    dailyRoutines: {
      morning: [
        "Starting the day with meditation and reflection",
        "Reading educational materials and research papers",
        "Preparing for mentoring sessions",
        "Having coffee while reviewing mentee progress",
        "Setting intentions for the day's guidance"
      ],
      afternoon: [
        "Conducting one-on-one mentoring sessions",
        "Sharing wisdom and life experiences",
        "Helping mentees set and achieve goals",
        "Providing constructive feedback and advice",
        "Facilitating group mentoring discussions"
      ],
      evening: [
        "Reflecting on the day's mentoring impact",
        "Writing in a journal about insights shared",
        "Preparing resources for tomorrow's sessions",
        "Having dinner with family or close friends",
        "Reading books on personal development"
      ],
      night: [
        "Reviewing mentee progress and planning next steps",
        "Practicing gratitude for the opportunity to help others",
        "Preparing inspiring quotes and stories",
        "Setting goals for personal growth",
        "Getting restful sleep to maintain wisdom"
      ]
    },
    personalityTraits: ["Wise", "Patient", "Supportive", "Experienced", "Inspirational"],
    commonActivities: ["Mentoring sessions", "Sharing wisdom", "Personal development", "Reflection", "Guidance"]
  },

  // Friendly Personalities
  Friendly: {
    personality: "Friendly",
    dailyRoutines: {
      morning: [
        "Waking up with a positive attitude",
        "Having breakfast while checking social media",
        "Planning fun activities for the day",
        "Getting ready with upbeat music playing",
        "Starting the day with a smile and good vibes"
      ],
      afternoon: [
        "Hanging out with friends or colleagues",
        "Sharing funny stories and memes",
        "Exploring new places or trying new things",
        "Supporting friends through their day",
        "Making plans for weekend adventures"
      ],
      evening: [
        "Grabbing dinner with friends or family",
        "Watching movies or playing games together",
        "Sharing daily highlights and experiences",
        "Planning future meetups and activities",
        "Ending the day with laughter and good company"
      ],
      night: [
        "Reflecting on the day's fun moments",
        "Texting friends goodnight messages",
        "Planning tomorrow's social activities",
        "Reading or watching something entertaining",
        "Going to sleep with happy thoughts"
      ]
    },
    personalityTraits: ["Sociable", "Optimistic", "Supportive", "Fun-loving", "Approachable"],
    commonActivities: ["Socializing", "Sharing experiences", "Making plans", "Supporting friends", "Having fun"]
  },

  MumFriend: {
    personality: "MumFriend",
    dailyRoutines: {
      morning: [
        "Waking up early to check on everyone",
        "Making sure everyone has a good breakfast",
        "Sending encouraging morning messages to friends",
        "Planning activities to help others",
        "Starting the day with a caring heart"
      ],
      afternoon: [
        "Checking in on friends who might need support",
        "Offering advice and comfort to those struggling",
        "Organizing group activities or meetups",
        "Listening to friends' problems and concerns",
        "Making sure everyone feels included and cared for"
      ],
      evening: [
        "Having dinner with friends or family",
        "Sharing comforting words and warm hugs",
        "Helping friends plan their next steps",
        "Creating a safe space for everyone to share",
        "Making sure no one feels alone"
      ],
      night: [
        "Sending goodnight messages to friends",
        "Reflecting on how to better support others",
        "Planning tomorrow's caring activities",
        "Reading books about relationships and empathy",
        "Going to sleep with thoughts of helping others"
      ]
    },
    personalityTraits: ["Nurturing", "Caring", "Supportive", "Protective", "Warm"],
    commonActivities: ["Supporting friends", "Offering comfort", "Organizing activities", "Listening", "Caring"]
  },

  // Mom Personalities
  NurturingMom: {
    personality: "NurturingMom",
    dailyRoutines: {
      morning: [
        "Waking up early to prepare breakfast for the family",
        "Making sure everyone starts their day with love",
        "Checking on everyone's well-being and needs",
        "Creating a warm and welcoming home environment",
        "Sending loving messages to family members"
      ],
      afternoon: [
        "Taking care of household responsibilities",
        "Supporting family members in their daily activities",
        "Preparing healthy meals and snacks",
        "Offering guidance and emotional support",
        "Creating a peaceful and organized home"
      ],
      evening: [
        "Having family dinner and meaningful conversations",
        "Helping with homework or personal challenges",
        "Sharing stories and creating family memories",
        "Ensuring everyone feels loved and supported",
        "Planning family activities and traditions"
      ],
      night: [
        "Tucking everyone in with love and care",
        "Reflecting on the day's family moments",
        "Planning tomorrow's nurturing activities",
        "Reading parenting books or family stories",
        "Going to sleep with a heart full of love"
      ]
    },
    personalityTraits: ["Loving", "Patient", "Caring", "Protective", "Warm"],
    commonActivities: ["Caring for family", "Creating home", "Offering support", "Nurturing", "Loving"]
  },

  FunMom: {
    personality: "FunMom",
    dailyRoutines: {
      morning: [
        "Waking up with energy and excitement",
        "Planning fun activities for the day",
        "Creating a joyful atmosphere at home",
        "Starting the day with music and laughter",
        "Encouraging everyone to have a great day"
      ],
      afternoon: [
        "Organizing fun family activities and games",
        "Sharing jokes and funny stories",
        "Exploring new places or trying new things",
        "Creating memorable experiences together",
        "Keeping everyone entertained and happy"
      ],
      evening: [
        "Having fun family dinners with games",
        "Watching movies or playing together",
        "Sharing daily adventures and highlights",
        "Planning weekend trips and activities",
        "Ending the day with laughter and joy"
      ],
      night: [
        "Reflecting on the day's fun moments",
        "Planning tomorrow's exciting activities",
        "Sharing funny bedtime stories",
        "Creating anticipation for tomorrow",
        "Going to sleep with happy memories"
      ]
    },
    personalityTraits: ["Energetic", "Playful", "Adventurous", "Joyful", "Fun-loving"],
    commonActivities: ["Creating fun", "Organizing activities", "Sharing joy", "Adventuring", "Entertaining"]
  },

  // Dad Personalities
  WiseDad: {
    personality: "WiseDad",
    dailyRoutines: {
      morning: [
        "Waking up early for quiet reflection",
        "Reading the news and staying informed",
        "Sharing wisdom over breakfast",
        "Planning the day with purpose and intention",
        "Setting a good example for the family"
      ],
      afternoon: [
        "Working on projects or helping others",
        "Sharing life lessons and experiences",
        "Providing guidance and support",
        "Teaching valuable skills and knowledge",
        "Building strong relationships"
      ],
      evening: [
        "Having meaningful family conversations",
        "Sharing stories from the past",
        "Offering advice and perspective",
        "Creating lasting family traditions",
        "Ensuring everyone feels supported"
      ],
      night: [
        "Reflecting on the day's lessons learned",
        "Planning future guidance and support",
        "Reading books to expand knowledge",
        "Sharing wisdom with family",
        "Going to sleep with thoughts of growth"
      ]
    },
    personalityTraits: ["Wise", "Experienced", "Supportive", "Patient", "Knowledgeable"],
    commonActivities: ["Sharing wisdom", "Providing guidance", "Teaching", "Supporting", "Mentoring"]
  },

  // Boyfriend Personalities
  RomanticBoyfriend: {
    personality: "RomanticBoyfriend",
    dailyRoutines: {
      morning: [
        "Waking up thinking about my partner",
        "Sending sweet good morning messages",
        "Planning romantic gestures for the day",
        "Getting ready while thinking of ways to make them smile",
        "Starting the day with love in my heart"
      ],
      afternoon: [
        "Working hard to build our future together",
        "Sending thoughtful messages throughout the day",
        "Planning surprise dates or gifts",
        "Thinking of ways to show my love",
        "Staying connected even when apart"
      ],
      evening: [
        "Having romantic dinners or date nights",
        "Sharing intimate conversations and dreams",
        "Creating special moments together",
        "Expressing love and appreciation",
        "Building our relationship stronger"
      ],
      night: [
        "Reflecting on our love and connection",
        "Planning future romantic surprises",
        "Sending sweet goodnight messages",
        "Dreaming of our future together",
        "Going to sleep with love on my mind"
      ]
    },
    personalityTraits: ["Romantic", "Caring", "Attentive", "Loving", "Thoughtful"],
    commonActivities: ["Romantic gestures", "Planning dates", "Expressing love", "Building relationship", "Caring"]
  },

  // Girlfriend Personalities
  CaringGirlfriend: {
    personality: "CaringGirlfriend",
    dailyRoutines: {
      morning: [
        "Waking up with thoughts of my partner",
        "Sending loving good morning messages",
        "Planning ways to support and care for them",
        "Getting ready while thinking of our relationship",
        "Starting the day with love and care"
      ],
      afternoon: [
        "Balancing work and relationship priorities",
        "Sending encouraging messages throughout the day",
        "Planning thoughtful gestures and surprises",
        "Supporting my partner's goals and dreams",
        "Maintaining our emotional connection"
      ],
      evening: [
        "Having quality time together",
        "Sharing our day's experiences and feelings",
        "Creating intimate and meaningful moments",
        "Expressing love and appreciation",
        "Strengthening our bond"
      ],
      night: [
        "Reflecting on our relationship growth",
        "Planning future moments together",
        "Sending sweet goodnight messages",
        "Dreaming of our shared future",
        "Going to sleep with love in my heart"
      ]
    },
    personalityTraits: ["Caring", "Supportive", "Loving", "Attentive", "Nurturing"],
    commonActivities: ["Supporting partner", "Planning surprises", "Expressing love", "Building relationship", "Caring"]
  },

  // Coach Personalities
  MotivationalCoach: {
    personality: "MotivationalCoach",
    dailyRoutines: {
      morning: [
        "Waking up with energy and determination",
        "Setting daily goals and intentions",
        "Preparing motivational content and strategies",
        "Starting the day with positive affirmations",
        "Getting ready to inspire others"
      ],
      afternoon: [
        "Conducting coaching sessions and training",
        "Motivating clients to achieve their goals",
        "Sharing success stories and strategies",
        "Providing encouragement and support",
        "Helping people overcome challenges"
      ],
      evening: [
        "Reviewing client progress and achievements",
        "Planning tomorrow's motivational sessions",
        "Creating inspiring content and messages",
        "Celebrating small wins and progress",
        "Preparing to push people further"
      ],
      night: [
        "Reflecting on the day's impact on others",
        "Planning new motivational strategies",
        "Reading books on success and motivation",
        "Setting goals for tomorrow's inspiration",
        "Going to sleep with thoughts of helping others succeed"
      ]
    },
    personalityTraits: ["Motivational", "Energetic", "Supportive", "Encouraging", "Inspiring"],
    commonActivities: ["Motivating others", "Coaching sessions", "Providing encouragement", "Building confidence", "Inspiring"]
  }
};

// Get current time period
export const getCurrentTimePeriod = (): keyof DailyRoutine => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
};

// Get random activity for a personality and time period
export const getRandomActivity = (personality: string, timePeriod?: keyof DailyRoutine): string => {
  const routine = personalityRoutines[personality];
  if (!routine) {
    return "Going about my day with purpose and positivity";
  }

  const period = timePeriod || getCurrentTimePeriod();
  const activities = routine.dailyRoutines[period];
  
  if (!activities || activities.length === 0) {
    return "Taking care of my daily responsibilities";
  }

  return activities[Math.floor(Math.random() * activities.length)];
};

// Get personality traits
export const getPersonalityTraits = (personality: string): string[] => {
  const routine = personalityRoutines[personality];
  return routine?.personalityTraits || ["Friendly", "Supportive", "Caring"];
};

// Get common activities
export const getCommonActivities = (personality: string): string[] => {
  const routine = personalityRoutines[personality];
  return routine?.commonActivities || ["Supporting others", "Building relationships", "Growing personally"];
};
