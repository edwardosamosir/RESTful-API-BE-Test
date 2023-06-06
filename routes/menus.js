const express = require("express");
const router = express.Router();
const MenuController = require('../controllers/menuController');
const adminAuthentication = require('../middlewares/adminAuthentication');


// Show All Menus Endpoint
router.get('/menus', MenuController.showAllMenus)
router.post('/menus', adminAuthentication, MenuController.createMenu)
router.get('/menus/:id', MenuController.showMenuById)
router.delete('/menus/:id',adminAuthentication, MenuController.deleteMenuById)
router.put('/menus/:id', adminAuthentication, MenuController.updateMenuById)

module.exports = router;