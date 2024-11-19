"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Payments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      userId: {
        type: Sequelize.BIGINT,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      cartId: {
        type: Sequelize.BIGINT,
        references: {
          model: "Carts",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      amount: {
        type: Sequelize.BIGINT,
      },
      paymentMethod: {
        type: Sequelize.STRING,
      },
      paymentStatus: {
        type: Sequelize.STRING,
      },
      paymentDate: {
        type: Sequelize.DATE,
      },
      transactionId: {
        type: Sequelize.STRING,
      },
      vnpayTransactionCode: {
        type: Sequelize.STRING,
      },
      vnPayReponseCode: {
        type: Sequelize.STRING,
      },
      momoTransactionId: {
        type: Sequelize.STRING,
      },
      momoTransactionCode: {
        type: Sequelize.STRING,
      },
      addressId: {
        type: Sequelize.BIGINT,
        references: {
          model: "Addresses",
          key: "id",
        },
      },
      paymentGateway: {
        type: Sequelize.STRING,
      },
      rawResponse: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Payments");
  },
};
