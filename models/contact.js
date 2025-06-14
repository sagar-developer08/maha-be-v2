// models/contact.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../environment/databaseConfig'); // Assuming you have a database config file

class Contact extends Model {}

Contact.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Contact',
});

module.exports = Contact;
