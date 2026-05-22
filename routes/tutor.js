const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");

let tutorsCollection;

// Initialize with collection
function setTutorsCollection(collection) {
  tutorsCollection = collection;
}

// Get all tutors
router.get("/", async (req, res) => {
  const result = await tutorsCollection.find({}).toArray();
  res.send(result);
});

// Get my tutors
router.get("/my-tutors", async (req, res) => {
  const email = req.query.email;
  const query = { userEmail: email };
  const result = await tutorsCollection.find(query).toArray();
  res.send(result);
});

// Add tutor
router.post("/", async (req, res) => {
  const tutorData = req.body;
  const result = await tutorsCollection.insertOne(tutorData);
  res.send(result);
});

// Delete tutor
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await tutorsCollection.deleteOne(query);
  res.send(result);
});

// Update tutor
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const updatedTutor = req.body;
  const query = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      tutorName: updatedTutor.tutorName,
      subject: updatedTutor.subject,
      hourlyFee: updatedTutor.hourlyFee,
      location: updatedTutor.location,
      experience: updatedTutor.experience,
    },
  };
  const result = await tutorsCollection.updateOne(query, updatedDoc);
  res.send(result);
});

// Get home tutors (limit 6)
router.get("/home-tutors", async (req, res) => {
  const result = await tutorsCollection.find({}).limit(6).toArray();
  res.send(result);
});

// Decrease slot
router.patch("/slot/:id", async (req, res) => {
  const id = req.params.id;
  const tutor = await tutorsCollection.findOne({ _id: new ObjectId(id) });
  const updatedDoc = { $set: { totalSlot: tutor.totalSlot - 1 } };
  const result = await tutorsCollection.updateOne(
    { _id: new ObjectId(id) },
    updatedDoc
  );
  res.send(result);
});

module.exports = { router, setTutorsCollection };