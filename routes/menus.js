const express = require("express");
const router = express.Router();
const MenuController = require('../controllers/menuController');

// Show All Menus Endpoint
router.get('/menus', MenuController.showAllMenus)
router.get('/menus/:id', MenuController.showMenuById)

module.exports = router;