"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CartDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CartDetail.belongsTo(models.Cart, {
        foreignKey: "cartId",
        as: "cart",
      });

      CartDetail.belongsTo(models.Product, {
        foreignKey: "productId",
        as: "product",
      });
    }
  }
  CartDetail.init(
    {
      cartId: DataTypes.NUMBER,
      productId: DataTypes.NUMBER,
      size: DataTypes.STRING,
      quantity: DataTypes.NUMBER,
      price: DataTypes.NUMBER,
      totalPrice: DataTypes.NUMBER,
    },
    {
      sequelize,
      modelName: "CartDetail",
    }
  );
  return CartDetail;
};
