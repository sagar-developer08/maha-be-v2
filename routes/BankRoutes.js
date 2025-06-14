const express = require("express");
const bankAccountController = require("../controllers/BankAccountController");

const router = express.Router();

router.post("/bank-account", bankAccountController.createBankAccount);
router.get("/bank-account/:id", bankAccountController.getBankAccount);
router.put("/bank-account/:id", bankAccountController.updateBankAccount);
router.delete("/bank-account/:id", bankAccountController.deleteBankAccount);
router.get("/user/:userId/bank-accounts", bankAccountController.getUserBankAccounts);

module.exports = router;
