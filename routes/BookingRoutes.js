const express = require("express");
const bookingController = require("../controllers/BookingController");
const { isAuthenticated } = require("../middleware/auth");
const router = express.Router();

router.post("/booking", bookingController.createBooking);
router.get('/booking',isAuthenticated,bookingController.getAllBookings);
router.get('/bookings/by/:booked_by',isAuthenticated, bookingController.getBookingsByBookedBy);
router.get("/booking/user/:userId", isAuthenticated,bookingController.getBookingsByUser);
router.get("/booking/:id",isAuthenticated, bookingController.getBookingById);
router.put("/booking/:id",isAuthenticated, bookingController.updateBooking);
router.delete("/booking/:id",bookingController.deleteBooking);
router.get('/bookpassanger/:refernce_id', bookingController.bookPassengersByPhone);
module.exports = router;
