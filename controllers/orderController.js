const { Order, OrderItem, Cart, CartItem, User, Profile, Menu, sequelize } = require("../models");

class OrderController {
    static async createOrder(req, res, next) {
        // Begin a transaction
        const t = await sequelize.transaction();

        try {
            const cartId = req.params.id
            const userId = req.user.id

            // Find customer cart to check out as an order
            const customerCart = await Cart.findOne({
                where: {
                    id: cartId,
                    status: false
                },
                include: [
                    {
                        model: CartItem,
                        include: [{ model: Menu }]
                    },
                ],
                transaction: t,
            });

            // Validate the existence of customer cart to checkout as an order
            if (!customerCart) {
                throw { name: "CartNotFound" };
            }

            // Create new a order
            const newOrder = await Order.create({
                UserId: userId,
                totalPrice: customerCart.totalPrice
            }, { transaction: t })

            // create order itmes as in cart items
            for (const cartItem of customerCart.CartItems) {
                const { MenuId, quantity } = cartItem;

                await OrderItem.create({
                    OrderId: newOrder.id,
                    MenuId,
                    quantity,
                }, { transaction: t });
            }

            // Find the customer and their profile from which the balance needs to be deducted.
            const customer = await User.findOne({
                where: {
                    id: userId
                },
                include: [
                    {
                        model: Profile
                    },
                ],
                transaction: t,
            });

            // Validate current balance sufficiency
            if(customerCart.totalPrice > customer.Profile.currentBalance){
                throw { name: "NotSufficientBalance" };
            }

            // Deduct customer's current balance
            customer.Profile.currentBalance -= customerCart.totalPrice;
            // Save the updated balance to the database
            await customer.Profile.save({ transaction: t }); 

            // Change the cart status to true, indicating that the cart and items have already been checked out for the order
            customerCart.status = true 
            // Save the updated cart status to the database
            await customerCart.save({ transaction: t }); 

            // Commit the transaction
            await t.commit();

            res.status(200).json({ message: "The cart has been successfully checked out, and an order has been created." });
        } catch (error) {
            // Rollback the transaction on error
            await t.rollback();
            next(error)
        }
    }
}

module.exports = OrderController;