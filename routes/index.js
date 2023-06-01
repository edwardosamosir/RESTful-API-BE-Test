const express = require("express");
const router = express.Router();
const usersRouter = require('./users')
const menusRouter = require('./menus')
const cartsRouter = require('./carts')
const orderRouter = require('./orders')
const errorHandler = require('../middlewares/errorHandler')

router.use('/users', usersRouter)
router.use('/menus', menusRouter)
router.use('/carts', cartsRouter)
router.use('/orders', orderRouter)

router.use(errorHandler)

module.exports = router;