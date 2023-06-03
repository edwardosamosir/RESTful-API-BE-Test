const express = require("express");
const router = express.Router();
const OrderController = require('../controllers/orderController');

// Checkout the cart and create an order endpoint
router.post('/orders/:id', OrderController.createOrder)



module.exports = router;