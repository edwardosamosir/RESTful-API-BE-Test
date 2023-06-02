const express = require("express");
const router = express.Router();
const CartController = require('../controllers/cartController');

router.get('/carts', CartController.showCustomerCart)
router.post('/carts/:id', CartController.addCartItem)



module.exports = router;