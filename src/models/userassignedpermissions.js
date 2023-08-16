'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserAssignedPermissions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserAssignedPermissions.init({
    usersId: DataTypes.INTEGER,
    userPermissionsId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserAssignedPermissions',
  });
  return UserAssignedPermissions;
};