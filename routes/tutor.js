const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { authenticate } = require("../middleware/authenticate");

let tutorsCollection;

// Initialize collection

function setTutorsCollection(collection) {
  tutorsCollection = collection;
}

// Get All Tutors

router.get("/", async (req, res) => {

  try {

    const result = await tutorsCollection.find({}).toArray();

    res.send(result);

  } catch (error) {

    res.status(500).send({
      message: "Failed to fetch tutors",
    });

  }
});

// Get Home Tutors (Limit 6)

router.get("/home-tutors", async (req, res) => {

  try {

    const result = await tutorsCollection
      .find({})
      .limit(6)
      .toArray();

    res.send(result);

  } catch (error) {

    res.status(500).send({
      message: "Failed to fetch home tutors",
    });

  }
});

// Get Single Tutor Details

router.get("/:id", async (req, res) => {

  try {

    const id = req.params.id;

    const query = { _id: new ObjectId(id) };

    const result = await tutorsCollection.findOne(query);

    res.send(result);

  } catch (error) {

    res.status(500).send({
      message: "Failed to fetch tutor details",
    });

  }
});

// Get My Tutors

router.get("/my-tutors", authenticate, async (req, res) => {

  try {

    const query = { userEmail: req.user.email };

    const result = await tutorsCollection.find(query).toArray();

    res.send(result);

  } catch (error) {

    res.status(500).send({
      message: "Failed to fetch my tutors",
    });

  }
});

// Add Tutor

router.post("/", authenticate, async (req, res) => {

  try {

    const tutorData = {
      ...req.body,
      userName: req.user.name,
      userEmail: req.user.email,
    };

    const result = await tutorsCollection.insertOne(tutorData);

    res.send(result);

  } catch (error) {

    res.status(500).send({
      message: "Failed to add tutor",
    });

  }
});

// Update Tutor

router.put("/:id", authenticate, async (req, res) => {

  try {

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

    const result = await tutorsCollection.updateOne(
      query,
      updatedDoc
    );

    res.send(result);

  } catch (error) {

    res.status(500).send({
      message: "Failed to update tutor",
    });

  }
});



// Delete Tutor

router.delete("/:id", authenticate, async (req, res) => {

  try {

    const id = req.params.id;

    const query = { _id: new ObjectId(id) };

    const result = await tutorsCollection.deleteOne(query);

    res.send(result);

  } catch (error) {

    res.status(500).send({
      message: "Failed to delete tutor",
    });

  }
});




// Decrease Slot

router.patch("/slot/:id", authenticate, async (req, res) => {

  try {

    const id = req.params.id;

    const tutor = await tutorsCollection.findOne({
      _id: new ObjectId(id),
    });

    const updatedDoc = {
      $set: {
        totalSlot: tutor.totalSlot - 1,
      },
    };

    const result = await tutorsCollection.updateOne(
      { _id: new ObjectId(id) },
      updatedDoc
    );

    res.send(result);

  } catch (error) {

    res.status(500).send({
      message: "Failed to decrease slot",
    });

  }
});


module.exports = {
  router,
  setTutorsCollection,
};