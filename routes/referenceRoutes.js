const express = require("express");
const ReferenceController = require("../controllers/ReferenceController");
const { isAuthenticated } = require("../middleware/auth");
const router = express.Router();


router.get('/calculate-commission/:userId', ReferenceController.calculateCommission);

router.get('/referrals/:userId', isAuthenticated, ReferenceController.getReferrals); // New route for fetching referrals

router.get('/all/commission', isAuthenticated, ReferenceController.getAllcommission);

// router.post('/withdrawal',  ReferenceController.withdraw); // New route for fetching referrals
module.exports = router;