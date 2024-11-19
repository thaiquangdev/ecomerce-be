"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Payment.init(
    {
      userId: DataTypes.BIGINT,
      cartId: DataTypes.BIGINT,
      amount: DataTypes.FLOAT,
      paymentMethod: DataTypes.STRING,
      paymentStatus: DataTypes.STRING,
      paymentDate: DataTypes.DATE,
      transactionId: DataTypes.STRING,
      vnpayTransactionCode: DataTypes.STRING,
      vnPayReponseCode: DataTypes.STRING,
      momoTransactionId: DataTypes.STRING,
      momoTransactionCode: DataTypes.STRING,
      addressId: DataTypes.BIGINT,
      paymentGateway: DataTypes.STRING,
      rawResponse: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Payment",
    }
  );
  return Payment;
};
