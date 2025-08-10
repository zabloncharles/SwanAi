const { Handler } = require("@netlify/functions");

const handler = async (event) => {
  console.log("=== Generate Avatar Function Triggered ===");
  console.log("Method:", event.httpMethod);
  console.log("Path:", event.path);
  console.log("Headers:", JSON.stringify(event.headers, null, 2));

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
    const { prompt, personality } = JSON.parse(event.body || "{}");
    console.log("Request body:", { prompt, personality });

    if (!prompt) {
      console.log("No prompt provided");
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Prompt is required" }),
      };
    }

    console.log(`Generating avatar for personality: ${personality}`);
    console.log(`Prompt: ${prompt}`);

    // Check if DeepAI API key is available
    const deepaiApiKey = process.env.DEEPAI_API_KEY;
    if (!deepaiApiKey) {
      console.error("DeepAI API key not found in environment variables");
      throw new Error("DeepAI API key not configured");
    }

    // Generate image using DeepAI
    const formData = new FormData();
    formData.append("text", prompt);

    console.log("Making request to DeepAI API...");
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
      throw new Error("Failed to generate image with DeepAI");
    }

    console.log(
      `Avatar generated successfully for ${personality} using DeepAI`
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
      }),
    };
  } catch (error) {
    console.error("Error generating avatar:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Failed to generate avatar",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

module.exports = { handler };
