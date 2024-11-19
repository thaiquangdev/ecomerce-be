"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Carts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "Users", // Chỉ ra rằng cột userId tham chiếu bảng Users
          key: "id", // Khóa chính trong bảng Users
        },
        onDelete: "CASCADE", // Nếu người dùng bị xóa thì các giỏ hàng liên quan sẽ bị xóa
      },
      state: {
        type: Sequelize.STRING,
        defaultValue: "active", // Mặc định giỏ hàng có trạng thái "active"
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW, // Mặc định giá trị thời gian tạo
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW, // Mặc định giá trị thời gian cập nhật
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Carts");
  },
};
