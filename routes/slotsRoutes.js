const express = require('express');
const slotController = require('../controllers/slotsController');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

router.post('/slot',slotController.createSlot);
router.get('/slot', slotController.getAllSlots);
router.get('/slot/:id', slotController.getSlotById);
router.put('/slot/:id', isAuthenticated,slotController.updateSlot);
router.delete('/slot/:id', isAuthenticated,slotController.deleteSlot);

module.exports = router;
