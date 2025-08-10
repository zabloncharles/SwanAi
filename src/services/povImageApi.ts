// Service for generating POV (Point of View) images when users ask "wyd"

export interface POVImageRequest {
  personality: string;
  userProfile?: {
    hobbies?: string[];
    location?: string;
    interests?: string[];
  };
  currentTime?: number; // Hour of day (0-23)
  location?: string;
  mood?: string;
}

export interface POVImageResponse {
  imageUrl: string;
  personality: string;
  success: boolean;
  provider: string;
  type: string;
  prompt: string;
}

// Generate POV image when user asks "wyd"
export const generatePOVImage = async (
  request: POVImageRequest
): Promise<string> => {
  try {
    console.log("Generating POV image for:", request);

    const response = await fetch("/.netlify/functions/generate_pov_image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error("Failed to generate POV image");
    }

    const data: POVImageResponse = await response.json();
    console.log("POV image generated:", data);

    return data.imageUrl;
  } catch (error) {
    console.error("Error generating POV image:", error);
    // Return a default placeholder image
    return "/images/default-pov.jpg";
  }
};

// Check if a message is asking "what you doing" or similar
export const isWYDMessage = (message: string): boolean => {
  const wydPatterns = [
    /wyd/i, // what you doing
    /what you doing/i,
    /what are you doing/i,
    /what're you doing/i,
    /what u doing/i,
    /what you up to/i,
    /what are you up to/i,
    /what're you up to/i,
    /what u up to/i,
    /what you been up to/i,
    /what have you been up to/i,
    /what you been doing/i,
    /what have you been doing/i,
    /busy\?/i,
    /what's going on/i,
    /whats going on/i,
    /how's it going/i,
    /hows it going/i,
  ];

  return wydPatterns.some((pattern) => pattern.test(message));
};

// Get current time context for POV image
export const getCurrentTimeContext = (): number => {
  return new Date().getHours();
};

// Get mood based on recent conversation context
export const getMoodFromContext = (recentMessages: string[]): string => {
  const positiveWords = [
    "happy",
    "excited",
    "great",
    "awesome",
    "amazing",
    "love",
    "fun",
    "good",
  ];
  const negativeWords = [
    "sad",
    "tired",
    "stressed",
    "worried",
    "bad",
    "terrible",
    "awful",
  ];
  const neutralWords = ["okay", "fine", "normal", "alright", "busy"];

  const allText = recentMessages.join(" ").toLowerCase();

  const positiveCount = positiveWords.filter((word) =>
    allText.includes(word)
  ).length;
  const negativeCount = negativeWords.filter((word) =>
    allText.includes(word)
  ).length;
  const neutralCount = neutralWords.filter((word) =>
    allText.includes(word)
  ).length;

  if (positiveCount > negativeCount && positiveCount > neutralCount) {
    return "happy";
  } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
    return "stressed";
  } else {
    return "neutral";
  }
};
