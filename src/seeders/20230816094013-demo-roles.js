'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('UserRoles', [
      {
        name: 'admin',
        codename: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'client admin',
        codename: 'client_admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'client user',
        codename: 'client_user',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('UserRoles', null, {});
  }
};
