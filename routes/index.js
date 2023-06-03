const express = require("express");
const router = express.Router();
const usersRouter = require('./users')
const menusRouter = require('./menus')
const cartsRouter = require('./carts')
const orderRouter = require('./orders')
const errorHandler = require('../middlewares/errorHandler')
const userAuthentication = require('../middlewares/userAuthentication')

router.use('/', usersRouter)
router.use('/', menusRouter)
router.use('/', userAuthentication, cartsRouter)
router.use('/', userAuthentication, orderRouter)

router.use(errorHandler)

module.exports = router;