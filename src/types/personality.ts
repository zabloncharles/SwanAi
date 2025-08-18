export interface PersonalityAvatar {
  personality: string;
  avatarUrl: string;
  generatedAt: Date;
  prompt: string;
  lastUpdated: Date;
}

export interface AvatarRegistry {
  [personality: string]: PersonalityAvatar;
}

export interface DailyRoutine {
  morning: string[];
  afternoon: string[];
  evening: string[];
  night: string[];
}

export interface PersonalityRoutine {
  personality: string;
  dailyRoutines: DailyRoutine;
  personalityTraits: string[];
  commonActivities: string[];
}
