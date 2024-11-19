"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Coupons", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false, // Mã coupon không thể để trống
        unique: true, // Đảm bảo mã coupon là duy nhất
      },
      discountAmount: {
        type: Sequelize.FLOAT, // Sử dụng FLOAT để lưu giá trị giảm giá có thể có số thập phân
        allowNull: false, // Giảm giá không thể để trống
      },
      validFrom: {
        type: Sequelize.DATE,
        allowNull: false, // Thời gian bắt đầu không thể để trống
      },
      validTo: {
        type: Sequelize.DATE,
        allowNull: false, // Thời gian kết thúc không thể để trống
      },
      isUse: {
        type: Sequelize.BOOLEAN,
        defaultValue: false, // Mặc định là chưa sử dụng
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW, // Mặc định thời gian tạo
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW, // Mặc định thời gian cập nhật
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Coupons");
  },
};
