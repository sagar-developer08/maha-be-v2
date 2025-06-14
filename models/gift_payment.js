// const { Model, DataTypes } = require("sequelize");
// const sequelize = require("../environment/databaseConfig");

// class Payment extends Model {}

// Payment.init(
//   {
//     giftCardId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       comment: "Reference to the associated gift card",
//     },
//     amount: {
//       type: DataTypes.FLOAT,
//       allowNull: false,
//       comment: "Amount paid for the gift card",
//     },
//     currency: {
//       type: DataTypes.STRING,
//       defaultValue: "AED",
//       comment: "Currency of the payment",
//     },
//     status: {
//       type: DataTypes.ENUM("pending", "completed", "failed"),
//       defaultValue: "pending",
//       comment: "Status of the payment",
//     },
//     order_short_code: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//       comment: "Unique transaction ID from STRABL",
//     },
//     order_uuid:{
//         type: DataTypes.STRING,
//         allowNull: false,
//         unique: true,
//         comment: "Unique transaction ID from STRABL",
//     }
//   },
//   {
//     sequelize,
//     modelName: "Payment",
//   }
// );


// module.exports = Payment;
