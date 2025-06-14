// models/Flight.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../environment/databaseConfig");

class Flight extends Model {}

Flight.init(
  {
    flightNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    departureTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    arrivalTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER, // Duration in minutes
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Scheduled", // Could be Scheduled, Cancelled, Delayed, etc.
    },
  },
  {
    sequelize,
    modelName: "Flight",
  }
);

// Associations
Flight.associate = function (models) {
  Flight.hasMany(models.Slot, { foreignKey: "flightId", as: "slots" }); // Associate with Slot model
};



module.exports = Flight;
