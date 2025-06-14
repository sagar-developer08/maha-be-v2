// const { Model, DataTypes } = require("sequelize");
// const sequelize = require("../environment/databaseConfig");

// class GiftCard extends Model {
//   // Optional: Add any custom methods here
// }

// GiftCard.init(
//   {
//     code: {
//       type: DataTypes.STRING,
//       unique: true,
//       allowNull: false,
//       comment: "Unique code for each gift card",
//       validate: {
//         notEmpty: true,
//       },
//     },
//     value: {
//       type: DataTypes.FLOAT,
//       allowNull: false,
//       comment: "Initial value of the gift card",
//       validate: {
//         isFloat: true,
//         min: 0,
//       },
//     },
//     balance: {
//       type: DataTypes.FLOAT,
//       allowNull: false,
//       comment: "Current balance of the gift card",
//       validate: {
//         isFloat: true,
//         min: 0,
//       },
//     },
//     currency: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       defaultValue: "USD",
//       comment: "Currency of the gift card value",
//       validate: {
//         isIn: [["USD", "EUR", "GBP", "AED"]],
//       },
//     },
//     expirationDate: {
//       type: DataTypes.DATE,
//       allowNull: true,
//       comment: "Optional expiration date for the gift card",
//     },
//     status: {
//       type: DataTypes.ENUM("active", "used", "expired"),
//       defaultValue: "active",
//       comment: "Current status of the gift card",
//     },
//     issuedTo: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//       comment: "User ID of the recipient",
//     },
//     issuedBy: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//       comment: "User ID of the issuer",
//     },
//   },
//   {
//     sequelize,
//     modelName: "GiftCard",
//     timestamps: true, // Adds createdAt and updatedAt fields
//     indexes: [
//       {
//         unique: true,
//         fields: ["code"],
//       },
//     ],
//   }
// );

// // Associations
// GiftCard.associate = (models) => {
//   GiftCard.belongsTo(models.User, { foreignKey: "issuedTo", as: "recipient" });
//   GiftCard.belongsTo(models.User, { foreignKey: "issuedBy", as: "issuer" });
// };

// module.exports = GiftCard;
