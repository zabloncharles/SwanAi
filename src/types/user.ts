export interface UserData {
  uid: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  type: 'free' | 'pro' | 'admin';
  personality?: string;
  aiRelationship?: string;
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
} 