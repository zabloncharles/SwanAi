import {
  AILifeResume,
  PersonalityGenerationParams,
  PersonalBackground,
  Education,
  WorkExperience,
  CommunicationStyle,
  WorldOutlook,
  Skills,
  Availability,
  IntelligenceProfile,
  RelationshipContext,
} from "../types/aiLifeResume";

// Personality-specific generation parameters
const personalityParams: Record<
  string,
  Partial<PersonalityGenerationParams>
> = {
  // Professional Personalities
  Professional: {
    ageRange: [28, 45],
    educationLevel: "graduate",
    careerField: "business",
    intelligenceLevel: "high",
    communicationStyle: "formal",
  },
  Mentor: {
    ageRange: [45, 65],
    educationLevel: "graduate",
    careerField: "education",
    intelligenceLevel: "very_high",
    communicationStyle: "wise",
  },

  // Friendly Personalities
  Friendly: {
    ageRange: [22, 35],
    educationLevel: "bachelor",
    careerField: "creative",
    intelligenceLevel: "above_average",
    communicationStyle: "casual",
  },
  MumFriend: {
    ageRange: [30, 45],
    educationLevel: "bachelor",
    careerField: "healthcare",
    intelligenceLevel: "above_average",
    communicationStyle: "nurturing",
  },

  // Family Personalities
  NurturingMom: {
    ageRange: [40, 55],
    educationLevel: "bachelor",
    careerField: "family",
    intelligenceLevel: "above_average",
    communicationStyle: "loving",
  },
  FunMom: {
    ageRange: [35, 50],
    educationLevel: "bachelor",
    careerField: "creative",
    intelligenceLevel: "above_average",
    communicationStyle: "playful",
  },
  WiseDad: {
    ageRange: [45, 60],
    educationLevel: "graduate",
    careerField: "professional",
    intelligenceLevel: "high",
    communicationStyle: "wise",
  },

  // Romantic Personalities
  RomanticBoyfriend: {
    ageRange: [25, 35],
    educationLevel: "bachelor",
    careerField: "various",
    intelligenceLevel: "above_average",
    communicationStyle: "romantic",
  },
  CaringGirlfriend: {
    ageRange: [23, 33],
    educationLevel: "bachelor",
    careerField: "various",
    intelligenceLevel: "above_average",
    communicationStyle: "caring",
  },

  // Coach Personalities
  MotivationalCoach: {
    ageRange: [35, 50],
    educationLevel: "graduate",
    careerField: "coaching",
    intelligenceLevel: "high",
    communicationStyle: "motivational",
  },
};

// Cultural and regional data for realistic generation
const culturalData = {
  regions: {
    northeast: {
      vernacular: ["wicked", "bubbler", "packie", "grinder"],
      dialect: "Boston/New England",
      culturalExpressions: ["That's wicked good!", "How you doin'?"],
    },
    southeast: {
      vernacular: ["y'all", "fixin' to", "bless your heart", "sweet tea"],
      dialect: "Southern",
      culturalExpressions: ["Bless your heart", "Well, I declare!"],
    },
    midwest: {
      vernacular: ["ope", "you betcha", "uff da", "pop"],
      dialect: "Midwestern",
      culturalExpressions: ["You betcha!", "That's different"],
    },
    west: {
      vernacular: ["hella", "dude", "totally", "awesome"],
      dialect: "West Coast",
      culturalExpressions: ["That's totally awesome!", "No worries"],
    },
  },

  ethnicities: {
    hispanic: {
      culturalInfluences: ["Family values", "Catholicism", "Music and dance"],
      expressions: ["¡Ay caramba!", "Mi amor", "Dios mío"],
    },
    asian: {
      culturalInfluences: [
        "Respect for elders",
        "Education focus",
        "Family harmony",
      ],
      expressions: ["Thank you", "Please", "Excuse me"],
    },
    african_american: {
      culturalInfluences: ["Community", "Music", "Resilience"],
      expressions: ["What's good?", "I feel you", "That's real"],
    },
    european: {
      culturalInfluences: ["Tradition", "History", "Art"],
      expressions: ["Cheers", "Brilliant", "Lovely"],
    },
  },
};

// Education templates
const educationTemplates = {
  high_school: {
    degrees: ["High School Diploma"],
    fields: ["General Studies", "College Prep", "Vocational"],
    institutions: ["Local High School", "Public School", "Private Academy"],
  },
  bachelor: {
    degrees: [
      "Bachelor of Arts",
      "Bachelor of Science",
      "Bachelor of Business Administration",
    ],
    fields: [
      "Psychology",
      "Business",
      "Communications",
      "English",
      "History",
      "Sociology",
      "Marketing",
      "Education",
    ],
    institutions: [
      "State University",
      "Private College",
      "Liberal Arts College",
      "Community College",
    ],
  },
  graduate: {
    degrees: [
      "Master of Arts",
      "Master of Science",
      "Master of Business Administration",
      "PhD",
    ],
    fields: [
      "Psychology",
      "Business Administration",
      "Education",
      "Social Work",
      "Counseling",
      "Leadership",
    ],
    institutions: ["Graduate School", "University", "Professional School"],
  },
};

// Career field templates
const careerTemplates = {
  business: {
    titles: ["Manager", "Director", "Consultant", "Analyst", "Coordinator"],
    industries: [
      "Technology",
      "Finance",
      "Healthcare",
      "Retail",
      "Manufacturing",
    ],
    skills: [
      "Leadership",
      "Strategic Planning",
      "Project Management",
      "Communication",
    ],
  },
  education: {
    titles: ["Teacher", "Professor", "Counselor", "Administrator", "Coach"],
    industries: [
      "K-12 Education",
      "Higher Education",
      "Training",
      "Non-profit",
    ],
    skills: [
      "Teaching",
      "Mentoring",
      "Curriculum Development",
      "Student Support",
    ],
  },
  creative: {
    titles: ["Designer", "Artist", "Writer", "Musician", "Photographer"],
    industries: ["Arts", "Media", "Entertainment", "Marketing", "Publishing"],
    skills: ["Creativity", "Design", "Communication", "Technical Skills"],
  },
  healthcare: {
    titles: [
      "Nurse",
      "Therapist",
      "Counselor",
      "Social Worker",
      "Health Coach",
    ],
    industries: ["Healthcare", "Mental Health", "Wellness", "Social Services"],
    skills: ["Empathy", "Communication", "Problem Solving", "Patient Care"],
  },
};

// Generate random element from array
const randomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Generate random number in range
const randomInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate personal background
const generatePersonalBackground = (
  params: PersonalityGenerationParams
): PersonalBackground => {
  const age = randomInRange(params.ageRange[0], params.ageRange[1]);
  const region = randomElement(Object.keys(culturalData.regions));
  const ethnicity = randomElement(Object.keys(culturalData.ethnicities));

  return {
    age,
    race: randomElement(["White", "Black", "Hispanic", "Asian", "Mixed"]),
    ethnicity,
    birthplace: randomElement([
      "New York",
      "Los Angeles",
      "Chicago",
      "Houston",
      "Phoenix",
      "Philadelphia",
      "San Antonio",
      "San Diego",
      "Dallas",
      "San Jose",
    ]),
    currentLocation: randomElement([
      "New York",
      "Los Angeles",
      "Chicago",
      "Houston",
      "Phoenix",
      "Philadelphia",
      "San Antonio",
      "San Diego",
      "Dallas",
      "San Jose",
    ]),
    upbringing: randomElement([
      "Raised in a loving family with strong values",
      "Grew up in a diverse neighborhood",
      "Came from a working-class background",
      "Raised with emphasis on education and success",
      "Grew up in a close-knit community",
    ]),
    familyBackground: randomElement([
      "Close family with traditional values",
      "Modern family with progressive views",
      "Single parent household",
      "Large extended family",
      "Small family with strong bonds",
    ]),
    culturalInfluences:
      culturalData.ethnicities[
        ethnicity as keyof typeof culturalData.ethnicities
      ].culturalInfluences,
    lifeEvents: [
      randomElement([
        "Graduated college",
        "Started first job",
        "Moved to new city",
        "Met significant other",
        "Had children",
        "Started business",
        "Won award",
        "Published work",
        "Traveled abroad",
        "Learned new skill",
      ]),
      randomElement([
        "Overcame challenge",
        "Achieved goal",
        "Helped someone",
        "Made difference",
        "Learned lesson",
        "Found passion",
        "Built relationship",
        "Created something",
        "Explored world",
        "Grew personally",
      ]),
    ],
    turningPoints: [
      randomElement([
        "Career change",
        "Relationship",
        "Health journey",
        "Personal growth",
        "Family event",
        "Travel experience",
        "Educational achievement",
        "Creative breakthrough",
        "Community involvement",
        "Spiritual awakening",
      ]),
    ],
  };
};

// Generate education history
const generateEducation = (
  params: PersonalityGenerationParams
): Education[] => {
  const educationLevel = params.educationLevel;
  const template =
    educationTemplates[educationLevel as keyof typeof educationTemplates];

  const education: Education[] = [];

  // Add high school
  education.push({
    degree: "High School Diploma",
    field: "General Studies",
    institution: randomElement([
      "Local High School",
      "Public School",
      "Private Academy",
    ]),
    graduationYear: new Date().getFullYear() - randomInRange(5, 25),
    achievements: [
      randomElement([
        "Honor Roll",
        "Student Council",
        "Sports Team Captain",
        "Academic Award",
        "Leadership Position",
        "Community Service",
        "Art Award",
        "Science Fair Winner",
      ]),
    ],
    relevantCourses: [
      randomElement([
        "Advanced Mathematics",
        "Literature",
        "Science",
        "History",
        "Art",
        "Music",
        "Physical Education",
        "Foreign Language",
      ]),
    ],
  });

  // Add higher education if applicable
  if (educationLevel !== "high_school") {
    education.push({
      degree: randomElement(template.degrees),
      field: randomElement(template.fields),
      institution: randomElement(template.institutions),
      graduationYear: new Date().getFullYear() - randomInRange(2, 15),
      gpa: randomInRange(30, 40) / 10,
      achievements: [
        randomElement([
          "Dean's List",
          "Honor Society",
          "Research Project",
          "Internship",
          "Study Abroad",
          "Leadership Role",
          "Academic Award",
          "Community Service",
        ]),
      ],
      relevantCourses: [
        randomElement([
          "Advanced Psychology",
          "Business Strategy",
          "Communication Theory",
          "Leadership Development",
          "Research Methods",
          "Professional Ethics",
          "Creative Writing",
          "Public Speaking",
        ]),
      ],
    });
  }

  return education;
};

// Generate work experience
const generateWorkExperience = (
  params: PersonalityGenerationParams
): WorkExperience[] => {
  const careerField = params.careerField;
  const template = careerTemplates[careerField as keyof typeof careerTemplates];
  const experience: WorkExperience[] = [];

  const numJobs = randomInRange(1, 3);

  for (let i = 0; i < numJobs; i++) {
    const yearsExp = randomInRange(2, 8);
    experience.push({
      title: randomElement(template.titles),
      company: randomElement([
        "Tech Corp",
        "Global Solutions",
        "Creative Agency",
        "Healthcare Partners",
        "Education First",
        "Innovation Labs",
        "Community Center",
        "Professional Services",
      ]),
      duration: `${yearsExp} years`,
      yearsOfExperience: yearsExp,
      responsibilities: [
        randomElement([
          "Led team projects",
          "Managed client relationships",
          "Developed strategies",
          "Provided guidance",
          "Created solutions",
          "Coordinated activities",
          "Analyzed data",
          "Delivered presentations",
        ]),
        randomElement([
          "Collaborated with stakeholders",
          "Implemented improvements",
          "Mentored colleagues",
          "Solved complex problems",
          "Built partnerships",
          "Drove innovation",
          "Ensured quality",
          "Facilitated communication",
        ]),
      ],
      achievements: [
        randomElement([
          "Increased efficiency by 25%",
          "Led successful project",
          "Received recognition",
          "Improved processes",
          "Built strong team",
          "Exceeded targets",
          "Innovated solution",
          "Mentored others",
        ]),
      ],
      skillsUsed: template.skills,
      industry: randomElement(template.industries),
    });
  }

  return experience;
};

// Generate communication style
const generateCommunicationStyle = (
  params: PersonalityGenerationParams
): CommunicationStyle => {
  const region = randomElement(Object.keys(culturalData.regions));
  const regionalData =
    culturalData.regions[region as keyof typeof culturalData.regions];

  return {
    vernacular: regionalData.vernacular,
    speakingPatterns: [
      randomElement([
        "Uses analogies",
        "Asks questions",
        "Shares stories",
        "Uses humor",
        "Speaks directly",
        "Uses examples",
        "Shows empathy",
        "Encourages others",
      ]),
    ],
    vocabularyLevel:
      params.intelligenceLevel === "very_high"
        ? "Advanced"
        : params.intelligenceLevel === "high"
        ? "Professional"
        : "Conversational",
    formalityLevel:
      params.communicationStyle === "formal"
        ? "Formal"
        : params.communicationStyle === "casual"
        ? "Casual"
        : "Mixed",
    regionalDialect: regionalData.dialect,
    culturalExpressions: regionalData.culturalExpressions,
    conversationStarters: [
      randomElement([
        "How's your day going?",
        "What's new with you?",
        "Tell me about yourself",
        "What brings you here?",
        "How can I help?",
        "What's on your mind?",
      ]),
    ],
  };
};

// Generate worldview
const generateWorldOutlook = (
  params: PersonalityGenerationParams
): WorldOutlook => {
  return {
    politicalViews: randomElement([
      "Moderate",
      "Progressive",
      "Conservative",
      "Independent",
      "Centrist",
    ]),
    socialBeliefs: [
      randomElement([
        "Equality for all",
        "Education is key",
        "Family comes first",
        "Community matters",
        "Personal growth",
        "Helping others",
        "Innovation drives progress",
        "Tradition provides stability",
      ]),
    ],
    lifePhilosophy: randomElement([
      "Life is about learning and growing",
      "Success comes from hard work and determination",
      "Happiness is found in meaningful relationships",
      "Making a positive impact is what matters most",
      "Balance between work and life is essential",
    ]),
    values: [
      randomElement([
        "Integrity",
        "Compassion",
        "Excellence",
        "Growth",
        "Connection",
        "Service",
        "Creativity",
        "Resilience",
      ]),
      randomElement([
        "Honesty",
        "Empathy",
        "Dedication",
        "Learning",
        "Community",
        "Innovation",
        "Balance",
        "Courage",
      ]),
    ],
    goals: [
      randomElement([
        "Help others succeed",
        "Build meaningful relationships",
        "Continue learning",
        "Make a difference",
        "Achieve personal growth",
        "Create positive change",
        "Inspire others",
        "Find balance",
      ]),
    ],
    fears: [
      randomElement([
        "Not making a difference",
        "Missing opportunities",
        "Letting others down",
        "Not growing",
        "Being stagnant",
        "Losing connections",
        "Not being authentic",
        "Failing to help",
      ]),
    ],
    dreams: [
      randomElement([
        "Making a positive impact",
        "Building strong relationships",
        "Helping others grow",
        "Creating something meaningful",
        "Inspiring change",
        "Finding fulfillment",
        "Building community",
        "Leaving a legacy",
      ]),
    ],
    whatMattersMost: randomElement([
      "Making a positive difference in others' lives",
      "Building and maintaining meaningful relationships",
      "Continuous personal and professional growth",
      "Helping others achieve their potential",
      "Creating a supportive and caring environment",
    ]),
  };
};

// Generate skills
const generateSkills = (params: PersonalityGenerationParams): Skills => {
  const careerField = params.careerField;
  const template = careerTemplates[careerField as keyof typeof careerTemplates];

  return {
    technical: [
      randomElement([
        "Microsoft Office",
        "Project Management",
        "Data Analysis",
        "Digital Marketing",
        "Social Media",
        "Design Software",
        "Programming",
        "Research Methods",
      ]),
    ],
    soft: template.skills,
    creative: [
      randomElement([
        "Problem Solving",
        "Creative Thinking",
        "Storytelling",
        "Design",
        "Writing",
        "Music",
        "Art",
        "Innovation",
      ]),
    ],
    leadership: [
      randomElement([
        "Team Management",
        "Strategic Planning",
        "Mentoring",
        "Decision Making",
        "Conflict Resolution",
        "Motivation",
        "Communication",
        "Vision Setting",
      ]),
    ],
    languages: [
      randomElement([
        "English",
        "Spanish",
        "French",
        "German",
        "Mandarin",
        "Japanese",
        "Italian",
        "Portuguese",
      ]),
    ],
    certifications: [
      randomElement([
        "Professional Certification",
        "Leadership Training",
        "Specialized Course",
        "Industry Certification",
        "Skill Development",
        "Advanced Training",
      ]),
    ],
    hobbies: [
      randomElement([
        "Reading",
        "Traveling",
        "Cooking",
        "Gardening",
        "Photography",
        "Hiking",
        "Painting",
        "Music",
        "Sports",
        "Volunteering",
      ]),
    ],
    talents: [
      randomElement([
        "Public Speaking",
        "Problem Solving",
        "Creative Writing",
        "Artistic Expression",
        "Musical Ability",
        "Athletic Skills",
        "Teaching",
        "Listening",
      ]),
    ],
  };
};

// Generate availability
const generateAvailability = (
  params: PersonalityGenerationParams
): Availability => {
  return {
    typicalSchedule: randomElement([
      "9-5 work schedule with evenings free",
      "Flexible schedule with morning availability",
      "Part-time work with afternoon focus",
      "Full-time with weekend availability",
      "Variable schedule with good communication",
    ]),
    responseTime: randomElement([
      "Usually responds within minutes",
      "Responds within a few hours",
      "Quick responses during work hours",
      "Consistent daily check-ins",
      "Available throughout the day",
    ]),
    availabilityPatterns: [
      randomElement([
        "Morning person",
        "Night owl",
        "Afternoon focus",
        "All day availability",
        "Weekend warrior",
      ]),
    ],
    busyTimes: [
      randomElement([
        "Work hours",
        "Evening family time",
        "Morning routine",
        "Weekend activities",
        "Meal times",
      ]),
    ],
    freeTimes: [
      randomElement([
        "Evenings",
        "Weekends",
        "Lunch breaks",
        "Early mornings",
        "Late nights",
      ]),
    ],
    timezone: randomElement(["EST", "CST", "MST", "PST", "UTC"]),
    workLifeBalance: randomElement([
      "Strives for balance between work and personal life",
      "Prioritizes family and relationships",
      "Maintains flexible schedule",
      "Values quality time over quantity",
      "Integrates work and personal interests",
    ]),
  };
};

// Generate intelligence profile
const generateIntelligenceProfile = (
  params: PersonalityGenerationParams
): IntelligenceProfile => {
  const level = params.intelligenceLevel;

  const iqRanges = {
    very_high: "130-145",
    high: "115-130",
    above_average: "100-115",
    average: "85-100",
  };

  return {
    iqRange: iqRanges[level as keyof typeof iqRanges] || "100-115",
    learningStyle: randomElement([
      "Visual learner with strong analytical skills",
      "Hands-on learner who learns by doing",
      "Auditory learner who benefits from discussion",
      "Reading/writing learner with strong comprehension",
      "Kinesthetic learner who learns through experience",
    ]),
    problemSolvingApproach: randomElement([
      "Analytical and systematic",
      "Creative and innovative",
      "Collaborative and team-oriented",
      "Practical and solution-focused",
      "Intuitive and experience-based",
    ]),
    analyticalSkills: randomElement([
      "Strong data analysis and interpretation",
      "Excellent pattern recognition",
      "Logical reasoning and deduction",
      "Critical thinking and evaluation",
      "Strategic planning and foresight",
    ]),
    creativeThinking: randomElement([
      "Innovative problem solving",
      "Artistic and imaginative",
      "Out-of-the-box thinking",
      "Adaptive and flexible",
      "Original and unique perspectives",
    ]),
    emotionalIntelligence: randomElement([
      "High empathy and understanding",
      "Excellent interpersonal skills",
      "Strong self-awareness",
      "Effective communication",
      "Relationship building expertise",
    ]),
    expertiseAreas: [
      randomElement([
        "Psychology",
        "Business",
        "Education",
        "Technology",
        "Healthcare",
        "Arts",
        "Science",
        "Social Work",
        "Leadership",
        "Communication",
      ]),
    ],
    knowledgeDepth: randomElement([
      "Deep expertise in specific areas",
      "Broad knowledge across multiple fields",
      "Specialized professional knowledge",
      "Lifelong learning and curiosity",
      "Practical wisdom and experience",
    ]),
  };
};

// Generate relationship context
const generateRelationshipContext = (
  params: PersonalityGenerationParams
): RelationshipContext => {
  const relationship = params.relationship;

  const meetingStories = {
    Friend: [
      "Met through mutual friends at a party",
      "Connected at a community event",
      "Started as colleagues and became friends",
      "Met through shared hobby group",
      "Introduced by family member",
    ],
    Mom: [
      "Born into this loving family",
      "Adopted into this caring home",
      "Became family through marriage",
      "Chosen family through deep connection",
      "Family by heart and love",
    ],
    Dad: [
      "Born into this supportive family",
      "Adopted into this loving home",
      "Became family through marriage",
      "Chosen family through deep connection",
      "Family by heart and love",
    ],
    Girlfriend: [
      "Met at a coffee shop",
      "Introduced by mutual friends",
      "Connected through shared interests",
      "Met at a social event",
      "Started as friends and grew closer",
    ],
    Boyfriend: [
      "Met at a coffee shop",
      "Introduced by mutual friends",
      "Connected through shared interests",
      "Met at a social event",
      "Started as friends and grew closer",
    ],
    Coach: [
      "Sought guidance for personal growth",
      "Met through professional networking",
      "Connected through shared goals",
      "Introduced by colleague",
      "Found through recommendation",
    ],
  };

  return {
    relationshipType: relationship,
    howTheyMet: randomElement(
      meetingStories[relationship as keyof typeof meetingStories] ||
        meetingStories.Friend
    ),
    relationshipDuration: randomElement([
      "Recently connected",
      "Known each other for a few months",
      "Friends for over a year",
      "Long-term relationship",
      "Lifelong connection",
    ]),
    sharedExperiences: [
      randomElement([
        "Deep conversations",
        "Shared meals",
        "Travel adventures",
        "Work projects",
        "Community events",
        "Personal growth",
        "Celebrations",
        "Challenges overcome",
      ]),
    ],
    insideJokes: [
      randomElement([
        "That time at the coffee shop",
        "The weather conversation",
        "The movie reference",
        "The restaurant mix-up",
        "The travel story",
        "The work project",
        "The family gathering",
      ]),
    ],
    relationshipDynamics: randomElement([
      "Supportive and encouraging",
      "Fun and playful",
      "Deep and meaningful",
      "Professional and respectful",
      "Warm and caring",
    ]),
    futurePlans: [
      randomElement([
        "Continue growing together",
        "Build stronger connection",
        "Support each other's goals",
        "Create more memories",
        "Deepen our relationship",
        "Help each other succeed",
      ]),
    ],
  };
};

// Main generation function
export const generateAILifeResume = (
  personality: string,
  relationship: string,
  userLocation?: string
): AILifeResume => {
  // Get base parameters for personality
  const baseParams =
    personalityParams[personality] || personalityParams.Friendly;

  // Create generation parameters
  const params: PersonalityGenerationParams = {
    personality,
    relationship,
    ageRange: baseParams.ageRange || [25, 40],
    educationLevel: baseParams.educationLevel || "bachelor",
    careerField: baseParams.careerField || "creative",
    culturalBackground: "diverse",
    location: userLocation || "United States",
    intelligenceLevel: baseParams.intelligenceLevel || "above_average",
    communicationStyle: baseParams.communicationStyle || "casual",
  };

  // Generate seed for consistent generation
  const seed = Date.now() + Math.random();

  // Generate all components
  const personal = generatePersonalBackground(params);
  const education = generateEducation(params);
  const workExperience = generateWorkExperience(params);
  const communication = generateCommunicationStyle(params);
  const worldview = generateWorldOutlook(params);
  const skills = generateSkills(params);
  const availability = generateAvailability(params);
  const intelligence = generateIntelligenceProfile(params);
  const relationshipContext = generateRelationshipContext(params);

  // Generate name based on personality and relationship
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

  const name = randomElement(
    names[personality as keyof typeof names] || names.Friendly
  );

  return {
    name,
    personality,
    relationshipType: relationship,
    personal,
    intelligence,
    education,
    workExperience,
    skills,
    communication,
    worldview,
    availability,
    relationshipContext,
    generatedAt: new Date(),
    version: "1.0",
    seed,
  };
};

// Generate a summary of the AI's life for conversation context
export const generateLifeSummary = (resume: AILifeResume): string => {
  return `${resume.name} is a ${resume.personal.age}-year-old ${
    resume.personal.race
  } ${resume.personal.ethnicity} from ${
    resume.personal.birthplace
  }, currently living in ${resume.personal.currentLocation}. 

${
  resume.name
} has a ${resume.intelligence.learningStyle.toLowerCase()} and works as a ${
    resume.workExperience[0]?.title
  } in the ${resume.workExperience[0]?.industry} industry. They have a ${
    resume.education[resume.education.length - 1]?.degree
  } in ${resume.education[resume.education.length - 1]?.field} from ${
    resume.education[resume.education.length - 1]?.institution
  }.

Their communication style is ${resume.communication.formalityLevel.toLowerCase()} with a ${resume.communication.regionalDialect.toLowerCase()} dialect. They value ${resume.worldview.values.join(
    " and "
  )} and believe that ${resume.worldview.whatMattersMost.toLowerCase()}.

${
  resume.name
} is ${resume.availability.workLifeBalance.toLowerCase()} and typically ${resume.availability.availabilityPatterns[0].toLowerCase()}. They enjoy ${resume.skills.hobbies.join(
    ", "
  )} and are skilled in ${resume.skills.soft.join(", ")}.

As your ${resume.relationshipType}, ${
    resume.name
  } ${resume.relationshipContext.howTheyMet.toLowerCase()} and has a ${resume.relationshipContext.relationshipDynamics.toLowerCase()} relationship with you.`;
};
