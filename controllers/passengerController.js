// const { Sequelize } = require('sequelize');
// const sequelize = require('../environment/databaseConfig');
const { Passenger, Slot, Pickup, User } = require('../models');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../environment/databaseConfig');
const bcrypt = require("bcryptjs");
// Create a new passenger
// exports.createPassengers = async (req, res) => {
//   const { passengers, pickup } = req.body;

//   const refernce_id = uuidv4(); 

//   try {
//     // Array to store created passengers
//     const passengerResults = [];

//     // Iterate over each passenger in the request body
//     for (let i = 0; i < passengers.length; i++) {
//       const passengerData = passengers[i];

//       passengerData.refernce_id = refernce_id;

//       // Create the passenger
//       const passenger = await Passenger.create(passengerData);

//       // Push the created passenger to the array
//       passengerResults.push(passenger);
//     }
// // console.log("-----",passengerResults)

//     // Create the pickup for all passengers using the common pickup data (only once)
//     const newPickup = await Pickup.create({
//       house_no: pickup.house_no,
//       city: pickup.city,
//       address: pickup.address,
//       area: pickup.area,
//       landmark: pickup.landmark,
//       country: pickup.country,
//       passengerId: passengerResults[0].id,
//       reference_id:refernce_id
//     });

//     console.log(newPickup, '---newPickup')
//     // Send the response with the list of passengers and one-time pickup data
//     res.status(201).json({
//       refernceId:refernce_id,
//       passengers: passengerResults,
//       pickup: newPickup
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

exports.createPassengers = async (req, res) => {
  const { passengers, pickup } = req.body;
  const refernce_id = uuidv4(); // Unique reference ID

  const transaction = await sequelize.transaction(); // Start a transaction

  try {
    // Array to store created passengers
    const passengerResults = [];
    const userResults = [];

    // Iterate over each passenger in the request body
    for (let i = 0; i < passengers.length; i++) {
      
      const passengerData = passengers[i];
      console.log(passengerData,'passengerData')
      passengerData.refernce_id = refernce_id; // Add reference_id to passenger

      // Create the passenger
      const passenger = await Passenger.create(passengerData, { transaction });
      passengerResults.push(passenger); // Push the created passenger to the array

      const shortUuid = uuidv4().split('-')[0].substring(0, 5);
      // Create a user for the passenger (role: 'customer')
      const userPayload = {
        first_name: passengerData.name,
        last_name: passengerData.last_name || '',
        email: passengerData.email,
        phone: passengerData.phone,
        password: await bcrypt.hash(passengerData.phone, 10), // Hash phone as password (can customize)
        role: 'customer',
        uuid:shortUuid,
        passengerId: passenger.id, // Associate user with passenger
        refernce_id: refernce_id
      };
      console.log(userPayload,'user')
      const user = await User.create(userPayload, { transaction });
      userResults.push(user); // Push the created user to the array
    }

    // Create the pickup for all passengers using the common pickup data (only once)
    const newPickup = await Pickup.create({
      house_no: pickup.house_no,
      city: pickup.city,
      address: pickup.address,
      area: pickup.area,
      landmark: pickup.landmark,
      country: pickup.country,
      passengerId: passengerResults[0].id, // Associate with first passenger
      refernce_id: refernce_id
    }, { transaction });

    // Commit transaction
    await transaction.commit();

    // Send the response with the list of passengers and the pickup data
    res.status(201).json({
      refernce_id: refernce_id,
      passengers: passengerResults,
      users: userResults,
      pickup: newPickup
    });
  } catch (error) {
    // Check if the transaction is still active before rolling back
    if (transaction.finished === 'commit') {
      return res.status(400).json({ error: 'Transaction already committed.' });
    }
    if (transaction.finished === 'rollback') {
      return res.status(400).json({ error: 'Transaction already rolled back.' });
    }
    
    // Rollback transaction in case of error
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
};


exports.getAllPassengers = async (req, res) => {
    try {
      const passengers = await Passenger.findAll({
        include: {
          model: Slot,
          as: 'slot',  // Use 'slot' (lowercase) as defined in the association
        }
      });
      res.status(200).json(passengers);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

// Get all passengers by booking ID
exports.getPassengersByBooking = async (req, res) => {
  try {
    const passengers = await Passenger.findAll({ where: { bookingId: req.params.bookingId } });
    res.status(200).json(passengers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a specific passenger by ID
exports.getPassengerById = async (req, res) => {
  try {
    const passenger = await Passenger.findByPk(req.params.id);
    if (!passenger) {
      return res.status(404).json({ error: 'Passenger not found' });
    }
    res.status(200).json(passenger);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a passenger by ID
exports.updatePassenger = async (req, res) => {
  try {
    const passenger = await Passenger.findByPk(req.params.id);
    if (!passenger) {
      return res.status(404).json({ error: 'Passenger not found' });
    }
    await passenger.update(req.body);
    res.status(200).json(passenger);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a passenger by ID
exports.deletePassenger = async (req, res) => {
  try {
    const passenger = await Passenger.findByPk(req.params.id);
    if (!passenger) {
      return res.status(404).json({ error: 'Passenger not found' });
    }
    await passenger.destroy();
    res.status(204).send(); // No content to send back
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// exports.createPassenger = async (req, res) => {
//   try {
//     const { name, last_name, email, type, phone, weight, refernce_id, slotId, bookingId } = req.body;

//     // Create a new passenger
//     const newPassenger = await Passenger.create({
//       name,
//       last_name,
//       email,
//       type,
//       phone,
//       weight,
//       refernce_id,
//       slotId,
//       bookingId
//     });

//     res.status(201).json({
//       message: 'Passenger created successfully',
//       passenger: newPassenger
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating passenger', error });
//   }
// };

exports.createPassenger = async (req, res) => {
  try {
    let passengers = req.body.passengers;

    // Check if a single object is provided instead of an array
    if (!Array.isArray(passengers)) {
      passengers = [passengers]; // Convert single passenger object to an array
    }

    if (passengers.length === 0) {
      return res.status(400).json({
        message: 'Please provide valid passenger data'
      });
    }

    // Create passengers (bulkCreate supports creating one or many records)
    const newPassengers = await Passenger.bulkCreate(passengers);

    res.status(201).json({
      message: 'Passenger(s) created successfully',
      passengers: newPassengers
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating passenger(s)', error });
  }
};
