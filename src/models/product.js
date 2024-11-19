"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.belongsTo(models.Category, {
        foreignKey: "categoryId",
        as: "category",
      });

      Product.belongsTo(models.Brand, {
        foreignKey: "brandId",
        as: "brand",
      });

      Product.hasMany(models.ProductImage, {
        foreignKey: "productId",
        as: "images",
      });

      Product.hasMany(models.ProductVariant, {
        foreignKey: "productId",
        as: "variants",
      });

      Product.hasMany(models.Wishlist, {
        foreignKey: "productId",
        as: "wishlists",
      });

      Product.hasMany(models.CartDetail, {
        foreignKey: "productId",
        as: "details",
      });
    }
  }
  Product.init(
    {
      title: DataTypes.STRING,
      slug: DataTypes.STRING,
      price: DataTypes.NUMBER,
      discount: DataTypes.NUMBER,
      description: DataTypes.STRING,
      categoryId: DataTypes.NUMBER,
      brandId: DataTypes.NUMBER,
      ratingAvg: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: "Product",
    }
  );
  return Product;
};
