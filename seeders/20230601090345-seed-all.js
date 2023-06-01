'use strict';
const { hashPassword } = require("../helpers/bcryptHasher");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    const users = require('../data.json').users
    await queryInterface.bulkInsert('Users', users.map(el => {
      const hashedPassword = hashPassword(el.password);
      el.password = hashedPassword;
      el.createdAt = el.updatedAt = new Date();
      return el; 
    }), {})

    const profiles = require('../data.json').profiles
    await queryInterface.bulkInsert('Profiles', profiles.map( el => {
      el.createdAt = el.updatedAt = new Date();
      return el;
    }))

    const menus = require('../data.json').menus
    await queryInterface.bulkInsert('Menus', menus.map( el => {
      el.createdAt = el.updatedAt = new Date();
      return el;
    }))

    const carts = require('../data.json').carts
    await queryInterface.bulkInsert('Carts', carts.map( el => {
      el.createdAt = el.updatedAt = new Date();
      return el;
    }))

    const cartItems = require('../data.json').cartItems
    await queryInterface.bulkInsert('CartItems', cartItems.map( el => {
      el.createdAt = el.updatedAt = new Date();
      return el;
    }))

    const orders = require('../data.json').orders
    await queryInterface.bulkInsert('Orders', orders.map( el => {
      el.createdAt = el.updatedAt = new Date();
      return el;
    }))

    const orderItems = require('../data.json').orderItems
    await queryInterface.bulkInsert('OrderItems', orderItems.map( el => {
      el.createdAt = el.updatedAt = new Date();
      return el;
    }))

  },

  async down (queryInterface, Sequelize) {

    await queryInterface.bulkDelete('OrderItems', null, {})
    await queryInterface.bulkDelete('Orders', null, {})
    await queryInterface.bulkDelete('CartItems', null, {})
    await queryInterface.bulkDelete('Carts', null, {})
    await queryInterface.bulkDelete('Menus', null, {})
    await queryInterface.bulkDelete('Profiles', null, {})
    await queryInterface.bulkDelete('Users', null, {})
  }
};
