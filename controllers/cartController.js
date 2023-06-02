const { Cart, CartItem, Menu, sequelize } = require("../models");

class CartController {

    static async showCustomerCart(req, res, next) {
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

    static async addCartItem(req, res, next) {
        const t = await sequelize.transaction();
        try {
            const MenuId = req.params.id;
            const UserId = req.user.id;
            const { quantity } = req.body;

            const menu = await Menu.findByPk(MenuId);
            if (!menu) throw { name: "NotFound" };

            const [customerCart, isCreated] = await Cart.findOrCreate({
                where: {
                    UserId,
                    status: false,
                },
                transaction: t,
            });


            const [cartItemAdded, isAdded] = await CartItem.findOrCreate({
                where: {
                    CartId: customerCart.id,
                    MenuId
                },
                transaction: t,
            });


            cartItemAdded.quantity += Number(quantity);
            customerCart.totalPrice += Number(quantity * menu.price);

            await cartItemAdded.save({ transaction: t });
            await customerCart.save({ transaction: t });

            let message = `Successfully added ${quantity} ${menu.name} to your cart.`;
            res.status(201).json({ customerCart, cartItemAdded, message });

            await t.commit();
        } catch (error) {
            await t.rollback();
            next(error);
        }
    }

}

module.exports = CartController;