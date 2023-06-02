const { Cart, CartItem, Menu, sequelize } = require("../models");

class CartController {

    static async showCustomerCart(req, res, next) {
        try {
            // Get the user ID from the request object
            const userId = req.user.id;

            // Find all cart items for the user where the status is false
            const customerCart = await Cart.findAll({
                where: {
                    UserId: userId,
                    status: false
                },
                include: [
                    {
                        model: CartItem,
                        include: [{ model: Menu }]
                    },
                ],
            });

            // Return the customer's cart as a JSON response
            res.status(200).json(customerCart);

        } catch (error) {
            // Pass any errors to the next middleware
            next(error);
        }
    }

    static async addCartItem(req, res, next) {
        // Begin a transaction
        const t = await sequelize.transaction();

        try {
            const menuId = req.params.id;
            const userId = req.user.id;
            const { quantity } = req.body;

            // Find the menu item
            const menu = await Menu.findByPk(menuId);
            if (!menu) {
                throw { name: "NotFound" };
            }

            // Find or create the customer's cart
            const [customerCart, isCreated] = await Cart.findOrCreate({
                where: {
                    UserId: userId,
                    status: false,
                },
                transaction: t,
            });

            // Find or create the cart item
            const [cartItemAdded, isAdded] = await CartItem.findOrCreate({
                where: {
                    CartId: customerCart.id,
                    MenuId: menuId
                },
                transaction: t,
            });

            // Update the quantity and total price
            cartItemAdded.quantity += Number(quantity);
            customerCart.totalPrice += Number(quantity * menu.price);

            // Save the changes
            await cartItemAdded.save({ transaction: t });
            await customerCart.save({ transaction: t });

            // Commit the transaction
            await t.commit();

            const message = `Successfully added ${quantity} ${menu.name} to your cart.`;
            res.status(201).json({ customerCart, cartItemAdded, message });

        } catch (error) {
            // Rollback the transaction on error
            await t.rollback();
            next(error);
        }
    }

    static async updateCartItem(req, res, next) {
        // Begin a transaction
        const t = await sequelize.transaction();

        try {
            // Get the cart item's id from the request params 
            const { id } = req.params

            // Get the cart item's quantity from the request body
            const { quantity } = req.body;

            // Find the cart item to update
            const cartItem = await CartItem.findOne({
                where: {
                    id
                },
                include: [
                    {
                        model: Menu,
                    },
                ],
                transaction: t,
            })

            // Validate the existence cart item to update
            if (!cartItem) {
                throw { name: "NotFound" };
            }

            // Find the customer's cart
            const customerCart = await Cart.findOne({
                where: {
                    id: cartItem.CartId
                },
                transaction: t,
            })

            // Calculate the total price difference
            const totalPriceDiff = (quantity - cartItem.quantity) * cartItem.Menu.price;
            customerCart.totalPrice += Number(totalPriceDiff)

            // Save the changes, commit the transaction and return message as a JSON response  
            if(Number(totalPriceDiff) === 0){
                // Quantity remains the same
                return res.status(200).json({
                    message: `No change made to the ${cartItem.Menu.name} item`
                })
            }
            else if (Number(quantity) === 0) {
                // Delete the cart item
                await t.commit();
                await CartController.deleteCartItem(req, res, next);
            } else {
                // Update the cart item's quantity
                await customerCart.save({ transaction: t });
                await cartItem.update({ quantity }, { transaction: t });
                await t.commit();
                const message = `Successfully modified the quantity of ${cartItem.Menu.name} item to ${cartItem.quantity}.`;
                res.status(200).json({ customerCart, cartItem, message })
            }

        } catch (error) {
            // Rollback the transaction on error
            await t.rollback();
            next(error);
        }
    }

    static async deleteCartItem(req, res, next) {
        // Begin a transaction
        const t = await sequelize.transaction();

        try {
            // Get the cart item's id from the request params 
            const { id } = req.params

            // Find the cart item to delete
            const cartItem = await CartItem.findOne({
                where: {
                    id
                },
                include: [
                    {
                        model: Menu,
                    },
                ],
                transaction: t,
            })

            // Validate the existence cart item to delete
            if (!cartItem) {
                throw { name: "NotFound" };
            }

            // Find the customer's cart
            const customerCart = await Cart.findOne({
                where: {
                    id: cartItem.CartId
                },
                transaction: t,
            })

            // Calculate the total price difference
            const totalPriceDiff = cartItem.quantity * cartItem.Menu.price;
            customerCart.totalPrice -= Number(totalPriceDiff)

            // Save the changes
            await customerCart.save({ transaction: t });
            await cartItem.destroy({ transaction: t })

            // Commit the transaction
            await t.commit();

            // Return message as a JSON response
            res.status(200).json({
                message: `Successfully deleted ${cartItem.Menu.name} item from cart`
            })

        } catch (error) {
            // Rollback the transaction on error
            await t.rollback();
            next(error);
        }
    }

}

module.exports = CartController;