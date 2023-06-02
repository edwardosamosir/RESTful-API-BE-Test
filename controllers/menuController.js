const { Menu } = require("../models");

class MenuController {
    static async showAllMenus(req, res, next) {
        try {
          const menus = await Menu.findAll();
    
          res.status(200).json(menus);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = MenuController;