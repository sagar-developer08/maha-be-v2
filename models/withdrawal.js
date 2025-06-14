const { Model, DataTypes } = require("sequelize");
const sequelize = require("../environment/databaseConfig");

class Withdrawal extends Model {}

Withdrawal.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    vendorCreditId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    refundId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true, // Optional description of the withdrawal (e.g., refund, adjustment)
    },
  },
  {
    sequelize,
    modelName: "Withdrawal",
    timestamps: true, // Tracks `createdAt` and `updatedAt` fields
  }
);

module.exports = Withdrawal;
