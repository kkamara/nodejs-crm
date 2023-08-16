'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('UserPermissions', [
      {
        name: 'access admin',
        codename: 'access_admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'create log',
        codename: 'create_log',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'edit log',
        codename: 'edit_log',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'delete log',
        codename: 'delete_log',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'view log',
        codename: 'view_log',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'create client',
        codename: 'create_client',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'edit client',
        codename: 'edit_client',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'delete client',
        codename: 'delete_client',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'view client',
        codename: 'view_client',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'create user',
        codename: 'create_user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'edit user',
        codename: 'edit_user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'delete user',
        codename: 'delete_user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'view user',
        codename: 'view_user',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('UserPermissions', null, {});
  }
};
