const axios = require("axios");
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  limit,
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

function getLocalNowParts(timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const map = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }

  return {
    dateKey: `${map.year}-${map.month}-${map.day}`,
    hour: Number(map.hour),
    minute: Number(map.minute),
  };
}

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

async function processRecipient(recipientDoc) {
  const recipient = recipientDoc.data();
  const timeZone = recipient.timezone || "America/New_York";
  const checkinHour = Number.isInteger(recipient.checkinHour)
    ? recipient.checkinHour
    : 9;
  const checkinMinute = Number.isInteger(recipient.checkinMinute)
    ? recipient.checkinMinute
    : 0;

  const now = getLocalNowParts(timeZone);
  const minuteDelta = Math.abs(now.minute - checkinMinute);
  const withinWindow = now.hour === checkinHour && minuteDelta <= 2;
  if (!withinWindow) {
    return { skipped: true, reason: "outside_schedule" };
  }

  const checkinRef = doc(
    db,
    "careRecipients",
    recipientDoc.id,
    "checkins",
    now.dateKey
  );
  const checkinSnap = await getDoc(checkinRef);
  if (checkinSnap.exists() && checkinSnap.data().sentAt) {
    return { skipped: true, reason: "already_sent" };
  }

  const monitoredPhone = normalizePhoneNumber(
    recipient.normalizedMonitoredPhone || recipient.monitoredPhone
  );
  if (!monitoredPhone) {
    return { skipped: true, reason: "missing_phone" };
  }

  await sendWhatsAppMessage({
    to: monitoredPhone,
    text: recipient.checkinMessage || "Are you okay?",
  });

  await setDoc(
    checkinRef,
    {
      dateKey: now.dateKey,
      status: "pending",
      sentAt: new Date().toISOString(),
      responseText: "",
      respondedAt: null,
      recipientId: recipientDoc.id,
      recipientName: recipient.name || "Unknown",
      monitoredPhone,
      timezone: timeZone,
    },
    { merge: true }
  );

  return { sent: true, recipientId: recipientDoc.id, dateKey: now.dateKey };
}

const handler = async () => {
  try {
    const recipientsRef = collection(db, "careRecipients");
    const recipientsQuery = query(
      recipientsRef,
      where("active", "==", true),
      limit(500)
    );
    const recipientsSnap = await getDocs(recipientsQuery);

    const results = [];
    for (const recipientDoc of recipientsSnap.docs) {
      try {
        const result = await processRecipient(recipientDoc);
        results.push(result);
      } catch (error) {
        results.push({
          sent: false,
          recipientId: recipientDoc.id,
          error: error?.message || "unknown_error",
        });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        processed: recipientsSnap.size,
        results,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error?.message || "Failed to send daily check-ins",
      }),
    };
  }
};

module.exports.handler = handler;
