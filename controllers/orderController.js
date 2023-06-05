const { Order, OrderItem, Cart, CartItem, User, Profile, Menu, sequelize } = require("../models");
const redis = require("../config/redis")

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
                    UserId: userId,
                    status: false,
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
            if (customerCart.totalPrice > customer.Profile.currentBalance) {
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

            // Caching Invalidation so the latest changes can be retrieved
            const cacheKey = `orders:getOrders:${userId}`;
            await redis.del(cacheKey);

            res.status(200).json({ message: "The cart has been successfully checked out, and an order has been created." });
        } catch (error) {
            // Rollback the transaction on error
            await t.rollback();
            next(error)
        }
    }

    static async showOrders(req, res, next) {
        try {
            // Get the user ID from the request object
            const userId = req.user.id;

            // Generate the cache key based on the userId 
            const cacheKey = `orders:getOrders:${userId}`;

            // retrieve the cached data
            const ordersCache = await redis.get(cacheKey);

            // If cached data exists, parse it and send it as the response
            if (ordersCache) {
                const responseBody = JSON.parse(ordersCache)
                res.status(200).json(responseBody)
            } else {
                // Find all orders and its items
                const customerOrders = await Order.findAll({
                    where: {
                        UserId: userId
                    },
                    include: [
                        {
                            model: OrderItem,
                            include: [{ model: Menu }]
                        },
                    ],
                });

                // Store the response body in the redis caching using the cache key
                await redis.set(cacheKey, JSON.stringify(customerOrders));

                // Expire the cache after a certain time (e.g., half an hour)
                await redis.expire(cacheKey, 1800);

                // Return the customer's orders as a JSON response
                res.status(200).json(customerOrders);
            }

        } catch (error) {
            // Pass any errors to the next middleware
            next(error);
        }
    }
}

module.exports = OrderController;