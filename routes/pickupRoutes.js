const express = require('express');
const pickupController = require('../controllers/pickupController');

const router = express.Router();

router.post('/pickup', pickupController.createPickup);
router.get('/pickup', pickupController.getAllPickups);
router.get('/pickup/:id', pickupController.getPickupById);
router.put('/pickup/:id', pickupController.updatePickup);
router.delete('/pickup/:id', pickupController.deletePickup);

module.exports = router;
