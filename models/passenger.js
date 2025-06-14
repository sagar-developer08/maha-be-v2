const { Model, DataTypes } = require('sequelize');
const sequelize = require('../environment/databaseConfig');

class Passenger extends Model {}

Passenger.init({
  name: DataTypes.STRING,
  last_name:DataTypes.STRING,
  email: DataTypes.STRING,
  type:DataTypes.STRING,
  phone:DataTypes.INTEGER,
  weight: DataTypes.STRING,
  refernce_id:DataTypes.STRING,
  slotId: DataTypes.INTEGER, 
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Bookings',
      key: 'id'
    },
    onDelete: 'SET NULL', // Set to NULL if the associated Booking is deleted
  }
}, {
  sequelize,
  modelName: 'Passenger',
});


Passenger.associate = function(models) {
  Passenger.belongsTo(models.Booking, { foreignKey: 'bookingId', as: 'booking' ,onDelete: 'SET NULL' });
  Passenger.belongsTo(models.Slot, { foreignKey: 'slotId', as: 'slot' });
  Passenger.hasMany(models.Pickup, { foreignKey: 'passengerId', as: 'pickups' });
  // Passenger.hasOne(models.User, { foreignKey: 'passengerId', as: 'user' }); // Link to User
};

module.exports = Passenger;
