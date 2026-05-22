const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");

let bookingsCollection;
let tutorsCollection;

// Initialize with collections
function setCollections(bookings, tutors) {
  bookingsCollection = bookings;
  tutorsCollection = tutors;
}

// Book session
router.post("/", async (req, res) => {
  const bookingData = req.body;
  const result = await bookingsCollection.insertOne(bookingData);
  res.send(result);
});

// Get my bookings
router.get("/", async (req, res) => {
  const email = req.query.email;
  const query = { studentEmail: email };
  const result = await bookingsCollection.find(query).toArray();
  res.send(result);
});

// Cancel booking
router.patch("/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const updatedDoc = { $set: { status: "cancelled" } };
  const result = await bookingsCollection.updateOne(query, updatedDoc);
  res.send(result);
});

module.exports = { router, setCollections };