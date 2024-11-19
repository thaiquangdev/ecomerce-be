"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Payments", "zp_trans_token", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Payments", "order_url", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Payments", "order_token", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Payments", "qr_code", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Payments", "zp_trans_token");
    await queryInterface.removeColumn("Payments", "order_url");
    await queryInterface.removeColumn("Payments", "order_token");
    await queryInterface.removeColumn("Payments", "qr_code");
  },
};
