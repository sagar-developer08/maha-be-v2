// models/ApiLog.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../environment/databaseConfig");

class ApiLog extends Model {}

ApiLog.init(
  {
    method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    endpoint: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    request_body: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    response_body: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status_code: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "ApiLog",
  }
);

module.exports = ApiLog;
