'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CartItem.belongsTo(models.Cart, {foreignKey: "CartId"})
      CartItem.belongsTo(models.Menu, {foreignKey: "MenuId"})
    }
  }
  CartItem.init({
    CartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    MenuId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'CartItem',
  });
  return CartItem;
};