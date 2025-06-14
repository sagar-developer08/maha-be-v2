const { Model, DataTypes } = require("sequelize");
const sequelize = require("../environment/databaseConfig");

class User extends Model {}

User.init(
  {
    uuid: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING, // 'customer', 'B2B', 'admin',
    emt_id: DataTypes.STRING,
    passport_id: DataTypes.STRING,
    trade_license: DataTypes.STRING, // For B2B-company
    trn_certificate: DataTypes.STRING, // For B2B-company
    owner_passport: DataTypes.STRING, // For B2B-company and B2B-influencer
    visa_copy: DataTypes.STRING, // For B2B-company
    emirates_id: DataTypes.STRING, // For B2B-company
    is_verified_byadmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passengerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    referral_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    remark: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    referrerId: {////Added
      type: DataTypes.STRING,
      allowNull: true, // Referring to another user (referrer)
      comment: 'This stores the ID of the user who referred them'
    },
    commission_rate: {
      type: DataTypes.FLOAT,
      defaultValue: 0.05, // 5% for direct referrals
    },
    indirect_commission_rate: {
      type: DataTypes.FLOAT,
      defaultValue: 0.03, // 3% for indirect referrals
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ann_date:{
      type:DataTypes.STRING,
      allowNull: true,
    },
    partner:{
      type:DataTypes.STRING,
      allowNull: true,
    },
    partner_dob:{
      type:DataTypes.STRING,
      allowNull: true,
    },
    nationality:{
      type:DataTypes.STRING,
      allowNull: true,
    },
    country_of_residence:{
      type:DataTypes.STRING,  
      allowNull: true,
    },
    contributor:{
      type:DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    gifted:{
      type:DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    giftedId:{
      type:DataTypes.STRING,
      allowNull: true,
    }
  },
  {
    sequelize,
    modelName: "User",
  }
);

// User.associate = function(models) {
//   User.belongsTo(models.Passenger, { foreignKey: 'passengerId', as: 'passenger' });
// };
sequelize.sync({ alter: true }).then(() => {
  console.log('Schema updated successfully.');
}).catch((err) => {
  console.error('Error updating schema:', err);
});
module.exports = User;
// referral_code: {
//   type: DataTypes.STRING,
//   allowNull: true,
// },
// referrerId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true, // Referring to another user (referrer)
    //   comment: 'This stores the ID of the user who referred them'
    // },