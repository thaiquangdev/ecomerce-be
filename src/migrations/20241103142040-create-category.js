"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Categories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      categoryName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      categorySlug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // Đảm bảo categorySlug là duy nhất
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true, // Đặt mặc định là true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Categories");
  },
};