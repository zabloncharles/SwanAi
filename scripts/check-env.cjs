const fs = require("node:fs");
const path = require("node:path");

const REQUIRED_VARS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_ID",
  "VITE_FIREBASE_APP_ID",
];

function readDotEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const parsed = {};
  const fileContent = fs.readFileSync(envPath, "utf8");
  const lines = fileContent.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key && !(key in parsed)) {
      parsed[key] = value;
    }
  }
  return parsed;
}

const dotEnvVars = readDotEnvFile();

const missing = REQUIRED_VARS.filter((name) => {
  const value = process.env[name] || dotEnvVars[name];
  return !value || value.trim().length === 0;
});

if (missing.length > 0) {
  console.error("Missing required environment variables:");
  for (const name of missing) {
    console.error(`- ${name}`);
  }
  console.error("Create/update .env using .env.example and retry.");
  process.exit(1);
}

console.log("Environment validation passed.");
