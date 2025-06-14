const express = require("express");
const router = express.Router();
const { Booking } = require("../models"); // Import your Booking model

router.post("/webhook/zoho/cancel/booking", async (req, res) => {
  const event = req.body;

console.log('event',event.custom_field_hash.cf_accounts_id)
  try {
    
    // Extract `cf_order_short_code` from the webhook event
    const cf_order_short_code = event.cf_order_short_code;
    console.log("cf_order_short_code", cf_order_short_code);
    if (!cf_order_short_code) {
      console.log("cf_order_short_code not found in the webhook payload.");
      return res.status(400).json({ error: "cf_order_short_code is missing" });
    }

    console.log("cf_order_short_code received:", cf_order_short_code);

    // Search for the booking in your database
    const booking = await Booking.findOne({
      where: { order_short_code: cf_order_short_code },
    });

    console.log('booking',booking)

    if (!booking) {
      console.log(
        `No booking found for cf_order_short_code: ${cf_order_short_code}`
      );
      return res.status(404).json({ error: "Booking not found" });
    }

    // Cancel the booking
    booking.status = "canceled"; // Assuming your Booking model has a `status` field
    booking.subTotal = 0;
    await booking.save();

    console.log(
      `Booking with cf_order_short_code ${cf_order_short_code} canceled successfully`
    );
    return res.status(200).json({ message: "Booking canceled successfully" });
  } catch (error) {
    console.error("Error processing webhook event:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;
