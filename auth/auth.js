const dotenv = require("dotenv");
const { db } = require("../config/db")

dotenv.config();

const serverURL = process.env.BETTER_AUTH_URL || "http://localhost:5000";
const isHttpsServer = serverURL.startsWith("https://");
const trustedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://assignment-09-client-side.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

async function createAuth() {
  const { betterAuth } = await import("better-auth");
  const { mongodbAdapter } = await import("better-auth/adapters/mongodb");

  return betterAuth({
    database: mongodbAdapter(db),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: serverURL,
    trustedOrigins,
    advanced: {
      useSecureCookies: isHttpsServer,
      defaultCookieAttributes: {
        httpOnly: true,
        secure: isHttpsServer,
        sameSite: isHttpsServer ? "none" : "lax",
        path: "/",
      },
    },
    emailAndPassword: {
      enabled: true,
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },

    socialProviders: {
      google: {
        prompt: "select_account",
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // redirectURI: "http://localhost:5000/api/auth/callback/google",
      },
    },
  });
}

module.exports = { createAuth };
