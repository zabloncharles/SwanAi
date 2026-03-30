const axios = require("axios");
const { handler: healthResponseHandler } = require("./health_response");
export {};

async function sendWhatsAppMessage({ to, text }) {
  const baseUrl =
    process.env.VONAGE_MESSAGES_BASE_URL || "https://messages-sandbox.nexmo.com";
  const url = `${baseUrl}/v1/messages`;

  const response = await axios.post(
    url,
    {
      from: process.env.VONAGE_WHATSAPP_FROM || process.env.VONAGE_PHONE_NUMBER,
      to,
      message_type: "text",
      text,
      channel: "whatsapp",
    },
    {
      auth: {
        username: process.env.VONAGE_API_KEY,
        password: process.env.VONAGE_API_SECRET,
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  return response.data;
}

const handler = async (event) => {
  if (event.httpMethod === "POST") {
    let body: any = {};
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch {
      body = {};
    }

    if (body.action === "send_welcome_message") {
      const to = String(body.phoneNumber || "").replace(/\D/g, "");
      if (!to) {
        return {
          statusCode: 400,
          body: JSON.stringify({ success: false, error: "Missing phoneNumber" }),
        };
      }

      const welcomeText =
        body.welcomeText ||
        `Hi${body.userName ? ` ${body.userName}` : ""}. Daily health checks are active. Reply YES when you are okay.`;

      try {
        await sendWhatsAppMessage({ to, text: welcomeText });
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true }),
        };
      } catch (error) {
        return {
          statusCode: 500,
          body: JSON.stringify({
            success: false,
            error: "Failed to send welcome message",
            details: error?.message || "unknown_error",
          }),
        };
      }
    }
  }

  return healthResponseHandler(event);
};

module.exports.handler = handler;
