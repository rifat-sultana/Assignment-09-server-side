const express = require("express");

const router = express.Router();

const { ObjectId } = require("mongodb");

const { authenticate } = require("../middleware/authenticate");

let bookingsCollection;

let tutorsCollection;



// Initialize collections
function setCollections(bookings, tutors) {

  bookingsCollection = bookings;

  tutorsCollection = tutors;
}


// Book Session


router.post("/", authenticate, async (req, res) => {

  try {

    // Duplicate booking check
    const existingBooking =
      await bookingsCollection.findOne({

        tutorId: req.body.tutorId,

        studentEmail: req.user.email,
      });

    if (existingBooking) {

      return res.status(400).send({
        message: "You already booked this tutor",
      });
    }



    // Find tutor
    const tutor =
      await tutorsCollection.findOne({
        _id: new ObjectId(req.body.tutorId),
      });

    // Tutor not found
    if (!tutor) {

      return res.status(404).send({
        message: "Tutor not found",
      });
    }



    // Slot check
    if (tutor.totalSlot <= 0) {

      return res.status(400).send({
        message: "This session is fully booked",
      });
    }



    // Session date restriction
    const today = new Date();

    const sessionDate =
      new Date(tutor.sessionDate);

    if (today < sessionDate) {

      return res.status(400).send({
        message:
          "Booking is not available yet for this tutor",
      });
    }



    // Booking Data
    const bookingData = {

      ...req.body,

      studentName: req.user.name,

      studentEmail: req.user.email,

      status: "booked",
    };



    // Save booking
    const result =
      await bookingsCollection.insertOne(
        bookingData
      );



    // Decrease Slot
    await tutorsCollection.updateOne(
      {
        _id: new ObjectId(req.body.tutorId),
      },
      {
        $inc: {
          totalSlot: -1,
        },
      }
    );



    res.send(result);

  } catch (error) {

    console.log(error);

    res.status(500).send({
      message: "Failed to book session",
    });
  }
});

// Get My Bookings


router.get("/", authenticate, async (req, res) => {

  try {

    const query = {
      studentEmail: req.user.email,
    };

    const result =
      await bookingsCollection.find(query).toArray();

    res.send(result);

  } catch (error) {

    res.status(500).send({
      message: "Failed to fetch bookings",
    });
  }
});


// Cancel Booking

router.patch("/:id", authenticate, async (req, res) => {

  try {

    const id = req.params.id;

    const booking =
      await bookingsCollection.findOne({
        _id: new ObjectId(id),
      });

    if (!booking) {

      return res.status(404).send({
        message: "Booking not found",
      });
    }



    // Update booking status
    await bookingsCollection.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          status: "cancelled",
        },
      }
    );



    // Increase slot again
    await tutorsCollection.updateOne(
      {
        _id: new ObjectId(booking.tutorId),
      },
      {
        $inc: {
          totalSlot: 1,
        },
      }
    );



    res.send({
      message: "Booking cancelled successfully",
    });

  } catch (error) {

    res.status(500).send({
      message: "Failed to cancel booking",
    });
  }
});



module.exports = {
  router,
  setCollections,
};