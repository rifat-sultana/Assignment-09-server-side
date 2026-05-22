const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { authenticate } = require("../middleware/authenticate");

let bookingsCollection;
let tutorsCollection;

// Initialize with collections
function setCollections(bookings, tutors) {
  bookingsCollection = bookings;
  tutorsCollection = tutors;
}

// Book session
router.post("/", authenticate, async (req, res) => {
  const bookingData = { ...req.body, studentName: req.user.name, studentEmail: req.user.email };
  const result = await bookingsCollection.insertOne(bookingData);
  res.send(result);
});

// Get my bookings
router.get("/", authenticate, async (req, res) => {
  const query = { studentEmail: req.user.email };
  const result = await bookingsCollection.find(query).toArray();
  res.send(result);
});

// Cancel booking
router.patch("/:id", authenticate, async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const updatedDoc = { $set: { status: "cancelled" } };
  const result = await bookingsCollection.updateOne(query, updatedDoc);
  res.send(result);
});

module.exports = { router, setCollections };