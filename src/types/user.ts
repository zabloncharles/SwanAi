import { Timestamp } from "firebase/firestore";

export interface UserPreferences {
  communication_style?: string;
  topics_of_interest?: string[];
  emotional_patterns?: string;
  response_preferences?: string;
}

export interface PersonalInfo {
  age_range?: string;
  occupation?: string;
  location?: string;
  family_status?: string;
  hobbies?: string[];
  goals?: string[];
  challenges?: string[];
}

export interface ConversationHistory {
  frequent_topics?: string[];
  mood_patterns?: string;
  communication_frequency?: string;
  response_style?: string;
  shared_memories?: string[];
}

export interface RelationshipDynamics {
  trust_level?: string;
  comfort_level?: string;
  preferred_support_style?: string;
  boundaries?: string;
}

export interface LearningPreferences {
  preferred_explanation_style?: string;
  motivation_factors?: string;
  stress_triggers?: string;
  coping_mechanisms?: string;
}

export interface UserProfile {
  personality?: string;
  relationship?: string;
  name?: string | null;
  preferences?: UserPreferences;
  personal_info?: PersonalInfo;
  conversation_history?: ConversationHistory;
  relationship_dynamics?: RelationshipDynamics;
  learning_preferences?: LearningPreferences;
}

export interface UserData {
  uid: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  age?: string;
  gender?: string;
  personality?: string;
  aiRelationship?: string;
  profile?: UserProfile;
  createdAt: Timestamp;
  lastLogin?: Timestamp;
  type: "free" | "pro" | "ultimate" | "admin";
  notificationsEnabled: boolean;
  tokensUsed?: number;
  responseTime?: number;
  summary?: string;
  history?: Array<{ role: string; content: string }>;
  updatedAt: Date;
  exMode?: boolean;
}
