"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Payments", "rawResponse", {
      type: Sequelize.TEXT,
      allowNull: true, // nếu cột này có thể null
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Payments", "rawResponse", {
      type: Sequelize.STRING, // kiểu dữ liệu ban đầu (VD: VARCHAR(255))
      allowNull: true, // thay đổi tùy thuộc vào cấu trúc ban đầu
    });
  },
};
