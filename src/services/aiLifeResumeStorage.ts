import { db } from "../config/firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  addDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { AILifeResume } from "../types/aiLifeResume";

const LIFE_RESUME_COLLECTION = "ai_life_resumes";

// Store AI life resume in Firestore
export const storeAILifeResume = async (
  userId: string,
  personality: string,
  relationship: string,
  resume: AILifeResume
): Promise<string> => {
  try {
    const dataToStore = {
      ...resume,
      userId,
      personality,
      relationship,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log("Storing life resume with avatarUrl:", resume.avatarUrl);
    console.log("Full data being stored:", dataToStore);

    // Use userId as document ID for single resume per user
    const resumeRef = doc(db, LIFE_RESUME_COLLECTION, userId);
    await setDoc(resumeRef, dataToStore);

    console.log(
      `AI life resume stored for ${personality} ${relationship} with ID: ${userId}`
    );

    return userId;
  } catch (error) {
    console.error("Error storing AI life resume:", error);
    throw error;
  }
};

// Get AI life resume from Firestore by document ID
export const getAILifeResumeById = async (
  lifeResumeId: string
): Promise<AILifeResume | null> => {
  try {
    const resumeDoc = doc(db, LIFE_RESUME_COLLECTION, lifeResumeId);
    const resumeSnap = await getDoc(resumeDoc);

    if (resumeSnap.exists()) {
      const data = resumeSnap.data();
      console.log(`AI life resume found with ID: ${lifeResumeId}`);
      console.log("Retrieved life resume avatarUrl:", data.avatarUrl);
      console.log("Full retrieved data:", data);
      return data as AILifeResume;
    }

    console.log(`No AI life resume found with ID: ${lifeResumeId}`);
    return null;
  } catch (error) {
    console.error("Error getting AI life resume:", error);
    return null;
  }
};

// Get AI life resume from Firestore by userId (single resume per user)
export const getAILifeResume = async (
  userId: string,
  personality: string,
  relationship: string
): Promise<AILifeResume | null> => {
  try {
    console.log("=== QUERYING FOR LIFE RESUME ===");
    console.log("Querying with userId:", userId);

    // Use userId as document ID for single resume per user
    const resumeDoc = doc(db, LIFE_RESUME_COLLECTION, userId);
    const resumeSnap = await getDoc(resumeDoc);

    if (resumeSnap.exists()) {
      const data = resumeSnap.data();
      console.log(`✅ AI life resume found for user ${userId}`);
      console.log("Retrieved life resume avatarUrl:", data.avatarUrl);
      console.log("Full retrieved data:", data);
      return { ...data, id: userId } as AILifeResume;
    }

    console.log(`❌ No AI life resume found for user ${userId}`);
    return null;
  } catch (error) {
    console.error("Error getting AI life resume:", error);
    return null;
  }
};

// Get all AI life resumes for a user (returns single resume or empty array)
export const getAllUserLifeResumes = async (
  userId: string
): Promise<AILifeResume[]> => {
  try {
    // Use userId as document ID for single resume per user
    const resumeDoc = doc(db, LIFE_RESUME_COLLECTION, userId);
    const resumeSnap = await getDoc(resumeDoc);

    if (resumeSnap.exists()) {
      const data = resumeSnap.data();
      const resume = { ...data, id: userId } as AILifeResume;
      console.log(`Retrieved 1 AI life resume for user`);
      return [resume];
    }

    console.log(`Retrieved 0 AI life resumes for user`);
    return [];
  } catch (error) {
    console.error("Error getting user AI life resumes:", error);
    return [];
  }
};

// Check if AI life resume exists
export const doesLifeResumeExist = async (
  userId: string,
  personality: string,
  relationship: string
): Promise<boolean> => {
  try {
    const resumeId = `${userId}_${personality}_${relationship}`;
    const resumeDoc = doc(db, LIFE_RESUME_COLLECTION, resumeId);
    const resumeSnap = await getDoc(resumeDoc);
    return resumeSnap.exists();
  } catch (error) {
    console.error("Error checking if life resume exists:", error);
    return false;
  }
};

// Delete AI life resume
export const deleteAILifeResume = async (
  userId: string,
  personality: string,
  relationship: string
): Promise<void> => {
  try {
    // Use userId as document ID for single resume per user
    const resumeDoc = doc(db, LIFE_RESUME_COLLECTION, userId);
    await setDoc(resumeDoc, { deleted: true, deletedAt: serverTimestamp() });

    console.log(`AI life resume deleted for ${personality} ${relationship}`);
  } catch (error) {
    console.error("Error deleting AI life resume:", error);
    throw error;
  }
};

// Update AI life resume
export const updateAILifeResume = async (
  userId: string,
  personality: string,
  relationship: string,
  updates: Partial<AILifeResume>
): Promise<void> => {
  try {
    const resumeId = `${userId}_${personality}_${relationship}`;
    const resumeDoc = doc(db, LIFE_RESUME_COLLECTION, resumeId);

    await setDoc(
      resumeDoc,
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    console.log(`AI life resume updated for ${personality} ${relationship}`);
  } catch (error) {
    console.error("Error updating AI life resume:", error);
    throw error;
  }
};
