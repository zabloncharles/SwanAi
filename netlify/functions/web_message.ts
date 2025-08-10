const { Handler } = require("@netlify/functions");
const { processUserMessage } = require("./core/aiProcessor");

const handler = async (event) => {
  console.log(`=== Web Message Function Triggered ===`);
  console.log(`Method: ${event.httpMethod}`);
  console.log(`Path: ${event.path}`);
  console.log(`Headers:`, event.headers);

  // Handle CORS preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "Method not allowed",
      }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { userId, message } = body;

    // Validate required fields
    if (!userId || !message) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          success: false,
          error: "Missing required fields: userId and message",
        }),
      };
    }

    // Validate message length
    if (typeof message !== "string" || message.trim().length === 0) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          success: false,
          error: "Message cannot be empty",
        }),
      };
    }

    if (message.length > 1000) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          success: false,
          error: "Message too long (max 1000 characters)",
        }),
      };
    }

    console.log(`Processing web message for user ${userId}: "${message}"`);

    // Process the message using the shared core logic
    const result = await processUserMessage(userId, message);

    console.log(`Web message processed successfully for user ${userId}`);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: true,
        message: result.message,
        tokensUsed: result.tokensUsed,
        responseTime: result.responseTime,
        updatedSummary: result.updatedSummary,
        updatedProfile: result.updatedProfile,
        povImageUrl: result.povImageUrl, // Include POV image URL if generated
      }),
    };
  } catch (error) {
    console.error("Error processing web message:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: "Internal server error",
        details: error.message,
      }),
    };
  }
};

module.exports.handler = handler;
