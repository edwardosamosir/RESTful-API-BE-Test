'use strict';
const {
  Model
} = require('sequelize');
const { hashPassword } = require("../helpers/bcryptHasher")
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.Profile);
      User.hasMany(models.Cart, { foreignKey: "UserId" });
      User.hasMany(models.Order, { foreignKey: "UserId" });
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "Username is already used, please use another username!"
      },
      validate: {
        notNull: { msg: "Username is required!" },
        notEmpty: { msg: "Username is required!" }
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "Email is already used, please use another email!",
      },
      validate: {
        notNull: { msg: "Email is required!" },
        notEmpty: { msg: "Email is required!" },
        isEmail: { msg: "Email format is not valid!" }
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Password is required!" },
        notEmpty: { msg: "Password is required!" },
        len: {
          args: [8],
          msg: "Password length are minimum 8 characters!"
        },
      },
    },
    role: DataTypes.STRING,
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "Phone number is already registered, please use another phone number!",
      },
      validate: {
        notNull: { msg: "Phone number is required!" },
        notEmpty: { msg: "Phone number is required!" }
      },
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate(instance) {
        instance.password = hashPassword(instance.password)
      },
    },
  });
  return User;
};