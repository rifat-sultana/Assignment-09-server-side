const dotenv = require("dotenv");
const { db } = require("../config/db")

dotenv.config();

async function createAuth() {
  const { betterAuth } = await import("better-auth");
  const { mongodbAdapter } = await import("better-auth/adapters/mongodb");

  return betterAuth({
    database: mongodbAdapter(db),
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: ["http://localhost:3000", "https://assignment-09-client-side.vercel.app", "https://assignment-09-server-side.onrender.com"],
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
      },
    },
  });
}

module.exports = { createAuth };
