const express = require("express");
const router = express.Router();
const authController = require("../controllers/userController");

const multer = require("multer");
const { isAuthenticated } = require("../middleware/auth");
const User = require("../models/User");
const storage = multer.memoryStorage(); // Store file in memory as a buffer
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post("/login", authController.login);
router.post("/register", authController.register);

// gift customer
router.post("/gift-customer", authController.registergiftCustomer);
// Upload IDs based on role
// router.post('/upload-ids', upload.fields([{ name: 'emt_id' }, { name: 'passport_id' }]), authController.uploadIDs);
// router.post('/upload-ids', upload.fields([
//     { name: 'emt_id', maxCount: 1 },
//     { name: 'passport_id', maxCount: 1 },
//   ]), authController.uploadIDs);

router.post("/upload-ids", authController.uploadIDs);

// Save social media info (Only for B2B Influencers)
router.post("/social-media", authController.saveSocialMedia);
//
router.post("/verify-otp", authController.verifyOtp);
router.post("/generate-otp", authController.generateAndStoreOTP);
router.get("/users/:id", authController.getUserById); // Get user by ID
router.put("/users/:id",authController.updateUser); // Update user
router.delete("/users/:id", isAuthenticated,authController.deleteUser); // Delete user
router.get("/users", authController.getAllUsers);
router.post('/forgotPassword',authController.forgotPassword);
router.post('/resetPassword',authController.resetPassword)
router.post('/updatePassword/:id',isAuthenticated,authController.updatePassword)
router.get('/referral/:code', async (req, res) => {
  const { code } = req.params;
try {
  const user = await User.findAll({ where: { referrerId: code } });
  if(!user)
  {
    res.status(400).json({ error: "Referral code not valid" });
    return;
  }
 
    res.status(200).json({ message: "Referral code is valid",user });
 
} catch (error) {
  console.log(error)
  res.status(400).json({ error: "error",details: error.message });
}
  
});


module.exports = router;
