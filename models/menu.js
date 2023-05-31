'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Menu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Menu.hasMany(models.CartItem, {foreignKey: "MenuId"})
      Menu.hasMany(models.OrderItem, {foreignKey: "MenuId"})
    }
  }
  Menu.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Menu's name is required!" },
        notEmpty: { msg: "Menu's name is required!" }
      },
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "Price is required!" },
        notEmpty: { msg: "Price is required!" }
      },
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Menu's image url is required!" },
        notEmpty: { msg: "Menu's image url is required!" }
      },
    }
  }, {
    sequelize,
    modelName: 'Menu',
  });
  return Menu;
};