const express = require("express");
const router = express.Router();
const FlightController = require("../controllers/FlightController");

// Create a new flight
router.post("/flight", FlightController.createFlight);

// Get all flights
router.get("/flights", FlightController.getAllFlights);

// Get a specific flight by ID
router.get("/flight/:id", FlightController.getFlightById);

// Update a flight by ID
router.put("/flight/:id", FlightController.updateFlight);

// Delete a flight by ID
router.delete("/flight/:id", FlightController.deleteFlight);

module.exports = router;
