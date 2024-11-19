"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Roles", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      roleName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // Đảm bảo rằng tên vai trò là duy nhất
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true, // Trường mô tả không bắt buộc
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true, // Mặc định vai trò được kích hoạt
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW, // Ghi lại thời gian tạo
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW, // Ghi lại thời gian cập nhật
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Roles");
  },
};
