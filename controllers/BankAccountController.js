const { BankAccount } = require("../models"); // Ensure the path is correct

const bankAccountController = {
  // Create a new bank account
  async createBankAccount(req, res) {
    const { userId, bankName, accountNumber, accountHolderName, ifscCode, branch } = req.body;
    
    try {
      const newAccount = await BankAccount.create({
        userId,
        bankName,
        accountNumber,
        accountHolderName,
        ifscCode,
        branch,
      });

      return res.status(201).json({ message: "Bank account created successfully.", data: newAccount });
    } catch (error) {
      console.error("Bank Account Creation Error:", error);
      return res.status(500).json({ message: "Error creating bank account.", error });
    }
  },

  // Get a bank account by ID
  async getBankAccount(req, res) {
    const { id } = req.params;

    try {
      const bankAccount = await BankAccount.findOne({ where: { id } });
      
      if (!bankAccount) {
        return res.status(404).json({ message: "Bank account not found." });
      }

      return res.status(200).json(bankAccount);
    } catch (error) {
      console.error("Get Bank Account Error:", error);
      return res.status(500).json({ message: "Error retrieving bank account.", error });
    }
  },

  // Update a bank account by ID
  async updateBankAccount(req, res) {
    const { id } = req.params;
    const { bankName, accountNumber, accountHolderName, ifscCode, branch } = req.body;

    try {
      const bankAccount = await BankAccount.findOne({ where: { id } });

      if (!bankAccount) {
        return res.status(404).json({ message: "Bank account not found." });
      }

      await bankAccount.update({
        bankName,
        accountNumber,
        accountHolderName,
        ifscCode,
        branch,
      });

      return res.status(200).json({ message: "Bank account updated successfully.", data: bankAccount });
    } catch (error) {
      console.error("Update Bank Account Error:", error);
      return res.status(500).json({ message: "Error updating bank account.", error });
    }
  },

  // Delete a bank account by ID
  async deleteBankAccount(req, res) {
    const { id } = req.params;

    try {
      const bankAccount = await BankAccount.findOne({ where: { id } });

      if (!bankAccount) {
        return res.status(404).json({ message: "Bank account not found." });
      }

      await bankAccount.destroy();
      return res.status(200).json({ message: "Bank account deleted successfully." });
    } catch (error) {
      console.error("Delete Bank Account Error:", error);
      return res.status(500).json({ message: "Error deleting bank account.", error });
    }
  },

  // Get all bank accounts for a user
  async getUserBankAccounts(req, res) {
    const { userId } = req.params;

    try {
      const bankAccounts = await BankAccount.findAll({ where: { userId } });

      return res.status(200).json(bankAccounts);
    } catch (error) {
      console.error("Get User Bank Accounts Error:", error);
      return res.status(500).json({ message: "Error retrieving bank accounts for user.", error });
    }
  }
};

module.exports = bankAccountController;
