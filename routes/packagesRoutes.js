const express = require('express');
const router = express.Router();
const tourController = require('../controllers/packagesController');
const multer = require('multer');
const { isAuthenticated } = require('../middleware/auth');
const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage: storage });

router.post('/package',isAuthenticated, tourController.createTour);
router.get('/package', tourController.getTours);
router.get('/package/:id', tourController.getTourById);
router.put('/package/:id',isAuthenticated, tourController.updateTour);
router.delete('/package/:id', isAuthenticated,tourController.deleteTour);
router.get('/package-it/:id',tourController.getTourWithItineraries);
module.exports = router;
