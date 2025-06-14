const Tour = require('./packages');
const Itinerary = require('./itinerary');
const Slot = require('./slots'); // Import Slot if needed
const Passenger = require('./passenger');
const Pickup = require('./pickup');
// const Booking = require('./Booking');
const Flight = require('./Flight');
// const Booking = require('');      // Ensure Booking is imported if used
const Booking = require('./booking');
const User = require('./User');
const Commission = require('./commission');
const Withdrawal = require('./withdrawal');
const ApiLog = require('./ApiLog');
const Blog = require('./blog'); // Import Blog model
// Add all models to an object
const models = {
  Tour,
  Itinerary,
  Slot,
  User,
  Flight,
  Booking,
  Pickup,
  Withdrawal,
  Commission,
  Passenger,
  ApiLog, // Add other models here if needed
  Blog, // Register the Blog model
};

// Call the associations after models are loaded
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models); // Pass all models, not just individual ones
  }
});

module.exports = models;
