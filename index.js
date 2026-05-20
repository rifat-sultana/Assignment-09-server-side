const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion } = require("mongodb");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {

    await client.connect();

    console.log("MongoDB Connected");

    const tutorsCollection = client
      .db("mediqueue")
      .collection("tutors");

    // ROOT
    app.get("/", (req, res) => {
      res.send("Server running successfully");
    });

    // ALL TUTORS
    app.get("/tutors", async (req, res) => {

      const result = await tutorsCollection
        .find({})
        .toArray();

      res.send(result);
    });

    // HOME TUTORS (LIMIT 6)
    app.get("/home-tutors", async (req, res) => {

      const result = await tutorsCollection
        .find({})
        .limit(6)
        .toArray();

      res.send(result);
    });

  } catch (error) {

    console.log(error);

  }
}


// add tutor api

app.post("/tutors", async (req, res) => {

  const tutorData = req.body;

  const result = await tutorsCollection.insertOne(
    tutorData
  );

  res.send(result);
});

run();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});