const express = require("express");
const router = express.Router();
const MenuController = require('../controllers/menuController');

// Show All Menus Endpoint
router.get('/menus', MenuController.showAllMenus)

module.exports = router;