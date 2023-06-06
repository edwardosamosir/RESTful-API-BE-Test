const express = require("express");
const router = express.Router();
const userController = require('../controllers/userController');
const userAuthentication = require('../middlewares/userAuthentication')

// Register and Login Endpoint
router.post('/users/login', userController.loginUser);
router.post('/users/register', userController.registerUser);
router.put('/users/profile', userAuthentication, userController.editProfile);
router.post('/users/add-balance', userAuthentication, userController.addUserBalance);

module.exports = router