export interface Education {
  degree: string;
  field: string;
  institution: string;
  graduationYear: number;
  gpa?: number;
  achievements: string[];
  relevantCourses: string[];
}

export interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  yearsOfExperience: number;
  responsibilities: string[];
  achievements: string[];
  skillsUsed: string[];
  industry: string;
}

export interface PersonalBackground {
  age: number;
  race: string;
  ethnicity: string;
  birthplace: string;
  currentLocation: string;
  upbringing: string;
  familyBackground: string;
  culturalInfluences: string[];
  lifeEvents: string[];
  turningPoints: string[];
}

export interface CommunicationStyle {
  vernacular: string[];
  speakingPatterns: string[];
  vocabularyLevel: string;
  formalityLevel: string;
  regionalDialect: string;
  culturalExpressions: string[];
  conversationStarters: string[];
}

export interface WorldOutlook {
  politicalViews: string;
  socialBeliefs: string[];
  lifePhilosophy: string;
  values: string[];
  goals: string[];
  fears: string[];
  dreams: string[];
  whatMattersMost: string;
}

export interface Skills {
  technical: string[];
  soft: string[];
  creative: string[];
  leadership: string[];
  languages: string[];
  certifications: string[];
  hobbies: string[];
  talents: string[];
}

export interface Availability {
  typicalSchedule: string;
  responseTime: string;
  availabilityPatterns: string[];
  busyTimes: string[];
  freeTimes: string[];
  timezone: string;
  workLifeBalance: string;
}

export interface IntelligenceProfile {
  iqRange: string;
  learningStyle: string;
  problemSolvingApproach: string;
  analyticalSkills: string;
  creativeThinking: string;
  emotionalIntelligence: string;
  expertiseAreas: string[];
  knowledgeDepth: string;
}

export interface RelationshipContext {
  relationshipType: string;
  howTheyMet: string;
  relationshipDuration: string;
  sharedExperiences: string[];
  insideJokes: string[];
  relationshipDynamics: string;
  futurePlans: string[];
}

export interface AILifeResume {
  // Core Identity
  name: string;
  personality: string;
  relationshipType: string;

  // Personal Background
  personal: PersonalBackground;

  // Intelligence & Education
  intelligence: IntelligenceProfile;
  education: Education[];

  // Professional Life
  workExperience: WorkExperience[];
  skills: Skills;

  // Communication & Culture
  communication: CommunicationStyle;

  // Worldview & Values
  worldview: WorldOutlook;

  // Availability & Lifestyle
  availability: Availability;

  // Relationship Context
  relationshipContext: RelationshipContext;

  // Generated Content
  generatedAt: Date;
  version: string;
  seed: number; // For consistent generation
}

// Generation parameters for different personality types
export interface PersonalityGenerationParams {
  personality: string;
  relationship: string;
  ageRange: [number, number];
  educationLevel: string;
  careerField: string;
  culturalBackground: string;
  location: string;
  intelligenceLevel: string;
  communicationStyle: string;
}

// Templates for different personality types
export interface PersonalityTemplate {
  name: string;
  personality: string;
  relationship: string;
  baseParams: Partial<PersonalityGenerationParams>;
  customFields: Record<string, any>;
}
