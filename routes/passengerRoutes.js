const express = require('express');
const passengerController = require('../controllers/passengerController');
const router = express.Router();

router.post('/passenger', passengerController.createPassengers);
router.get('/passenger', passengerController.getAllPassengers);
router.get('/passenger/:id', passengerController.getPassengerById);
router.put('/passenger/:id', passengerController.updatePassenger);
router.delete('/passenger/:id', passengerController.deletePassenger);
router.post('/create/entry',passengerController.createPassenger)
module.exports = router;
