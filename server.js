const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { connectDB } = require("./config/db");
const { auth } = require('./auth/auth')

const { toNodeHandler } = require("better-auth/node");

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

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// Root API
app.get("/", (req, res) => {
  res.send("Server running successfully");
});

// Auth Routes
app.all("/api/auth/*", toNodeHandler(auth));

// Connect to Database and Start Server
async function startServer() {
  try {
    const { tutorsCollection, bookingsCollection } = await connectDB();
    
    // Set collections in route files
    setTutorsCollection(tutorsCollection);
    setCollections(bookingsCollection, tutorsCollection);
    
    // Use routes
    app.use("/tutors", tutorsRouter);
    app.use("/bookings", bookingsRouter);
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Failed to start server:", error);
  }
}

startServer();