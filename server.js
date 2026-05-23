const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { connectDB } = require("./config/db");
const { createAuth } = require('./auth/auth')
const { signToken } = require('./auth/jwt')
const { authenticate } = require('./middleware/authenticate')

const { 
  router: tutorsRouter, 
  setTutorsCollection 
} = require("./routes/tutor");

const { 
  router: bookingsRouter, 
  setCollections 
} = require("./routes/booking");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// multiple origins with credentials support
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://assignment-09-client-side.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }))


// Root API
app.get("/", (req, res) => {
  res.send("Server running successfully");
});


// Connect to Database and Start Server
async function startServer() {
  try {
    const auth = await createAuth();

    const { toNodeHandler } = await import("better-auth/node");
    app.all('/api/auth/{*any}', toNodeHandler(auth))

    app.post("/api/jwt", async (req, res) => {
      try {
        // First try to get session from cookies
        const cookieHeader = req.headers.cookie;
        console.log("Cookie header:", cookieHeader);
        
        const cookies = {};
        if (cookieHeader) {
          cookieHeader.split(';').forEach(cookie => {
            const [name, value] = cookie.split('=');
            if (name && value) {
              cookies[name.trim()] = value.trim();
            }
          });
        }
        console.log("Parsed cookies:", Object.keys(cookies));
        
        let session = await auth.api.getSession({
          headers: req.headers,
          cookies: cookies
        });
        
        console.log("Session from cookies:", session ? "Found" : "Not found");
        
        // If no session from cookies, try getting session using the auth API directly
        if (!session && req.body && req.body.token) {
          console.log("Attempting to validate session token from body...");
          // For better-auth, session tokens can be validated
          try {
            const sessionData = await auth.api.getSession({ 
              headers: {
                'authorization': `Bearer ${req.body.token}`
              }
            });
            session = sessionData;
            console.log("Session from token:", session ? "Found" : "Not found");
          } catch(e) {
            console.log("Token validation failed:", e.message);
          }
        }
        
        if (!session) {
          return res.status(401).json({ 
            message: "Not authenticated",
            debug: { cookiesReceived: Object.keys(cookies) }
          });
        }
        
        const token = signToken(session.user);
        res.json({ token, user: session.user });
      } catch (error) {
        console.error("JWT endpoint error:", error);
        res.status(500).json({ 
          message: "Failed to generate token",
          error: error.message 
        });
      }
    });

    const { tutorsCollection, bookingsCollection } = await connectDB();
    
    // Set collections in route files
    setTutorsCollection(tutorsCollection);
    setCollections(bookingsCollection, tutorsCollection);
    
    // Use routes
    app.use("/tutors", tutorsRouter);
    app.use("/bookings", bookingsRouter);
    app.use("/api/protected", authenticate, (req, res) => {
      res.json({ user: req.user });
    });
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Failed to start server:", error);
  }
}

startServer();
