// config/database.js
const { Sequelize } = require("sequelize");

// const sequelize = new Sequelize({
//   dialect: "mysql",
//   database: "u877734042_staggingmaha",
//   username: "u877734042_staggingmaha",
//   password: "5D|=^ECv",
//   host: "217.21.80.10",
//   port: "3306",
//   logging: false, // Disable logging
// });

// production
const sequelize = new Sequelize({
  dialect: "mysql",
  database: "u877734042_mahaproduction",
  username: "u877734042_mahaproduction",
  password: "$G?$qT>mdg7",
  host: "217.21.80.10",
  port: "3306",
  logging: false, // Disable logging
});

// sequelize.sync({ alter: true }).then(() => {
  
//   console.log('Schema updated successfully.');
// }).catch((err) => {
//   console.error('Error updating schema:', err);
// });

// module.exports = sequelize;

// const sequelize = new Sequelize({
//   dialect: "mysql",
//   database: "u219107056_maha",
//   username: "u219107056_maha",
//   password: "D2=mr6a3",
//   host: "82.180.142.153",
//   port: "3306",
//   logging: false, // Disable logging
// });

sequelize.sync({ alter: true }).then(() => {
  
  console.log('Schema updated successfully.');
}).catch((err) => {
  console.error('Error updating schema:', err);
});

module.exports = sequelize;
