const CartController = require('../controllers/cartController');
const { Cart, CartItem, Menu, sequelize } = require("../models");
const redis = require("../config/redis");

jest.mock("../models");
jest.mock("../config/redis");

describe('CartController', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('showCustomerCart', () => {
        it('should return the customer cart from cache if it exists', async () => {
            // Mock the necessary functions
            jest.spyOn(redis, 'get').mockResolvedValue(JSON.stringify({ cartData: 'data' }));
            const jsonMock = jest.fn();
            const res = { status: jest.fn().mockReturnValueOnce({ json: jsonMock }) };

            // Invoke the showCustomerCart method
            await CartController.showCustomerCart({ user: { id: 1 } }, res, jest.fn());

            // Verify the expected behavior
            expect(redis.get).toHaveBeenCalledTimes(1);
            expect(jsonMock).toHaveBeenCalledWith({ cartData: 'data' });
        });

        it('should fetch the customer cart from the database and cache it if not found in cache', async () => {
            // Mock the necessary functions
            jest.spyOn(redis, 'get').mockResolvedValue(null);
            jest.spyOn(Cart, 'findAll').mockResolvedValue([{ data: 'cartData' }]);
            jest.spyOn(redis, 'set').mockResolvedValue();
            jest.spyOn(redis, 'expire').mockResolvedValue();
            const jsonMock = jest.fn();
            const res = { status: jest.fn().mockReturnValueOnce({ json: jsonMock }) };

            // Invoke the showCustomerCart method
            await CartController.showCustomerCart({ user: { id: 1 } }, res, jest.fn());

            // Verify the expected behavior
            expect(redis.get).toHaveBeenCalledTimes(1);
            expect(Cart.findAll).toHaveBeenCalledTimes(1);
            expect(redis.set).toHaveBeenCalledTimes(1);
            expect(redis.expire).toHaveBeenCalledTimes(1);
            expect(jsonMock).toHaveBeenCalledWith([{ data: 'cartData' }]);
        });

        it('should handle errors and pass them to the next middleware', async () => {
            // Mock the necessary functions
            jest.spyOn(redis, 'get').mockRejectedValue(new Error('Redis error'));
            const nextMock = jest.fn();

            // Invoke the showCustomerCart method
            await CartController.showCustomerCart({ user: { id: 1 } }, jest.fn(), nextMock);

            // Verify the expected behavior
            expect(redis.get).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith(new Error('Redis error'));
        });
    });

    describe('addCartItem', () => {
        it('should add a cart item to the customer cart', async () => {
            // Mock the necessary functions and data
            const menuId = 1;
            const userId = 1;
            const quantity = 2;
            const menu = { id: menuId, name: 'Menu 1', price: 10 };
            const customerCart = { id: 1, totalPrice: 0 };
            const cartItemAdded = { quantity: 0 };
            const t = { commit: jest.fn(), rollback: jest.fn() };
        
            jest.spyOn(Menu, 'findByPk').mockResolvedValue(menu);
            jest.spyOn(Cart, 'findOrCreate').mockResolvedValueOnce([customerCart, false]).mockResolvedValueOnce([customerCart, true]);
            jest.spyOn(CartItem, 'findOrCreate').mockResolvedValue([cartItemAdded, true]);
            jest.spyOn(CartItem.prototype, 'save').mockResolvedValue();
            jest.spyOn(Cart.prototype, 'save').mockResolvedValue();
            jest.spyOn(sequelize, 'transaction').mockImplementation(() => {
                return {
                    commit: t.commit,
                    rollback: t.rollback,
                };
            });
            jest.spyOn(redis, 'del').mockResolvedValue();
        
            const jsonMock = jest.fn();
            const res = { status: jest.fn().mockReturnValueOnce({ json: jsonMock }) };
            const req = { params: { id: menuId }, user: { id: userId }, body: { quantity } };
        
            // Invoke the addCartItem method
            await CartController.addCartItem(req, res, jest.fn());
        
            // Verify the expected behavior
            expect(Menu.findByPk).toHaveBeenCalledTimes(1);
            expect(Menu.findByPk).toHaveBeenCalledWith(menuId);
        
            expect(Cart.findOrCreate).toHaveBeenCalledTimes(2);
            expect(Cart.findOrCreate).toHaveBeenNthCalledWith(1, {
                where: {
                    UserId: userId,
                    status: false,
                },
                transaction: t,
            });
            expect(Cart.findOrCreate).toHaveBeenNthCalledWith(2, {
                where: {
                    UserId: userId,
                    status: false,
                },
                defaults: {
                    UserId: userId,
                    status: false,
                },
                transaction: t,
            });
        
            expect(CartItem.findOrCreate).toHaveBeenCalledTimes(1);
            expect(CartItem.findOrCreate).toHaveBeenCalledWith({
                where: {
                    CartId: customerCart.id,
                    MenuId: menuId,
                },
                transaction: t,
            });
        
            expect(cartItemAdded.quantity).toBe(quantity);
            expect(customerCart.totalPrice).toBe(quantity * menu.price);
        
            expect(cartItemAdded.save).toHaveBeenCalledTimes(1);
            expect(cartItemAdded.save).toHaveBeenCalledWith({ transaction: t });
        
            expect(customerCart.save).toHaveBeenCalledTimes(1);
            expect(customerCart.save).toHaveBeenCalledWith({ transaction: t });
        
            expect(t.commit).toHaveBeenCalledTimes(1);
            expect(t.rollback).not.toHaveBeenCalled();
        
            expect(redis.del).toHaveBeenCalledTimes(1);
            expect(redis.del).toHaveBeenCalledWith(`carts:getCarts:${userId}`);
        
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                customerCart,
                cartItemAdded,
                message: `Successfully added ${quantity} ${menu.name} to your cart.`,
            });
        });

        it('should handle errors and pass them to the next middleware', async () => {
            // Mock the necessary functions
            jest.spyOn(Menu, 'findByPk').mockRejectedValue(new Error('Menu not found'));
            const nextMock = jest.fn();
          
            // Mock the transaction object
            const t = { commit: jest.fn(), rollback: jest.fn() };
            jest.spyOn(sequelize, 'transaction').mockImplementationOnce(callback => {
              return new Promise(resolve => {
                resolve(callback(t));
              });
            });
          
            // Invoke the addCartItem method
            await CartController.addCartItem(
              { params: { id: 1 }, user: { id: 1 }, body: { quantity: 2 } },
              jest.fn(),
              nextMock
            );
          
            // Verify the expected behavior
            expect(sequelize.transaction).toHaveBeenCalledTimes(1);
            expect(t.commit).not.toHaveBeenCalled();
            expect(t.rollback).not.toHaveBeenCalled();
            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith(new Error('Menu not found'));
        });
    });

    describe('updateCartItem', () => {
        it('should update the quantity of a cart item', async () => {
            // Mock the necessary functions
            jest.spyOn(CartItem, 'findOne').mockResolvedValue({ id: 1, quantity: 2, Menu: { id: 1, name: 'Menu 1', price: 10 } });
            jest.spyOn(Cart, 'findOne').mockResolvedValue({ id: 1, totalPrice: 20 });
            const saveMock = jest.fn();
            const jsonMock = jest.fn();
            const res = { status: jest.fn().mockReturnValueOnce({ json: jsonMock }) };
            const req = { params: { id: 1 }, user: { id: 1 }, body: { quantity: 3 } };
            const commitMock = jest.fn();
            const rollbackMock = jest.fn();
            const transactionMock = { commit: commitMock, rollback: rollbackMock };
            jest.spyOn(sequelize, 'transaction').mockResolvedValue(transactionMock);
        
            // Mock the save function for customerCart and cartItem
            const customerCartMock = { save: saveMock };
            const cartItemMock = { update: jest.fn() };
        
            // Invoke the updateCartItem method
            await CartController.updateCartItem(req, res, jest.fn());
        
            // Verify the expected behavior
            expect(CartItem.findOne).toHaveBeenCalledTimes(1);
            expect(Cart.findOne).toHaveBeenCalledTimes(1);
            expect(saveMock).toHaveBeenCalledTimes(1);
            expect(commitMock).toHaveBeenCalledTimes(1);
            expect(rollbackMock).not.toHaveBeenCalled();
            expect(redis.del).toHaveBeenCalledTimes(1);
            expect(jsonMock).toHaveBeenCalledWith({
              customerCart: { id: 1, totalPrice: 40 },
              cartItem: { id: 1, quantity: 3 },
              message: 'Successfully modified the quantity of Menu 1 item to 3.',
            });
        });

        it('should delete a cart item when quantity is set to 0', async () => {
            // Mock the necessary functions
            jest.spyOn(CartItem, 'findOne').mockResolvedValue({ id: 1, quantity: 2, Menu: { id: 1, name: 'Menu 1', price: 10 } });
            jest.spyOn(Cart, 'findOne').mockResolvedValue({ id: 1, totalPrice: 20 });
            const commitMock = jest.fn();
            const transactionMock = { commit: commitMock };
            jest.spyOn(sequelize, 'transaction').mockImplementationOnce(() => transactionMock);
            const deleteCartItemMock = jest.fn().mockResolvedValue();
            jest.spyOn(CartController, 'deleteCartItem').mockImplementationOnce(deleteCartItemMock);
    
            // Invoke the updateCartItem method
            await CartController.updateCartItem(
                { params: { id: 1 }, user: { id: 1 }, body: { quantity: 0 } },
                jest.fn(),
                jest.fn()
            );
    
            // Verify the expected behavior
            expect(deleteCartItemMock).toHaveBeenCalledTimes(1);
            expect(commitMock).toHaveBeenCalledTimes(1);
            expect(redis.del).toHaveBeenCalledTimes(1);
        });
    
        it('should handle errors and pass them to the next middleware', async () => {
            // Mock the necessary functions
            jest.spyOn(CartItem, 'findOne').mockRejectedValue(new Error('Item not found'));
            const nextMock = jest.fn();
    
            // Invoke the updateCartItem method
            await CartController.updateCartItem({ params: { id: 1 }, body: { quantity: 3 } }, jest.fn(), nextMock);
    
            // Verify the expected behavior
            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith(new Error('Item not found'));
        });
    });
    

    describe('deleteCartItem', () => {
        it('should delete a cart item from the customer cart', async () => {
            // Mock the necessary functions
            const cartItemFindOneMock = jest
                .spyOn(CartItem, 'findOne')
                .mockImplementationOnce(() => Promise.resolve({ id: 1, quantity: 2, Menu: { id: 1, name: 'Menu 1', price: 10 } }))
                .mockRejectedValueOnce({ name: 'ItemNotFound' });

            const cartFindOneMock = jest.spyOn(Cart, 'findOne').mockResolvedValue({ id: 1, totalPrice: 20 });
            const cartItemDestroyMock = jest.spyOn(CartItem.prototype, 'destroy').mockResolvedValue();
            const cartSaveMock = jest.spyOn(Cart.prototype, 'save').mockResolvedValue();
            const t = { commit: jest.fn(), rollback: jest.fn() }; // Mock the transaction object
            const sequelizeTransactionMock = jest.spyOn(sequelize, 'transaction').mockResolvedValue(t);
            const redisDelMock = jest.spyOn(redis, 'del').mockResolvedValue();

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const req = {
                params: { id: 1 },
                user: { id: 1 }
            };

            // Invoke the deleteCartItem method
            await CartController.deleteCartItem(req, res, jest.fn());

            // Verify the expected behavior
            expect(cartItemFindOneMock).toHaveBeenCalledTimes(2);
            expect(cartItemFindOneMock).toHaveBeenCalledWith({
                where: {
                    id: 1
                },
                include: [
                    {
                        model: Menu
                    }
                ],
                transaction: t
            });
            expect(cartFindOneMock).toHaveBeenCalledTimes(1);
            expect(cartFindOneMock).toHaveBeenCalledWith({
                where: {
                    id: 1
                },
                transaction: t
            });
            expect(cartItemDestroyMock).toHaveBeenCalledTimes(1);
            expect(cartItemDestroyMock).toHaveBeenCalledWith({
                transaction: t
            });
            expect(cartSaveMock).toHaveBeenCalledTimes(1);
            expect(cartSaveMock).toHaveBeenCalledWith({
                transaction: t
            });
            expect(t.rollback).not.toHaveBeenCalled();
            expect(t.commit).toHaveBeenCalledTimes(1);
            expect(sequelizeTransactionMock).toHaveBeenCalledTimes(1);
            expect(redisDelMock).toHaveBeenCalledTimes(1);
            expect(redisDelMock).toHaveBeenCalledWith(`carts:getCarts:${req.user.id}`);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: `Successfully deleted ${cartItemFindOneMock().Menu.name} item from cart`
            });
        });

        it('should handle errors and pass them to the next middleware', async () => {
            // Mock the necessary functions
            jest.spyOn(CartItem, 'findOne').mockRejectedValue(new Error('Item not found'));
            const nextMock = jest.fn();

            // Invoke the deleteCartItem method
            await CartController.deleteCartItem({ params: { id: 1 }, user: { id: 1 } }, jest.fn(), nextMock);

            // Verify the expected behavior
            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith(new Error('Item not found'));
        });
    });
});
