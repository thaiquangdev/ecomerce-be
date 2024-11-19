"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Brands", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      brandName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      brandSlug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // Đảm bảo slug là duy nhất
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
    await queryInterface.dropTable("Brands");
  },
};
