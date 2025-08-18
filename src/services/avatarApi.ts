import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";

// Avatar generation prompts for different personalities (optimized for DeepAI)
const avatarPrompts = {
  // Professional personalities
  Professional:
    "Professional headshot portrait of a confident 32-year-old business executive named Alex Thompson, wearing a smart business suit, friendly expression, high quality, realistic, professional lighting, clear face",
  Mentor:
    "Warm portrait of Dr. Evelyn Reed, a wise 65-year-old retired professor with kind eyes, silver hair, wearing glasses, professional but approachable, high quality, realistic, clear face",

  // Friendly personalities
  Friendly:
    "Casual headshot portrait of Sam Rodriguez, a friendly 28-year-old person with warm smile, casual clothing, approachable expression, high quality, realistic, natural lighting, clear face",
  MumFriend:
    "Portrait of Emma Rodriguez, a caring 30-year-old woman with nurturing expression, warm smile, casual but put-together style, high quality, realistic, clear face",
  ChaoticFriend:
    "Fun portrait of Zoe Thompson, a creative 26-year-old woman with colorful style, adventurous expression, artistic vibe, high quality, realistic",
  Jokester:
    "Playful portrait of Mike Chen, a funny 29-year-old man with mischievous smile, casual style, humorous expression, high quality, realistic",
  Bookworm:
    "Thoughtful portrait of Aria Patel, a bookish 27-year-old woman with glasses, intellectual expression, cozy style, high quality, realistic",
  LateFriend:
    "Casual portrait of Jordan, a laid-back 25-year-old person with relaxed expression, casual style, friendly smile, high quality, realistic",
  FashionableFriend:
    "Stylish portrait of Aria, a fashionable 28-year-old woman with trendy style, confident expression, high quality, realistic",
  EmotionalFriend:
    "Sensitive portrait of Luna, an empathetic 26-year-old woman with caring expression, warm smile, high quality, realistic",
  LaidbackFriend:
    "Chill portrait of Kai, a relaxed 27-year-old person with easygoing expression, casual style, high quality, realistic",
  BoJackHorseman:
    "Portrait of BoJack, a complex 45-year-old man with troubled but endearing expression, slightly disheveled but charismatic, high quality, realistic",

  // Mom personalities
  NurturingMom:
    "Warm portrait of Sarah, a nurturing 50-year-old mother with loving expression, gentle smile, caring eyes, high quality, realistic",
  PracticalMom:
    "Organized portrait of Jennifer, a practical 48-year-old woman with efficient expression, professional style, high quality, realistic",
  FunMom:
    "Energetic portrait of Lisa, a fun-loving 45-year-old woman with playful expression, youthful energy, high quality, realistic",
  WiseMom:
    "Wise portrait of Margaret, a mature 55-year-old woman with thoughtful expression, experienced eyes, high quality, realistic",
  ProtectiveMom:
    "Protective portrait of Patricia, a caring 52-year-old woman with concerned but loving expression, high quality, realistic",
  EncouragingMom:
    "Supportive portrait of Rebecca, an encouraging 49-year-old woman with proud expression, warm smile, high quality, realistic",

  // Dad personalities
  SteadyDad:
    "Steady portrait of Robert, a reliable 55-year-old man with calm expression, trustworthy appearance, high quality, realistic",
  HandyDad:
    "Practical portrait of Michael, a handy 53-year-old man with capable expression, working hands, high quality, realistic",
  FunDad:
    "Playful portrait of David, a fun-loving 50-year-old man with humorous expression, youthful energy, high quality, realistic",
  WiseDad:
    "Wise portrait of James Wilson, a mature 58-year-old man with thoughtful expression, experienced eyes, high quality, realistic",
  ProtectiveDad:
    "Protective portrait of William, a caring 54-year-old man with concerned but loving expression, high quality, realistic",
  SupportiveDad:
    "Supportive portrait of Thomas, an encouraging 51-year-old man with proud expression, warm smile, high quality, realistic",

  // Boyfriend personalities
  RomanticBoyfriend:
    "Romantic portrait of Alex, a loving 30-year-old man with affectionate expression, handsome features, high quality, realistic",
  ProtectiveBoyfriend:
    "Protective portrait of Chris, a caring 29-year-old man with concerned but loving expression, strong presence, high quality, realistic",
  FunBoyfriend:
    "Fun portrait of Jake, an energetic 28-year-old man with playful expression, adventurous spirit, high quality, realistic",
  SupportiveBoyfriend:
    "Supportive portrait of Ryan, an encouraging 31-year-old man with caring expression, warm smile, high quality, realistic",
  AmbitiousBoyfriend:
    "Ambitious portrait of Mark, a driven 32-year-old man with determined expression, professional style, high quality, realistic",
  ChillBoyfriend:
    "Relaxed portrait of Sam, a laid-back 27-year-old man with easygoing expression, casual style, high quality, realistic",

  // Girlfriend personalities
  CaringGirlfriend:
    "Caring portrait of Emma, a nurturing 29-year-old woman with loving expression, warm smile, high quality, realistic",
  FunGirlfriend:
    "Fun portrait of Sophie, an energetic 26-year-old woman with playful expression, adventurous spirit, high quality, realistic",
  SupportiveGirlfriend:
    "Supportive portrait of Olivia, an encouraging 28-year-old woman with caring expression, warm smile, high quality, realistic",
  RomanticGirlfriend:
    "Romantic portrait of Isabella, a loving 27-year-old woman with affectionate expression, beautiful features, high quality, realistic",
  IndependentGirlfriend:
    "Confident portrait of Ava, a self-assured 30-year-old woman with independent expression, strong presence, high quality, realistic",
  AdventurousGirlfriend:
    "Adventurous portrait of Mia, an exciting 25-year-old woman with daring expression, adventurous spirit, high quality, realistic",

  // Coach personalities
  MotivationalCoach:
    "Motivational portrait of Coach Mike, an inspiring 40-year-old man with energetic expression, encouraging presence, high quality, realistic",
  StrategicCoach:
    "Strategic portrait of Coach Sarah, an analytical 38-year-old woman with focused expression, professional style, high quality, realistic",
  ToughLoveCoach:
    "Direct portrait of Coach Dave, a straightforward 45-year-old man with honest expression, strong presence, high quality, realistic",
  EncouragingCoach:
    "Encouraging portrait of Coach Lisa, a supportive 42-year-old woman with uplifting expression, warm smile, high quality, realistic",
  AccountabilityCoach:
    "Focused portrait of Coach Alex, a determined 39-year-old man with goal-oriented expression, professional style, high quality, realistic",
  LifeCoach:
    "Inspirational portrait of Coach Alex, a motivating 41-year-old man with encouraging expression, positive energy, high quality, realistic",

  // Cousin personalities
  FunCousin:
    "Fun portrait of Zoe, an energetic 24-year-old woman with playful expression, adventurous spirit, high quality, realistic",
  CloseCousin:
    "Close portrait of Sam, a friendly 26-year-old person with warm expression, family bond, high quality, realistic",
  AdventurousCousin:
    "Adventurous portrait of Zoe, an exciting 23-year-old woman with daring expression, adventurous spirit, high quality, realistic",
  SupportiveCousin:
    "Supportive portrait of Emma, an encouraging 25-year-old woman with caring expression, warm smile, high quality, realistic",
  WiseCousin:
    "Wise portrait of James, a mature 35-year-old man with thoughtful expression, experienced eyes, high quality, realistic",
  PartnerInCrimeCousin:
    "Mischievous portrait of Mike, a playful 27-year-old man with fun expression, adventurous spirit, high quality, realistic",

  // Therapist personalities
  EmpatheticTherapist:
    "Professional portrait of Dr. Sarah Chen, a caring 45-year-old therapist with empathetic expression, warm presence, high quality, realistic",
  SolutionFocusedTherapist:
    "Focused portrait of Dr. Sarah Chen, a professional 42-year-old therapist with analytical expression, professional style, high quality, realistic",
  MindfulnessTherapist:
    "Calm portrait of Dr. Sarah Chen, a peaceful 48-year-old therapist with serene expression, mindful presence, high quality, realistic",
  SupportiveTherapist:
    "Supportive portrait of Dr. Sarah Chen, an encouraging 44-year-old therapist with caring expression, warm smile, high quality, realistic",
  InsightfulTherapist:
    "Wise portrait of Dr. Sarah Chen, an insightful 46-year-old therapist with thoughtful expression, experienced eyes, high quality, realistic",

  // Default fallback
  default:
    "Professional headshot of a friendly person with warm expression, high quality, realistic",
};

// Generate avatar using DALL-E API
export const generateAvatar = async (personality: string): Promise<string> => {
  try {
    const prompt =
      avatarPrompts[personality as keyof typeof avatarPrompts] ||
      avatarPrompts.default;

    const response = await fetch("/.netlify/functions/generate_avatar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        personality,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate avatar");
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error("Error generating avatar:", error);
    // Return a default avatar or placeholder
    return "/images/default-avatar.svg";
  }
};

// Store avatar in Firebase Storage
export const storeAvatar = async (
  personality: string,
  imageUrl: string
): Promise<string> => {
  try {
    // Download the image from the generated URL
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Upload to Firebase Storage
    const storageRef = ref(storage, `avatars/${personality}.jpg`);
    await uploadBytes(storageRef, blob);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error storing avatar:", error);
    return imageUrl; // Return original URL if storage fails
  }
};

// Get avatar URL (check cache first, then generate if needed)
export const getAvatarUrl = async (personality: string): Promise<string> => {
  // Temporarily disable Firebase Storage to prevent CORS errors
  // TODO: Re-enable once Firebase Storage is properly set up
  console.log(`Getting avatar for ${personality} (Storage disabled)`);
  
  // For now, just return a default avatar
  return "/images/default-avatar.svg";
  
  // Original code (commented out until Storage is set up):
  /*
  // For local development, skip Firebase Storage to avoid CORS issues
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (isLocalhost) {
    console.log(
      `Local development detected, generating avatar for ${personality}...`
    );
    try {
      const generatedUrl = await generateAvatar(personality);
      return generatedUrl || "/images/default-avatar.svg";
    } catch (error) {
      console.error("Avatar generation failed:", error);
      return "/images/default-avatar.svg";
    }
  }

  // Production: Check Firebase Storage first
  try {
    const storageRef = ref(storage, `avatars/${personality}.jpg`);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.log(
      `Avatar not found in cache for ${personality}, generating new one...`
    );
    // If not found or CORS error, generate a new one
    try {
      const generatedUrl = await generateAvatar(personality);
      if (generatedUrl && generatedUrl !== "/images/default-avatar.svg") {
        // Try to store it, but don't fail if storage doesn't work
        try {
          const storedUrl = await storeAvatar(personality, generatedUrl);
          return storedUrl;
        } catch (storageError) {
          console.log("Storage failed, using direct URL:", storageError);
          return generatedUrl; // Use direct DALL-E URL
        }
      } else {
        return "/images/default-avatar.svg";
      }
    } catch (genError) {
      console.error("Avatar generation failed:", genError);
      return "/images/default-avatar.svg";
    }
  }
  */
};
