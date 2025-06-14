const { default: axios } = require("axios");
const { Booking, User, Slot, Passenger, Tour, Pickup } = require("../models");
const { where } = require("sequelize");

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      userId,
      slotId,
      shipping,
      booked_by: initialBookedBy,
      refernce_id,
      slot_count,
      slot_child,
      slot_adult,
      referral_code,
      bookingfrom: initialBookingFrom,
      ...bookingDetails
    } = req.body;

    // Retrieve the tour details
    const tour = await Tour.findOne({
      where: { id: req.body.tourId },
    });

    if (!tour) {
      return res.status(404).json({ error: "Tour not found for this slot" });
    }

    const adultPrice = parseFloat(tour.price_adult || 0); // Ensure it is a number
    const childPrice = parseFloat(tour.price_child || 0); // Ensure it is a number

    // Initialize the base subtotal
    let finalSubTotal = slot_adult * adultPrice + slot_child * childPrice;

    // Additional logic for referral code and discounts
    let booked_by = initialBookedBy || null;
    let bookingfrom = initialBookingFrom || null;

    if (referral_code) {
      const referredUser = await User.findOne({ where: { referral_code } });
      if (referredUser) {
        booked_by = referredUser.id;
        bookingfrom = referredUser.role;
        if (
          referredUser.role === "B2B-Influencer" ||
          referredUser.role === "B2B-Individual"
        ) {
          finalSubTotal *= 0.9; // Apply a 10% discount for referrals
        }
      }
    }

    // Check for the `booked_by` and apply discounts accordingly
    if (booked_by) {
      const getbookeyData = await User.findByPk(booked_by);
      bookingfrom = getbookeyData.role;
      if (
        getbookeyData &&
        (getbookeyData.role === "B2B-Influencer" ||
          getbookeyData.role === "B2B-Individual")
      ) {
        finalSubTotal *= 0.9; // Apply a 10% discount for referrals
      }
    }
    // 
    

    // Retrieve passengers and calculate their price adjustments
    const passengers = await Passenger.findAll({
      where: { refernce_id },
    });

    if (!passengers || passengers.length === 0) {
      return res
        .status(404)
        .json({ error: "No passengers found for the given reference ID" });
    }

    let modifiedSubTotal = 0; // Initialize modified subtotal

    // Loop through passengers and adjust pricing for adults with weight > 120kg
    const items = []; // To store cart items
    for (const passenger of passengers) {
      let passengerPrice = passenger.type === "adult" ? adultPrice : childPrice;

      // Check if the passenger's weight exceeds 120 kg
      if (passenger.type === "adult" && passenger.weight >= 120) {
        // Double the price for this passenger
        passengerPrice *= 2;
      }

      // Add the passenger as an item to the items array
      items.push({
        title: `${tour.title} - ${
          passenger.type.charAt(0).toUpperCase() + passenger.type.slice(1)
        }`, // Title based on passenger type (Adult or Child)
        description: `${tour.short_detail}`, // Description without weight-based note
        price: passengerPrice,
        sku:
          passenger.type === "adult"
            ? "balloon_ride_adult"
            : "balloon_ride_child", // SKU based on passenger type
        productId: tour.id,
        quantity: 1, // One item per passenger
        image: tour.package_image,
        variantOptions: [
          `${passenger.type.charAt(0).toUpperCase() + passenger.type.slice(1)}`,
          `Duration: ${tour.duration}`,
          `Weight: ${passenger.weight}kg`, // Include weight in the variant options
        ],
      });

      // Add this adjusted price to the modified subtotal
      modifiedSubTotal += passengerPrice;
    }

    // Ensure the final subtotal is a valid number
    modifiedSubTotal = parseFloat(modifiedSubTotal.toFixed(2));

    const pickupDetails = await Pickup.findAll({
      where: {
        refernce_id: refernce_id, // Use the correct reference_id
      },
    });
    // If pickup details are not found, handle accordingly
    if (!pickupDetails || pickupDetails.length === 0) {
      return res
        .status(404)
        .json({ error: "No pickup details found for the given reference ID" });
    }

    // Get the first pickup entry, assuming you only need one
    const pickup = pickupDetails;
    console.log(pickup[0], "--pickup");
    
    const slot = await Slot.findByPk(slotId);
    // console.log("------",slot,'--slot')
    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }
    
    // Create booking record


    const booking = await Booking.create({
      slotId,
      userId,
      subTotal: modifiedSubTotal,
      refernce_id,
      tourId: req.body.tourId,
      booked_by,
      status: "pending",
      slot_conformation: "pending",
      booking_date: new Date(),
      ...bookingDetails,
      slot_count,
      referral_code,
      slot_child,
      slot_adult,
      bookingfrom,
    });

    // Assign passengers to booking
    for (const passenger of passengers) {
      passenger.bookingId = booking.id;
      await passenger.save();
    }

    // Create cart payload and call the API
    const cartPayload = {
      cartObject: {
        store: {
          name: "MAHABalloons",
          url: "https://mahaballoonadventures.ae",
          logo: "https://d3gelo9cifr8ed.cloudfront.net/assets/mahaNav.png",
       platformUuid: "bbbbeb92-5254-4b5e-abe5-68572ed17453",
      //  platformUuid: "713fcbdd-a27d-44c2-9916-68e1be7956ed",
        },
        cart: {
          subTotal: modifiedSubTotal,
          shipping: shipping,
          currency: "AED",
          country: "UAE",
          items,
          extra: {
            bookingId: booking.id,
            slotId,
            tourId: req.body.tourId,
            ...bookingDetails,
            slot_count,
            referral_code,
            slot_child,
            slot_adult,
          },
        },
      },
    };

    const cartResponse = await axios.post(
      "https://api.strabl.com/v2/public/api/cart/",
      // "https://dev-api.strabl.com/v2/public/api/cart/",
      cartPayload
    );
    console.log("Cart response:", cartResponse.data.data.cartId);

    if (cartResponse.status === 200 || cartResponse.status === 201) {
      // Cart created successfully, decrement slots
      // slot.bookedSlots += passengers.length;
      // slot.totalSlots -= passengers.length;
      // await slot.save();

      const zohoData = {
        // Include Zoho response details
        data: passengers,
        number: passengers.length, // Include passengers details
        shippingAddress: pickup[0], // Include pickup details
        slotId: slot.dataValues, // Include slot data values
        cartDetails: cartResponse.data.data.cartId, // Include cart details
        bookingDetails: booking, // Include booking details
      };
      // zoho
      const zohoResponse = await axios.post(
        `https://www.zohoapis.com/crm/v2/functions/bookings/actions/execute?auth_type=apikey&zapikey=1003.98e95256671e37e14a695ea60fbdce04.9f0168e5de5e8c3fc475d1b92243c893`,
        zohoData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(passengers, "passengers");
      // passengers.bookingId = booking.id;
      // await passengers.save();
      
      return res.status(201).json({
        booking,
        cart: cartResponse.data, // Return cart details along with booking
        zohoResponse: {
          ...zohoResponse.data,
          total_number: passengers.length, // Include zohoResponse details
          data: passengers,
          shippingadress: pickupDetails,
          subTotal: finalSubTotal,
          referral_code,
          // Send entire user data in the response
          slotId: slot.dataValues, // Send slotId in the response
        },
      });
    } else {
      // If cart creation fails, send an error response
      return res.status(500).json({ error: "Failed to create cart" });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

//

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        {
          model: Passenger,
          as: "passengers", // Ensure this matches the alias in the association
          // attributes: ["name", "email", "phone", "weight"], // Include Passenger fields you want to show
        },
        {
          model: Slot,
          as: "slot", // Ensure this matches the alias in the association
        },
        {
          model: Tour,
          as: "tour",
        },
      ],
    });
    res.status(200).json({
      bookings: bookings,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all bookings by user ID
exports.getBookingsByUser = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.params.userId },
      include: [
        {
          model: Passenger,
          as: "passengers", // Ensure this matches the alias in the association
        },
        {
          model: Slot,
          as: "slot", // Ensure this matches the alias in the association
          include: [
            {
              model: Tour, // Include the Tour model
              as: "tour", // Ensure this matches the alias in the association
              attributes: ["id", "name", "description", "packageId"], // Include the attributes you need
            },
          ],
        },
      ],
    });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a specific booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a booking by ID
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    await booking.update(req.body);

    const zohoData = booking.dataValues;

    // Send data to Zoho CRM
    const zohoResponse = await axios.post(
      "https://www.zohoapis.com/crm/v2/functions/refund_bookings/actions/execute?auth_type=apikey&zapikey=1003.98e95256671e37e14a695ea60fbdce04.9f0168e5de5e8c3fc475d1b92243c893",
      zohoData,
      {
        headers: {
          "Content-Type": "application/json",
          // 'Authorization': 'Zoho-oauthtoken 1003.98e95256671e37e14a695ea60fbdce04.9f0168e5de5e8c3fc475d1b92243c893'
        },
      }
    );

    // Log Zoho response (optional)
    console.log("Zoho Response:", zohoResponse.data);

    res.status(200).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a booking by ID
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    await booking.destroy();
    res.status(201).json({ message: "Booking delete SucessFully" }); // No content to send back
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// booked by

exports.getBookingsByBookedBy = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { booked_by: req.params.booked_by },
    });
    console.log(bookings, "----bookings");
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        // Fetch slot details
        const slotDetails = await Slot.findOne({
          where: { id: booking.slotId },
          // attributes: ['id', 'date', 'time', 'totalSlots', 'bookedSlots', 'packageId'], // Include packageId
        });

        let packageDetails = null;
        if (slotDetails?.packageId) {
          // Fetch package details
          packageDetails = await Tour.findOne({
            where: { id: slotDetails.packageId },
            // attributes: ['id', 'title', 'price', 'location'], // Adjust attributes as needed
          });
        }

        // Fetch passenger details
        const passengerDetails = await Passenger.findAll({
          where: { refernce_id: booking.refernce_id },
          // attributes: ['id', 'name', 'age', 'gender'], // Adjust attributes as needed
        });

        // Return enriched booking
        return {
          ...booking.toJSON(),
          slotDetails: {
            ...slotDetails?.toJSON(),
            packageDetails,
          },
          passengers: passengerDetails,
        };
      })
    );
    res.status(200).json({ data: enrichedBookings });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.bookPassengersByPhone = async (req, res) => {
  try {
    const { refernce_id } = req.params; // Assuming reference_id is passed as a URL parameter

    // Step 1: Find booking by phone number
    const booking = await Booking.findOne({
      where: { refernce_id: refernce_id },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const referenceId = booking.refernce_id;

    // Step 2: Check if the reference exists in Passenger table
    const existingPassenger = await Passenger.findOne({
      where: { refernce_id: referenceId },
    });

    if (!existingPassenger) {
      return res
        .status(404)
        .json({ message: "Reference ID not found in passengers" });
    }
    console.log(existingPassenger, "exsting");
    // Step 3: Iterate through passengers and create new entries
    const userData = await User.findOne({
      where: { passengerId: existingPassenger.id },
    });
    res.status(201).json({
      message: "Data fetch sucessfully",
      UserData: userData,
      booking: booking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
