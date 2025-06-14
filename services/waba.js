const { default: axios } = require("axios");
const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid"); // Importing uuid library
const doubletick = require("@api/doubletick");

router.post("/webhook/waba", async (req, res) => {
  try {
    const event = req.body;
    // {
    //     Name: 'sagar.test',
    //     phone: '918779742206',
    //     No_passangers: '2',
    //     Date_of_flight: '10-12-24'
    //   }

    console.log("Webhook event received waba :", event);
    const { Name,LastName, No_passangers, Date_of_flight, phone ,email} = event;

    if (!Name || !No_passangers || !Date_of_flight || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 

    const bookingId = Math.random().toString(36).substring(2, 6).toUpperCase();
    console.log(`Generated booking ID: ${bookingId}`);

    const basePricePerPassenger = 599;
    const numberOfPassengers = parseInt(No_passangers, 10);

    if (isNaN(numberOfPassengers) || numberOfPassengers <= 0) {
      return res.status(400).json({ error: "Invalid number of passengers" });
    }

    // Calculate subtotal with an additional 5% fee
    // const baseTotal = basePricePerPassenger * numberOfPassengers;
    // const totalWithFee = baseTotal + baseTotal  // Adding 5% fee
    // const subTotal = totalWithFee; // Keeping it to 2 decimal places
    // // console.log(subTotal,typeof(subTotal))
    const baseTotal = basePricePerPassenger * numberOfPassengers;
    const totalWithFee = baseTotal + baseTotal * 0.05; // Adding 5% fee
    const subTotal = totalWithFee.toFixed(2);
    console.log(
      `Calculated subTotal for ${No_passangers} passengers: $${subTotal}`
    );

    const shipping = 0; // Replace this with actual shipping value
    const slotId = "Self-waba"; // Example value, replace as needed
    const tourId = "1-classic"; // Example value, replace as needed

    // Create cart payload similar to your booking setup
    const cartPayload = {
      cartObject: {
        store: {
          name: "MAHABalloons",
          url: "https://mahaballoonadventures.ae",
          logo: "https://maha-balloons.prismcloudhosting.com/assets/mahaNav-BgoqJxci.png",
          platformUuid: "bbbbeb92-5254-4b5e-abe5-68572ed17453",
        },
        cart: {
          total: subTotal + shipping,
          subTotal: subTotal,
          shipping: shipping,
          currency: "AED",
          country: "UAE",
          items: [
            {
              title: "Classic Package ",
              description: `Flight for ${No_passangers} passengers on ${Date_of_flight}`,
              price: basePricePerPassenger,
              sku: "balloon_ride",
              productId: bookingId,
              email:email,
              variantId: "variant_001",
              url: "https://mahaballoonadventures.ae",
              image: "https://maha-balloons.prismcloudhosting.com/assets/Explore%20Our%20Packages3-DlJArHS5.webp",
              quantity: numberOfPassengers,
              variantOptions: ["Flight Date: " + Date_of_flight],
              zeroPay: false,
            },
          ],
          extra: {
            bookingId: bookingId, // Using the generated booking ID
            slotId: slotId,
            tourId: tourId,
            customerName: Name,
            LastName:LastName
          },
        },
      },
    };
    console.log("Cart payload:", cartPayload);
    // Send cart payload to your backend
    const cartResponse = await axios.post(
      "https://api.strabl.com/v2/public/api/cart/",
      cartPayload
    );

    console.log("Cart response:", cartResponse.data.data.cartId);

    await doubletick
      .outgoingMessagesWhatsappTemplate({
        messages: [
          {
            from: "+971502600101",
            to: phone,
            content: {
              templateName: "wabapayment_v2", // Adjust the template name for Customer
              language: "en",
              templateData: {
                header: { type: "TEXT", placeholder: Name },
                body: {
                    placeholders: [
                      Name, // {{1}} Customer Name
                      cartResponse.data.data.cartId, // {{2}} Payment link
                      bookingId, // {{3}} Order ID
                      subTotal, // {{4}} Amount Due
                      Date_of_flight, // {{5}} Date of Flight
                    ],
                  }
              },
            },
          },
        ],
      })
      .then(({ data }) => {
        console.log("WhatsApp notification sent to customer:", data);
      })
      .catch((err) => {
        console.error("Error sending WhatsApp notification to customer:", err);
      });


      // zoho data

      const zohoPayload = {
        Name,
        LastName,
        phone,
        No_passangers,
        Date_of_flight,
        bookingId,
        subTotal,
        email,
        cartId: cartResponse.data.data.cartId,
      };

      await axios.post(
        "https://www.zohoapis.com/crm/v2/functions/waba_bookings/actions/execute?auth_type=apikey&zapikey=1003.98e95256671e37e14a695ea60fbdce04.9f0168e5de5e8c3fc475d1b92243c893", {
          zohoPayload,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((zohoResponse) => {
        console.log("Data sent to Zoho successfully:", zohoResponse.data);
      })
      .catch((err) => {
        console.error("Error sending data to Zoho:", err);
      });

    res.status(200).json({
      message: "Webhook received successfully",
      data: cartResponse.data,
    });

  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});
module.exports = router;
