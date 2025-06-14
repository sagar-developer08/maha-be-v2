const { Model, DataTypes } = require('sequelize');
const sequelize = require('../environment/databaseConfig');

class Tour extends Model {}

Tour.init({
  title: DataTypes.STRING,
  route: DataTypes.STRING,
  price_adult: DataTypes.STRING,
  price_child: DataTypes.STRING,
  short_detail: DataTypes.TEXT,
  location: DataTypes.STRING,
  package_image: DataTypes.STRING,
  slug: DataTypes.STRING,
  duration: DataTypes.STRING,
  seo: DataTypes.JSON, // Storing the SEO object as JSON
  featured: DataTypes.STRING
}, {
  sequelize,
  modelName: 'Tour',
});

// Associations
Tour.associate = function(models) {
  Tour.hasMany(models.Itinerary, { foreignKey: 'packageId', as: 'itineraries' }); // use 'packageId' as foreign key
  Tour.hasMany(models.Slot, { foreignKey: 'packageId', as: 'slots' }); // Add this line for slot association
};

module.exports = Tour;
