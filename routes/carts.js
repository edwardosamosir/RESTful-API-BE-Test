const express = require("express");
const router = express.Router();
const CartController = require('../controllers/cartController');

router.get('/carts', CartController.showCustomerCarts)



module.exports = router;