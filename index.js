const dns = require("node:dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");

const cors = require("cors");

const dotenv = require("dotenv");

const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
} = require("mongodb");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// MIDDLEWARE

app.use(cors());

app.use(express.json());

// Mongodb uri

const uri = process.env.MONGODB_URI;

// Client

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

    // Collections

    const tutorsCollection = client
      .db("mediqueue")
      .collection("tutors");

    const bookingsCollection = client
      .db("mediqueue")
      .collection("bookings");

    // Root api

    app.get("/", (req, res) => {

      res.send(
        "Server running successfully"
      );
    });

    // All tutor api
   

    app.get("/tutors", async (req, res) => {

      const result =
        await tutorsCollection
          .find({})
          .toArray();

      res.send(result);
    });

    
    // MY TUTORS API
    

    app.get("/my-tutors", async (req, res) => {

      const email = req.query.email;

      const query = {

        userEmail: email,
      };

      const result =
        await tutorsCollection
          .find(query)
          .toArray();

      res.send(result);
    });

   
    // Add tutor api
    

    app.post("/tutors", async (req, res) => {

      const tutorData = req.body;

      const result =
        await tutorsCollection.insertOne(
          tutorData
        );

      res.send(result);
    });

   
    // Delete tutor api


    app.delete("/tutors/:id", async (req, res) => {

      const id = req.params.id;

      const query = {

        _id: new ObjectId(id),
      };

      const result =
        await tutorsCollection.deleteOne(
          query
        );

      res.send(result);
    });

 
    // Update tutor api
   

    app.put("/tutors/:id", async (req, res) => {

      const id = req.params.id;

      const updatedTutor =
        req.body;

      const query = {

        _id: new ObjectId(id),
      };

      const updatedDoc = {

        $set: {

          tutorName:
            updatedTutor.tutorName,

          subject:
            updatedTutor.subject,

          hourlyFee:
            updatedTutor.hourlyFee,

          location:
            updatedTutor.location,

          experience:
            updatedTutor.experience,
        },
      };

      const result =
        await tutorsCollection.updateOne(
          query,
          updatedDoc
        );

      res.send(result);
    });

    // Home tutor api


    app.get("/home-tutors", async (req, res) => {

      const result =
        await tutorsCollection
          .find({})
          .limit(6)
          .toArray();

      res.send(result);
    });

    
    // Book session api
  
    app.post("/bookings", async (req, res) => {

      const bookingData =
        req.body;

      const result = await bookingsCollection.insertOne(
          bookingData
        );
      res.send(result);
    });

    // My booking api
   

    app.get("/bookings", async (req, res) => {

      const email =
        req.query.email;

      const query = {

        studentEmail: email,
      };

      const result =
        await bookingsCollection
          .find(query)
          .toArray();

      res.send(result);
    });

   
    // Cancel booking api
   

    app.patch("/bookings/:id", async (req, res) => {

      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };

      const updatedDoc = {

        $set: {

          status: "cancelled",
        },
      };

      const result = await bookingsCollection.updateOne(
          query,
          updatedDoc
        );

      res.send(result);
    });

  } catch (error) {

    console.log(error);
  }
}

run();

// SERVER

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );
});