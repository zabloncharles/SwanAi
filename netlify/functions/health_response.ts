const axios = require("axios");
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  query,
  where,
  limit,
  getDocs,
  doc,
  setDoc,
  getDoc,
} = require("firebase/firestore");

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function normalizePhoneNumber(phone) {
  const cleaned = String(phone || "").replace(/\D/g, "");
  if (cleaned.length === 10) return `1${cleaned}`;
  return cleaned;
}

function getLocalDateKey(timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const map = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  return `${map.year}-${map.month}-${map.day}`;
}

function parseStatusFromText(text) {
  const normalized = String(text || "").trim().toLowerCase();
  const yesPatterns = [
    "yes",
    "y",
    "ok",
    "okay",
    "i am okay",
    "i'm okay",
    "i am fine",
    "im fine",
    "fine",
    "good",
  ];
  const noPatterns = ["no", "not okay", "not ok", "help", "bad", "sick"];

  if (yesPatterns.includes(normalized)) return "responded_ok";
  if (noPatterns.includes(normalized)) return "needs_attention";
  return "responded_other";
}

async function sendWhatsAppMessage({ to, text }) {
  const baseUrl =
    process.env.VONAGE_MESSAGES_BASE_URL || "https://messages-sandbox.nexmo.com";
  const url = `${baseUrl}/v1/messages`;

  await axios.post(
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
}

const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const from = body.from || body.msisdn || body.sender?.number || body.sender?.id;
    const text =
      body.text ||
      body.message?.content?.text ||
      body.message?.text ||
      body.content?.text ||
      body.whatsapp?.text?.body;

    if (!from || !text) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: false, message: "No text to process" }),
      };
    }

    const normalizedFrom = normalizePhoneNumber(from);
    const recipientsRef = collection(db, "careRecipients");
    const recipientsQuery = query(
      recipientsRef,
      where("normalizedMonitoredPhone", "==", normalizedFrom),
      limit(1)
    );
    const recipientsSnap = await getDocs(recipientsQuery);

    if (recipientsSnap.empty) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: false, message: "Recipient not found" }),
      };
    }

    const recipientDoc = recipientsSnap.docs[0];
    const recipient = recipientDoc.data();
    const timeZone = recipient.timezone || "America/New_York";
    const dateKey = getLocalDateKey(timeZone);
    const status = parseStatusFromText(text);

    const checkinRef = doc(
      db,
      "careRecipients",
      recipientDoc.id,
      "checkins",
      dateKey
    );
    const checkinSnap = await getDoc(checkinRef);

    await setDoc(
      checkinRef,
      {
        dateKey,
        recipientId: recipientDoc.id,
        recipientName: recipient.name || "Unknown",
        monitoredPhone: normalizedFrom,
        status: status === "responded_other" ? "responded" : status,
        responseText: String(text).trim(),
        respondedAt: new Date().toISOString(),
        sentAt: checkinSnap.exists() ? checkinSnap.data().sentAt || null : null,
        timezone: timeZone,
      },
      { merge: true }
    );

    const ackText =
      status === "needs_attention"
        ? "Thanks for replying. We have shared your response with your caregiver."
        : "Thanks for checking in.";

    await sendWhatsAppMessage({ to: normalizedFrom, text: ackText });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, status }),
    };
  } catch (error) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: false,
        error: error?.message || "Failed to process response",
      }),
    };
  }
};

module.exports.handler = handler;
