const { Model, DataTypes } = require('sequelize');
const sequelize = require('../environment/databaseConfig');

class Category extends Model { }

Category.init({
    name: {
        type: DataTypes.JSON, // Store names as an object with en/ar
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Category name is required'
            },
            isValidName(value) {
                if (!value || typeof value !== 'object') {
                    throw new Error('Category name must be an object with en and ar properties');
                }
                if (!value.en || !value.ar) {
                    throw new Error('Both English (en) and Arabic (ar) names are required');
                }
            }
        }
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
}, {
    sequelize,
    modelName: 'Category',
});

module.exports = Category; 