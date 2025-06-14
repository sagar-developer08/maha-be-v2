const { Flight } = require('../models');

// Create a new flight
const axios = require('axios');

exports.createFlight = async (req, res) => {
  try {
    const flight = await Flight.create(req.body);

    // Prepare data for Zoho API
    const zohoData = {
      flight_id: flight.id, // Assuming 'id' is the flight's unique identifier
      flight_name: flight.name, // Adjust based on the actual flight fields
      departure_time: flight.departureTime,
      arrival_time: flight.arrivalTime,
      date:flight.date
      // Add any other relevant flight fields here
    };

    // Send flight data to Zoho CRM API
    const zohoResponse = await axios.post(
     'https://www.zohoapis.com/crm/v2/functions/flights/actions/execute?auth_type=apikey&zapikey=1003.98e95256671e37e14a695ea60fbdce04.9f0168e5de5e8c3fc475d1b92243c893',
      zohoData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Return flight data and Zoho response to the client
    res.status(201).json({
      flight,
      zohoResponse: zohoResponse.data,
    });
  } catch (error) {
    console.log(error,'error')
    res.status(400).json({ error: error.message });
  }
};


// Get all flights
exports.getAllFlights = async (req, res) => {
  try {
    const flights = await Flight.findAll();
    res.status(200).json(flights);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a specific flight by ID
exports.getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findByPk(req.params.id);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    res.status(200).json(flight);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a flight by ID
exports.updateFlight = async (req, res) => {
  try {
    const flight = await Flight.findByPk(req.params.id);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    await flight.update(req.body);
    res.status(200).json(flight);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a flight by ID
exports.deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findByPk(req.params.id);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    await flight.destroy();
    res.status(204).send(); // No content to send back
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
