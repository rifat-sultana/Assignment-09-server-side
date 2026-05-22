// db.js
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const db = client.db("mediqueue");

let tutorsCollection;
let bookingsCollection;

async function connectDB() {
  try {
    await client.connect();

    console.log("MongoDB Connected");

    // Initialize collections
    tutorsCollection = db.collection("tutors");
    bookingsCollection = db.collection("bookings");

    return {
      tutorsCollection,
      bookingsCollection,
    };
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  connectDB,
  ObjectId,
  client,
  db,
};