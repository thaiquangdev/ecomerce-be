module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Products", "ratingAvg", {
      type: Sequelize.FLOAT,
      allowNull: true, // Bạn có thể thay đổi allowNull tùy theo yêu cầu
      defaultValue: 0, // Giá trị mặc định nếu cần
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Products", "ratingAvg");
  },
};
