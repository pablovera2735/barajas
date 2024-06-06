'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      nTries: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      bannedTime: {
        type: Sequelize.DATE,
        allowNull: true
      },

      isVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};