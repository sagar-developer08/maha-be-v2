// models/Itinerary.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../environment/databaseConfig'); // Adjust path to your config
const Tour = require('../models/packages')
class Itinerary extends Model {}

Itinerary.init({
  packageId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Tours',  // Assuming there's a Tours table
      key: 'id'
    }
  },
  activity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  feature_img: {   // Corrected field name
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  sequelize,
  modelName: 'Itinerary',
  tableName: 'Itineraries',  // Use this if your table name differs
  timestamps: true,          // Ensure timestamps are managed
});

Itinerary.associate = function(models) {
  Itinerary.belongsTo(models.Tour, { foreignKey: 'packageId', as: 'tour' });
};

module.exports = Itinerary;
