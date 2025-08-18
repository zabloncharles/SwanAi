import { db } from "../config/firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp 
} from "firebase/firestore";
import { PersonalityAvatar, AvatarRegistry } from "../types/personality";

const AVATAR_REGISTRY_COLLECTION = "personality_avatars";

// Get avatar from registry
export const getAvatarFromRegistry = async (personality: string): Promise<string | null> => {
  try {
    const avatarDoc = doc(db, AVATAR_REGISTRY_COLLECTION, personality);
    const avatarSnap = await getDoc(avatarDoc);
    
    if (avatarSnap.exists()) {
      const avatarData = avatarSnap.data() as PersonalityAvatar;
      console.log(`Avatar found in registry for ${personality}:`, avatarData.avatarUrl);
      return avatarData.avatarUrl;
    }
    
    console.log(`No avatar found in registry for ${personality}`);
    return null;
  } catch (error) {
    console.error(`Error getting avatar from registry for ${personality}:`, error);
    return null;
  }
};

// Store avatar in registry
export const storeAvatarInRegistry = async (
  personality: string, 
  avatarUrl: string, 
  prompt: string
): Promise<void> => {
  try {
    const avatarData: PersonalityAvatar = {
      personality,
      avatarUrl,
      generatedAt: new Date(),
      prompt,
      lastUpdated: new Date()
    };
    
    const avatarDoc = doc(db, AVATAR_REGISTRY_COLLECTION, personality);
    await setDoc(avatarDoc, {
      ...avatarData,
      generatedAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    });
    
    console.log(`Avatar stored in registry for ${personality}:`, avatarUrl);
  } catch (error) {
    console.error(`Error storing avatar in registry for ${personality}:`, error);
    throw error;
  }
};

// Get all avatars from registry
export const getAllAvatarsFromRegistry = async (): Promise<AvatarRegistry> => {
  try {
    const avatarsQuery = query(collection(db, AVATAR_REGISTRY_COLLECTION));
    const avatarsSnap = await getDocs(avatarsQuery);
    
    const avatarRegistry: AvatarRegistry = {};
    
    avatarsSnap.forEach((doc) => {
      const avatarData = doc.data() as PersonalityAvatar;
      avatarRegistry[avatarData.personality] = avatarData;
    });
    
    console.log(`Retrieved ${Object.keys(avatarRegistry).length} avatars from registry`);
    return avatarRegistry;
  } catch (error) {
    console.error("Error getting all avatars from registry:", error);
    return {};
  }
};

// Check if avatar exists in registry
export const isAvatarInRegistry = async (personality: string): Promise<boolean> => {
  try {
    const avatarDoc = doc(db, AVATAR_REGISTRY_COLLECTION, personality);
    const avatarSnap = await getDoc(avatarDoc);
    return avatarSnap.exists();
  } catch (error) {
    console.error(`Error checking if avatar exists in registry for ${personality}:`, error);
    return false;
  }
};

// Update avatar in registry
export const updateAvatarInRegistry = async (
  personality: string, 
  avatarUrl: string, 
  prompt: string
): Promise<void> => {
  try {
    const avatarDoc = doc(db, AVATAR_REGISTRY_COLLECTION, personality);
    await setDoc(avatarDoc, {
      avatarUrl,
      prompt,
      lastUpdated: serverTimestamp()
    }, { merge: true });
    
    console.log(`Avatar updated in registry for ${personality}:`, avatarUrl);
  } catch (error) {
    console.error(`Error updating avatar in registry for ${personality}:`, error);
    throw error;
  }
};
