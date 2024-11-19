"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Reviews", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull: false, // Không thể để trống
      },
      productId: {
        type: Sequelize.BIGINT,
        allowNull: false, // Không thể để trống
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false, // Không thể để trống
        validate: {
          min: 1, // Đánh giá tối thiểu là 1
          max: 5, // Đánh giá tối đa là 5
        },
      },
      comment: {
        type: Sequelize.TEXT, // Dùng TEXT để lưu bình luận dài
        allowNull: true, // Bình luận có thể để trống
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW, // Mặc định thời gian tạo là hiện tại
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW, // Mặc định thời gian cập nhật là hiện tại
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Reviews");
  },
};
