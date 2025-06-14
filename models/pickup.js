const { Model, DataTypes } = require('sequelize');
const sequelize = require('../environment/databaseConfig');

class Pickup extends Model {}

Pickup.init({
  // house_no: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // area: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  passengerId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Foreign key linking to Passenger
  },
  refernce_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Pickup',
});

// Associations
Pickup.associate = function(models) {
    Pickup.belongsTo(models.Passenger, { foreignKey: 'passengerId', as: 'passenger' });
};

module.exports = Pickup;
