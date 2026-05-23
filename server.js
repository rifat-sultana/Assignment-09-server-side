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
      "https://assignment-09-server-side.onrender.com"
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
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session) {
          return res.status(401).json({ message: "Not authenticated" });
        }
        const token = signToken(session.user);
        res.json({ token, user: session.user });
      } catch (error) {
        res.status(500).json({ message: "Failed to generate token" });
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
