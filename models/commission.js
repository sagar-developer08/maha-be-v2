const { Model, DataTypes } = require('sequelize');
const sequelize = require('../environment/databaseConfig'); // Adjust path to database config

class Commission extends Model {}

Commission.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false, // Required to ensure commissions are tied to a booking
    },

    directSales: {
      type: DataTypes.DECIMAL,
      defaultValue: 0,
    },
    level1Sales: {
      type: DataTypes.DECIMAL,
      defaultValue: 0,
    },
    level2Sales: {
      type: DataTypes.DECIMAL,
      defaultValue: 0,
    },
    directCommission: {
      type: DataTypes.DECIMAL,
      defaultValue: 0,
    },
    l1Commission: {
      type: DataTypes.DECIMAL,
      defaultValue: 0,
    },
    l2Commission: {
      type: DataTypes.DECIMAL,
      defaultValue: 0,
    },
    vendor_credit_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    totalCommission: {
      type: DataTypes.DECIMAL,
      defaultValue: 0,
    },
    vendor_credit_refund_id:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    sum_total: {
      type: DataTypes.STRING,
    },
    withDrawn: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'new',
    }
  },
  {
    sequelize,
    modelName: 'Commission',
    timestamps: true,
  }
);

Commission.afterBulkCreate(async (commissions, options) => {
  if (commissions.length > 0) {
    const userId = commissions[0].userId; // All commissions will have the same userId
    const totalSum = await Commission.sum('totalCommission', { where: { userId } });
    await Commission.update({ sum_total: totalSum }, { where: { userId } });
  }
});

Commission.afterCreate(async (commission, options) => {
  const userId = commission.userId;
  const totalSum = await Commission.sum('totalCommission', { where: { userId } });
  await Commission.update({ sum_total: totalSum }, { where: { userId } });
});
module.exports = Commission;
