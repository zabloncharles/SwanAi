import { Timestamp } from "firebase/firestore";

export interface UserData {
  uid: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  personality?: string;
  aiRelationship?: string;
  profile?: {
    personality?: string;
    relationship?: string;
    name?: string | null;
    preferences?: any;
  };
  createdAt: Timestamp;
  lastLogin?: Timestamp;
  type: "free" | "pro" | "ultimate" | "admin";
  notificationsEnabled: boolean;
  tokensUsed?: number;
  responseTime?: number;
  summary?: string;
  updatedAt: Date;
}
