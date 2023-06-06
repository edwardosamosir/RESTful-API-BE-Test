const express = require("express");
const router = express.Router();
const CartController = require('../controllers/cartController');
const userAuthentication = require('../middlewares/userAuthentication');

router.get('/carts', userAuthentication, CartController.showCustomerCart)
router.post('/carts/:id', userAuthentication, CartController.addCartItem)
router.put('/carts/:id', userAuthentication, CartController.updateCartItem)
router.delete('/carts/:id', userAuthentication, CartController.deleteCartItem)



module.exports = router;