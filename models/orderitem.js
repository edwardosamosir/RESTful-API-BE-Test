'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      OrderItem.belongsTo(models.Order, {foreignKey: "OrderId"})
      OrderItem.belongsTo(models.Menu, {foreignKey: "MenuId"})
    }
  }
  OrderItem.init({
    OrderId: {
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
    modelName: 'OrderItem',
  });
  return OrderItem;
};