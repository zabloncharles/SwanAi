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
} from "firebase/firestore";
import { AILifeResume } from "../types/aiLifeResume";

const LIFE_RESUME_COLLECTION = "ai_life_resumes";

// Store AI life resume in Firestore
export const storeAILifeResume = async (
  userId: string,
  personality: string,
  relationship: string,
  resume: AILifeResume
): Promise<void> => {
  try {
    const resumeId = `${userId}_${personality}_${relationship}`;
    const resumeDoc = doc(db, LIFE_RESUME_COLLECTION, resumeId);

    await setDoc(resumeDoc, {
      ...resume,
      userId,
      personality,
      relationship,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`AI life resume stored for ${personality} ${relationship}`);
  } catch (error) {
    console.error("Error storing AI life resume:", error);
    throw error;
  }
};

// Get AI life resume from Firestore
export const getAILifeResume = async (
  userId: string,
  personality: string,
  relationship: string
): Promise<AILifeResume | null> => {
  try {
    const resumeId = `${userId}_${personality}_${relationship}`;
    const resumeDoc = doc(db, LIFE_RESUME_COLLECTION, resumeId);
    const resumeSnap = await getDoc(resumeDoc);

    if (resumeSnap.exists()) {
      const data = resumeSnap.data();
      console.log(`AI life resume found for ${personality} ${relationship}`);
      return data as AILifeResume;
    }

    console.log(`No AI life resume found for ${personality} ${relationship}`);
    return null;
  } catch (error) {
    console.error("Error getting AI life resume:", error);
    return null;
  }
};

// Get all AI life resumes for a user
export const getAllUserLifeResumes = async (
  userId: string
): Promise<AILifeResume[]> => {
  try {
    const resumesQuery = query(
      collection(db, LIFE_RESUME_COLLECTION),
      where("userId", "==", userId)
    );
    const resumesSnap = await getDocs(resumesQuery);

    const resumes: AILifeResume[] = [];
    resumesSnap.forEach((doc) => {
      const data = doc.data();
      resumes.push(data as AILifeResume);
    });

    console.log(`Retrieved ${resumes.length} AI life resumes for user`);
    return resumes;
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
    const resumeId = `${userId}_${personality}_${relationship}`;
    const resumeDoc = doc(db, LIFE_RESUME_COLLECTION, resumeId);
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
