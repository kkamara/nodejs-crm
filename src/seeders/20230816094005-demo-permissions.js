'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('UserPermissions', [
      // {
      //   name: '',
      //   codename: '',
      // }
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('UserPermissions', null, {});
  }
};
