const express = require("express");
const router = express.Router();
const OrderController = require('../controllers/orderController');
const userAuthentication = require('../middlewares/userAuthentication')

// Checkout the cart and create an order endpoint
router.post('/orders/:id', userAuthentication, OrderController.createOrder)



module.exports = router;