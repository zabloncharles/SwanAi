import { Handler } from "@netlify/functions";

const handler: Handler = async (event) => {
  // Handle CORS
  if (event.httpMethod === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (event.httpMethod !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const { prompt, personality } = JSON.parse(event.body || "{}");

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }

    console.log(`Generating avatar for personality: ${personality}`);
    console.log(`Prompt: ${prompt}`);

    // Generate image using DeepAI
    const formData = new FormData();
    formData.append('text', prompt);

    const response = await fetch('https://api.deepai.org/api/text2img', {
      method: 'POST',
      headers: {
        'api-key': process.env.DEEPAI_API_KEY || '',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`DeepAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const imageUrl = data.output_url;

    if (!imageUrl) {
      throw new Error("Failed to generate image with DeepAI");
    }

    console.log(`Avatar generated successfully for ${personality} using DeepAI`);

    return new Response(
      JSON.stringify({
        imageUrl,
        personality,
        success: true,
        provider: "DeepAI",
      }),
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error generating avatar:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to generate avatar",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }
};

export default handler;
