"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Cart.hasMany(models.CartDetail, {
        foreignKey: "cartId",
        as: "details",
      });

      Cart.hasOne(models.Payment, {
        foreignKey: "cartId",
        as: "order",
      });
    }
  }
  Cart.init(
    {
      userId: DataTypes.NUMBER,
      state: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Cart",
    }
  );
  return Cart;
};
