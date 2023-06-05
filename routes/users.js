const express = require("express");
const router = express.Router();
const userController = require('../controllers/userController');

// Register and Login Endpoint
router.post('/users/login', userController.loginUser);
router.post('/users/register', userController.registerUser);
router.post('/users/add-balance', userController.addUserBalance);

module.exports = router