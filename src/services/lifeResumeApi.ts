import { AILifeResume } from "../types/aiLifeResume";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://swanai.netlify.app"
    : "http://localhost:8889";

// Generate a new AI life resume
export const generateLifeResume = async (
  personality: string,
  relationship: string,
  userId: string,
  userLocation?: string
): Promise<AILifeResume> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/.netlify/functions/generate_life_resume`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personality,
          relationship,
          userId,
          userLocation,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to generate life resume");
    }

    return data.lifeResume;
  } catch (error) {
    console.error("Error generating life resume:", error);
    throw error;
  }
};

// Store life resume in local storage for caching
export const storeLifeResumeInCache = (
  userId: string,
  personality: string,
  relationship: string,
  resume: AILifeResume
): void => {
  try {
    const key = `lifeResume_${userId}_${personality}_${relationship}`;
    localStorage.setItem(key, JSON.stringify(resume));
    console.log("Life resume cached locally");
  } catch (error) {
    console.error("Error caching life resume:", error);
  }
};

// Get life resume from local storage cache
export const getLifeResumeFromCache = (
  userId: string,
  personality: string,
  relationship: string
): AILifeResume | null => {
  try {
    const key = `lifeResume_${userId}_${personality}_${relationship}`;
    const cached = localStorage.getItem(key);

    if (cached) {
      const resume = JSON.parse(cached);
      // Check if cache is still valid (less than 24 hours old)
      const cacheAge = Date.now() - new Date(resume.generatedAt).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (cacheAge < maxAge) {
        console.log("Life resume retrieved from cache");
        return resume;
      } else {
        // Remove expired cache
        localStorage.removeItem(key);
      }
    }

    return null;
  } catch (error) {
    console.error("Error retrieving cached life resume:", error);
    return null;
  }
};

// Get or generate life resume (with caching)
export const getOrGenerateLifeResume = async (
  personality: string,
  relationship: string,
  userId: string,
  userLocation?: string
): Promise<AILifeResume> => {
  // First, try to get from cache
  const cachedResume = getLifeResumeFromCache(
    userId,
    personality,
    relationship
  );

  if (cachedResume) {
    return cachedResume;
  }

  // If not in cache, generate new one
  console.log("Generating new life resume...");
  const newResume = await generateLifeResume(
    personality,
    relationship,
    userId,
    userLocation
  );

  // Store in cache
  storeLifeResumeInCache(userId, personality, relationship, newResume);

  return newResume;
};

// Clear life resume cache for a specific combination
export const clearLifeResumeCache = (
  userId: string,
  personality: string,
  relationship: string
): void => {
  try {
    const key = `lifeResume_${userId}_${personality}_${relationship}`;
    localStorage.removeItem(key);
    console.log("Life resume cache cleared");
  } catch (error) {
    console.error("Error clearing life resume cache:", error);
  }
};

// Clear all life resume caches for a user
export const clearAllUserLifeResumeCaches = (userId: string): void => {
  try {
    const keys = Object.keys(localStorage);
    const userKeys = keys.filter((key) =>
      key.startsWith(`lifeResume_${userId}_`)
    );

    userKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

    console.log(`Cleared ${userKeys.length} life resume caches for user`);
  } catch (error) {
    console.error("Error clearing user life resume caches:", error);
  }
};
