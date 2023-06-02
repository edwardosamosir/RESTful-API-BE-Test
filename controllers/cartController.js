const { Cart, CartItem, Menu } = require("../models");

class CartController {

    static async showCustomerCarts(req, res, next) {
        try {
            const UserId = req.user.id;
            const customerCart = await Cart.findAll({
                where: { 
                    UserId,
                    status: false
                 },
                include: [
                    {
                        model: CartItem,
                        include: [{ model: Menu }]
                    },
                ],
            });

            res.status(200).json(customerCart);
        } catch (error) {
            next(error);
        }
    }

}

module.exports = CartController;