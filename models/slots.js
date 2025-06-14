const { Model, DataTypes } = require("sequelize");
const sequelize = require("../environment/databaseConfig");

class Slot extends Model {}

Slot.init(
  {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    // time: {
    //   type: DataTypes.TIME,
    //   allowNull: false,
    // },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 45, // Slot duration in minutes
    },
    totalSlots: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 45, // Default to 45 slots for each flight
      validate: {
        min: 1,
      },
    },
    bookedSlots: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    flightId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    packageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Slot",
  }
);

// Associations
Slot.associate = function (models) {
  Slot.belongsTo(models.Flight, { foreignKey: "flightId", as: "flight" }); // Associate with Flight model
  Slot.belongsTo(models.Tour, { foreignKey: "packageId", as: "tour" });
  Slot.hasMany(models.Passenger, { as: "passengers", foreignKey: "slotId",onDelete: "CASCADE" });
};

module.exports = Slot;
