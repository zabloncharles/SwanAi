const handler = async (event) => {
  console.log("=== Generate POV Image Function Triggered ===");
  console.log("Method:", event.httpMethod);
  console.log("Path:", event.path);

  // Handle CORS
  if (event.httpMethod === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    };
  }

  if (event.httpMethod !== "POST") {
    console.log(`Method not allowed: ${event.httpMethod}`);
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { personality, userProfile, currentTime, location, mood } =
      JSON.parse(event.body || "{}");
    console.log("Request body:", {
      personality,
      userProfile,
      currentTime,
      location,
      mood,
    });

    if (!personality) {
      console.log("No personality provided");
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Personality is required" }),
      };
    }

    // Check if DeepAI API key is available
    const deepaiApiKey = process.env.DEEPAI_API_KEY;
    if (!deepaiApiKey) {
      console.error("DeepAI API key not found in environment variables");
      throw new Error("DeepAI API key not configured");
    }

    // Generate POV image prompt based on personality and context
    const povPrompt = generatePOVPrompt(
      personality,
      userProfile,
      currentTime,
      location,
      mood
    );
    console.log(`Generating POV image for personality: ${personality}`);
    console.log(`POV Prompt: ${povPrompt}`);

    // Generate image using DeepAI
    const formData = new FormData();
    formData.append("text", povPrompt);

    console.log("Making request to DeepAI API for POV image...");
    const response = await fetch("https://api.deepai.org/api/text2img", {
      method: "POST",
      headers: {
        "api-key": deepaiApiKey,
      },
      body: formData,
    });

    console.log(`DeepAI response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepAI API error response:", errorText);
      throw new Error(
        `DeepAI API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("DeepAI response data:", data);

    const imageUrl = data.output_url;

    if (!imageUrl) {
      console.error("No image URL in DeepAI response");
      throw new Error("Failed to generate POV image with DeepAI");
    }

    console.log(
      `POV image generated successfully for ${personality} using DeepAI`
    );
    console.log(`Image URL: ${imageUrl}`);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl,
        personality,
        success: true,
        provider: "DeepAI",
        type: "pov_image",
        prompt: povPrompt,
      }),
    };
  } catch (error) {
    console.error("Error generating POV image:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Failed to generate POV image",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

// Generate POV image prompts based on personality and context
function generatePOVPrompt(
  personality,
  userProfile,
  currentTime,
  location,
  mood
) {
  const timeOfDay = getTimeOfDay(currentTime);
  const basePrompts = {
    Professional: {
      morning:
        "First-person view from behind glasses, professional office setting, desk with laptop, coffee cup, organized workspace, business documents, modern office environment, natural lighting, realistic, high quality, immersive view, no glasses visible in frame",
      afternoon:
        "First-person view from behind glasses, conference room meeting, presentation screen, colleagues around table, professional attire, business setting, natural lighting, realistic, high quality, immersive view, no glasses visible in frame",
      evening:
        "First-person view from behind glasses, home office setup, laptop screen, comfortable chair, warm lighting, professional but relaxed atmosphere, realistic, high quality, immersive view, no glasses visible in frame",
      night:
        "First-person view from behind glasses, late night work session, desk lamp, laptop screen glow, quiet home office, professional focus, realistic, high quality, immersive view, no glasses visible in frame",
    },
    Friendly: {
      morning:
        "First-person view from behind glasses, cozy coffee shop, laptop on table, coffee cup, people chatting in background, warm lighting, casual atmosphere, realistic, high quality, immersive view, no glasses visible in frame",
      afternoon:
        "First-person view from behind glasses, outdoor patio, laptop on table, trees and sky visible, natural lighting, relaxed work environment, realistic, high quality, immersive view, no glasses visible in frame",
      evening:
        "First-person view from behind glasses, living room couch, TV remote, snacks on coffee table, comfortable home setting, warm lighting, realistic, high quality, immersive view, no glasses visible in frame",
      night:
        "First-person view from behind glasses, bedroom, phone screen glow, comfortable bed, soft lighting, late night scrolling, realistic, high quality, immersive view, no glasses visible in frame",
    },
    MumFriend: {
      morning:
        "First-person view from behind glasses, kitchen counter, coffee mug, breakfast preparation, warm morning light, cozy home environment, realistic, high quality, immersive view, no glasses visible in frame",
      afternoon:
        "First-person view from behind glasses, living room, book in hand, comfortable chair, natural light through windows, peaceful home setting, realistic, high quality, immersive view, no glasses visible in frame",
      evening:
        "First-person view from behind glasses, dining table, home-cooked meal, family photos on wall, warm lighting, cozy atmosphere, realistic, high quality, immersive view, no glasses visible in frame",
      night:
        "First-person view from behind glasses, bedroom, reading lamp, book on nightstand, soft lighting, peaceful evening, realistic, high quality, immersive view, no glasses visible in frame",
    },
    ChaoticFriend: {
      morning:
        "First-person view from behind glasses, messy desk, multiple screens, coffee cups, creative chaos, colorful workspace, natural lighting, realistic, high quality, immersive view, no glasses visible in frame",
      afternoon:
        "First-person view from behind glasses, outdoor adventure, hiking trail, nature view, backpack visible, natural lighting, realistic, high quality, immersive view, no glasses visible in frame",
      evening:
        "First-person view from behind glasses, creative studio, art supplies, colorful workspace, creative project in progress, warm lighting, realistic, high quality, immersive view, no glasses visible in frame",
      night:
        "First-person view from behind glasses, gaming setup, multiple monitors, colorful lighting, late night gaming session, realistic, high quality, immersive view, no glasses visible in frame",
    },
    Jokester: {
      morning:
        "First-person view from behind glasses, funny morning routine, coffee mug with funny quote, playful morning energy, natural lighting, realistic, high quality, immersive view, no glasses visible in frame",
      afternoon:
        "First-person view from behind glasses, outdoor fun activity, friends laughing, casual setting, playful atmosphere, natural lighting, realistic, high quality, immersive view, no glasses visible in frame",
      evening:
        "First-person view from behind glasses, comedy show or funny TV, popcorn bowl, laughing environment, warm lighting, realistic, high quality, immersive view, no glasses visible in frame",
      night:
        "First-person view from behind glasses, late night comedy, cozy setting, soft lighting, realistic, high quality, immersive view, no glasses visible in frame",
    },
    BoJackHorseman: {
      morning:
        "First-person view from behind glasses, Hollywood hills view, pool in background, morning coffee, luxurious setting, natural lighting, realistic, high quality, immersive view, no glasses visible in frame",
      afternoon:
        "First-person view from behind glasses, studio lot, film equipment, creative chaos, industry setting, natural lighting, realistic, high quality, immersive view, no glasses visible in frame",
      evening:
        "First-person view from behind glasses, fancy restaurant, wine glass, upscale atmosphere, warm lighting, realistic, high quality, immersive view, no glasses visible in frame",
      night:
        "First-person view from behind glasses, rooftop view, city lights, contemplative mood, soft lighting, realistic, high quality, immersive view, no glasses visible in frame",
    },
    IndependentGirlfriend: {
      morning:
        "First-person view from behind glasses, yoga mat, morning workout, natural light, healthy breakfast, empowering morning routine, realistic, high quality, immersive view, no glasses visible in frame",
      afternoon:
        "First-person view from behind glasses, independent activity, self-care moment, natural lighting, confident atmosphere, realistic, high quality, immersive view, no glasses visible in frame",
      evening:
        "First-person view from behind glasses, cozy home setting, personal project, warm lighting, independent lifestyle, realistic, high quality, immersive view, no glasses visible in frame",
      night:
        "First-person view from behind glasses, peaceful evening, personal space, soft lighting, independent mood, realistic, high quality, immersive view, no glasses visible in frame",
    },
    FunGirlfriend: {
      morning:
        "First-person view from behind glasses, fun morning activity, bright energy, natural light, playful atmosphere, realistic, high quality, immersive view, no glasses visible in frame",
      afternoon:
        "First-person view from behind glasses, exciting adventure, fun activity, natural lighting, energetic mood, realistic, high quality, immersive view, no glasses visible in frame",
      evening:
        "First-person view from behind glasses, fun evening plans, social setting, warm lighting, lively atmosphere, realistic, high quality, immersive view, no glasses visible in frame",
      night:
        "First-person view from behind glasses, fun night activity, exciting environment, soft lighting, realistic, high quality, immersive view, no glasses visible in frame",
    },
    CaringGirlfriend: {
      morning:
        "First-person view from behind glasses, caring morning routine, thoughtful gesture, natural light, loving atmosphere, realistic, high quality, immersive view, no glasses visible in frame",
      afternoon:
        "First-person view from behind glasses, caring activity, helping someone, natural lighting, compassionate mood, realistic, high quality, immersive view, no glasses visible in frame",
      evening:
        "First-person view from behind glasses, caring evening, thoughtful setting, warm lighting, loving environment, realistic, high quality, immersive view, no glasses visible in frame",
      night:
        "First-person view from behind glasses, caring night, peaceful setting, soft lighting, realistic, high quality, immersive view, no glasses visible in frame",
    },
    Therapist: {
      morning:
        "First-person view from behind glasses, peaceful morning routine, meditation space, natural light, calm atmosphere, realistic, high quality, immersive view, no glasses visible in frame",
      afternoon:
        "First-person view from behind glasses, therapy session setup, comfortable chair, natural lighting, professional but warm environment, realistic, high quality, immersive view, no glasses visible in frame",
      evening:
        "First-person view from behind glasses, self-care evening, peaceful setting, warm lighting, therapeutic atmosphere, realistic, high quality, immersive view, no glasses visible in frame",
      night:
        "First-person view from behind glasses, quiet reflection, peaceful night, soft lighting, realistic, high quality, immersive view, no glasses visible in frame",
    },
    Coach: {
      morning:
        "First-person view from behind glasses, gym or workout space, fitness equipment, natural light, energetic morning, realistic, high quality, immersive view, no glasses visible in frame",
      afternoon:
        "First-person view from behind glasses, coaching session, motivational setting, natural lighting, inspiring atmosphere, realistic, high quality, immersive view, no glasses visible in frame",
      evening:
        "First-person view from behind glasses, post-workout recovery, healthy meal, warm lighting, fitness lifestyle, realistic, high quality, immersive view, no glasses visible in frame",
      night:
        "First-person view from behind glasses, planning next day's goals, organized space, soft lighting, realistic, high quality, immersive view, no glasses visible in frame",
    },
    Mentor: {
      morning:
        "First-person view from behind glasses, study or office space, books and notes, natural light, intellectual morning, realistic, high quality, immersive view, no glasses visible in frame",
      afternoon:
        "First-person view from behind glasses, mentoring session, educational setting, natural lighting, wise atmosphere, realistic, high quality, immersive view, no glasses visible in frame",
      evening:
        "First-person view from behind glasses, reading or studying, comfortable chair, warm lighting, learning environment, realistic, high quality, immersive view, no glasses visible in frame",
      night:
        "First-person view from behind glasses, quiet study time, peaceful setting, soft lighting, realistic, high quality, immersive view, no glasses visible in frame",
    },
  };

  // Get the base prompt for the personality and time of day
  let prompt =
    basePrompts[personality]?.[timeOfDay] ||
    basePrompts[personality]?.afternoon ||
    basePrompts.Friendly.afternoon;

  // Add location context if available
  if (location) {
    prompt += `, location: ${location}`;
  }

  // Add mood context if available
  if (mood) {
    prompt += `, mood: ${mood}`;
  }

  // Add user profile context if available
  if (userProfile?.hobbies?.length > 0) {
    const randomHobby =
      userProfile.hobbies[
        Math.floor(Math.random() * userProfile.hobbies.length)
      ];
    prompt += `, activity related to: ${randomHobby}`;
  }

  // Add portrait aspect ratio specification
  prompt += `, portrait orientation, 9:16 aspect ratio, vertical composition`;

  return prompt;
}

function getTimeOfDay(currentTime) {
  if (!currentTime) {
    // Default to current time if not provided
    const now = new Date();
    currentTime = now.getHours();
  }

  if (currentTime >= 5 && currentTime < 12) return "morning";
  if (currentTime >= 12 && currentTime < 17) return "afternoon";
  if (currentTime >= 17 && currentTime < 21) return "evening";
  return "night";
}

module.exports = { handler };
