const express = require("express");
const router = express.Router();
const { Booking, Slot, User, Passenger } = require("../models"); // Adjust the path to your Booking model
const { default: axios } = require("axios");
const doubletick = require("@api/doubletick");
const { calculateCommission } = require('./calculateCommission'); // Adjust the path to your file


router.post("/webhook", async (req, res) => {
  const event = req.body;

  console.log("Webhoo sagar event received:", event);

  switch (event.type) {
    case "order_created":
      console.log("12 order_created", event);
      // console.log("---products", event.orderUpdate.products, "---products");
      try {
        // console.log
        const products = event.orderUpdate.products;

        console.log("--maped product data", products[0]?.externalProductId);
        // Assuming that products have a 'productId' field
        const productId = products[0]?.externalProductId;

        if (!productId) {
          return res.status(400).json({ error: "Product ID not found" });
        }
        // Find the booking with the corresponding order_id
        const booking = await Booking.findOne({
          where: {
            id: productId,
          },
        });

        console.log(
          "booking data",
          // booking,
          // booking.payment_status,
          // booking.status,
          // booking.order_id,
          // booking.id,
          booking.slotId,
          booking.dataValues.slotId
        );

        // console.log("orderUpdate", event.orderUpdate);
        // console.log("orderUpdate --2", event.orderUpdate.orderUuid);

        if (!booking) {
          return res.status(404).json({ error: "Booking not found" });
        }
        //
        if (!booking.booked_by_waba || booking.booked_by_waba === 0) {
          console.log("Booking is not created via WABA. No updates required.");
          booking.booked_by_waba = 1;
          // return res.status(200).json({ message: 'No updates needed for this booking.' });
        }

        // Update the payment status to 'paid'
        booking.order_id = event.orderUpdate.orderUuid;
        booking.booking_id = booking.id; // Assigning the booking's own ID
        booking.status = "completed";
        (booking.order_short_code = event.orderUpdate.orderShortCode),
          (booking.payment_status = "paid");
        booking.slot_conformation = "confirmed";
        //
        const id = booking.slotId;
        console.log("datavalue", booking.dataValues.slotId);
        console.log("slot id --------id", id, booking.slotId);
        await booking.save();
        console.log(
          `Payment status updated for booking: ${booking.id}`,
          booking
        );

        const slot = await Slot.findByPk(booking.slotId);
        if (!slot) {
          return res.status(404).json({ error: "Slot not found" });
        }
        console.log("----slot", slot);
        if (slot) {
          slot.bookedSlots += booking.slot_count;
          slot.totalSlots -= booking.slot_count;
          await slot.save();
        }
        // logic for paymnet message

        // Find the passenger associated with the booking's reference_id
        const passenger = await Passenger.findOne({
          where: { refernce_id: booking.refernce_id },
        });
        console.log("passanger", passenger);
        if (!passenger) {
          return res.status(404).json({ error: "Passenger not found" });
        }

        const Passenger_Id = passenger.id
        console.log('----passanger data',Passenger_Id)
        // Find the user associated with the passenger
        const user = await User.findOne({
          where: { passengerId: Passenger_Id },
        });
        console.log("user", user);
        
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        const phoneNumber = user.phone;
        const userName = user.first_name;
        const orderId = booking.order_id;
        const refernce_id = booking.refernce_id
        const bookingDate = new Date(booking.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        const registrationLink = `https://www.mahaballoonadventures.ae/passengers-details/${refernce_id}`; // Adjust the URL
        console.log("Sending message to user:", booking.createdAt,refernce_id,orderId,userName,phoneNumber);

        // Sending the WABA message
        await doubletick.outgoingMessagesWhatsappTemplate({
          messages: [
            {
              from: "+971502600101", // Your business number
              to: phoneNumber,
              content: {
                templateName: "payment_success_registration", // Your template name
                language: "en",
                templateData: {
                  header: { type: "TEXT", placeholder: userName },
                  body: {
                    placeholders: [userName,bookingDate,orderId,registrationLink],
                  },
                },
              },
            },
          ],
        });
        console.log(`WABA message sent successfully to ${phoneNumber}`);

        // Send a message to the user (via your preferred messaging service)
        // await sendMessage(
        //   phoneNumber,
        //   `Your payment for booking ${booking.id} has been successful. Your slot is confirmed.`
        // );

        // zoho data for update paymnet status
        const zohoPayload = {
          booking_id: booking.id,
          order_id: booking.order_id,
          status: booking.status,
          payment_status: booking.payment_status,
          order_short_code: booking.order_short_code,
          booked_by_waba: booking.booked_by_waba,
          slot_conformationL: booking.slot_conformation,
          // booking.slot_conformation = 1
          // Add any other relevant fields here
        };

        const zohoResponse = await axios.post(
          `https://www.zohoapis.com/crm/v2/functions/update_bookings/actions/execute?auth_type=apikey&zapikey=1003.98e95256671e37e14a695ea60fbdce04.9f0168e5de5e8c3fc475d1b92243c893`,
          zohoPayload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Data successfully sent to Zoho API:", zohoResponse.data);


        // Calculate and update commission
        const commissionSummary = await calculateCommission(booking.booked_by);
        console.log("Commission calculated:", commissionSummary);


        res.status(200).json(booking);


      } catch (error) {
        console.error("Error updating payment status:", error);
        res.sendStatus(500);
      }
      break;

    case "order_updated":
      console.log(" 53 Order updated:", event.data);
      break;

    case "order_refunded":
      console.log("Order refunded:", event.data);
      break;

    case "order_canceled":
      console.log("Order canceled:", event.data);
      break;

    default:
      console.log("Unknown event type:", event.type);
  }
});

router.get("/status/booking/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find booking by order_id
    const booking = await Booking.findOne({
      where: { id: id },
    });
    console.log(
      "booking data",
      booking,
      payment_status,
      status,
      order_id,
      booking_id
    );

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Return payment status
    res.json({
      booking: booking,
      bookingId: booking.id,
      payment_status: booking.payment_status,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.sendStatus(500);
  }
});

module.exports = router;
