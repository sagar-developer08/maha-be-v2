const { Model, DataTypes } = require('sequelize');
const sequelize = require('../environment/databaseConfig');

class Booking extends Model {}

Booking.init({
  booking_date: DataTypes.DATEONLY,
  refernce_id:DataTypes.STRING,
  order_id:DataTypes.STRING,
  order_short_code :DataTypes.STRING,
  payment_status:DataTypes.STRING,
  booking_id:DataTypes.STRING,
  slotId: DataTypes.INTEGER,
  tourId: DataTypes.INTEGER, // Add this line for the tour reference
  status: DataTypes.STRING, // 'pending', 'confirmed', 'completed', 'cancelled'
  subTotal: DataTypes.FLOAT,
  booked_by:DataTypes.INTEGER,
  booked_by_waba:DataTypes.STRING,
  slot_conformation:DataTypes.STRING,
  slot_count:DataTypes.INTEGER,
  slot_child:DataTypes.STRING,
  slot_adult:DataTypes.STRING,
  referral_code:DataTypes.STRING,
  bookingfrom:DataTypes.STRING,
}, {
  sequelize,
  modelName: 'Booking',
});

Booking.associate = function(models) {
  Booking.hasMany(models.Passenger, { foreignKey: 'bookingId', as: 'passengers' }); // Updated to reference bookingId
  Booking.belongsTo(models.Slot, { foreignKey: 'slotId', as: 'slot' });
  Booking.belongsTo(models.Tour, { foreignKey: 'tourId', as: 'tour' }); // Add this line for tour association

};

module.exports = Booking;
