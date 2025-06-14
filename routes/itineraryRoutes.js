// // routes/itineraryRoutes.js
// const express = require('express');
// const router = express.Router();
// const itineraryController = require('../controllers/ItinerayController');
// // const multer = require('multer');
// // const upload = multer(); // Multer to handle file uploads
// const multer = require('multer');
// const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

// // CREATE Itinerary
// router.post('/itinerary', upload.single('feature_img'), itineraryController.createItinerary);

// // UPDATE Itinerary
// router.put('/itinerary/:id', upload.single('feature_img'), itineraryController.updateItinerary);

// // GET All Itineraries
// router.get('/itinerary', itineraryController.getAllItineraries);

// // DELETE Itinerary
// router.delete('/itinerary/:id', itineraryController.deleteItinerary);



// module.exports = router;


// routes/itineraryRoutes.js
const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/ItinerayController');
const multer = require('multer');
const { isAuthenticated } = require('../middleware/auth');

// Configure multer for file uploads
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// CREATE Itinerary
router.post('/itinerary',isAuthenticated, itineraryController.createItinerary);


// UPDATE Itinerary
router.put('/itinerary/:id', isAuthenticated,itineraryController.updateItinerary);

// GET All Itineraries
router.get('/itineraries', itineraryController.getAllItineraries);

// DELETE Itinerary
router.delete('/itinerary/:id', isAuthenticated,itineraryController.deleteItinerary);

module.exports = router;
