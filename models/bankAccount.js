const { Model, DataTypes } = require("sequelize");
const sequelize = require("../environment/databaseConfig");

class BankAccount extends Model {}

BankAccount.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // assuming you have a User model
        key: 'id'
      }
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // ensures account number is unique
    },
    accountHolderName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ifscCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "BankAccount",
    tableName: "bank_accounts", // Explicit table name
  }
);

module.exports = BankAccount;
