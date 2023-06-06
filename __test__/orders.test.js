const OrderController = require('../controllers/orderController');
const { Order, OrderItem, Cart, CartItem, User, Profile, Menu, sequelize } = require("../models");
const redis = require("../config/redis");

jest.mock("../models");
jest.mock("../config/redis");

describe("OrderController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createOrder", () => {
        it("should create an order and update user balance", async () => {
            // Mocked request and response objects
            const req = {
                params: { id: "mockCartId" },
                user: { id: "mockUserId" },
            };
            const res = {
                status: jest.fn(() => res),
                json: jest.fn(),
            };
            const next = jest.fn();

            // Mocked cart and user objects
            const mockCart = {
                id: "mockCartId",
                UserId: "mockUserId",
                totalPrice: 100,
                CartItems: [
                    {
                        MenuId: "menu1",
                        quantity: 2,
                        Menu: {
                            price: 50,
                        },
                    },
                ],
                save: jest.fn(),
            };
            const mockUser = {
                id: "mockUserId",
                Profile: {
                    currentBalance: 500,
                    save: jest.fn(),
                },
            };

            // Mock the necessary functions
            Cart.findOne.mockResolvedValueOnce(mockCart);
            User.findOne.mockResolvedValueOnce(mockUser);
            Order.create.mockResolvedValueOnce({});
            sequelize.transaction.mockResolvedValueOnce({
                commit: jest.fn(),
                rollback: jest.fn(),
            });
            redis.del.mockResolvedValueOnce();

            // Perform the test
            await OrderController.createOrder(req, res, next);

            // Assertions
            expect(Cart.findOne).toHaveBeenCalledWith({
                where: {
                    id: req.params.id,
                    UserId: req.user.id,
                    status: false,
                },
                include: [{ model: CartItem, include: [{ model: Menu }] }],
                transaction: expect.any(Object),
            });
            expect(User.findOne).toHaveBeenCalledWith({
                where: { id: req.user.id },
                include: [{ model: Profile }],
                transaction: expect.any(Object),
            });
            expect(Order.create).toHaveBeenCalledWith(
                {
                    UserId: req.user.id,
                    totalPrice: mockCart.totalPrice,
                },
                { transaction: expect.any(Object) }
            );
            expect(mockUser.Profile.currentBalance).toBe(400);
            expect(mockUser.Profile.save).toHaveBeenCalled();
            expect(mockCart.save).toHaveBeenCalled();
            expect(redis.del).toHaveBeenCalledWith(`orders:getOrders:${req.user.id}`);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "The cart has been successfully checked out, and an order has been created.",
            });
            expect(next).not.toHaveBeenCalled();
        });

        it("should handle CartNotFound error", async () => {
            // Mocked request and response objects
            const req = {
                params: { id: "mockCartId" },
                user: { id: "mockUserId" },
            };
            const res = {
                status: jest.fn(() => res),
                json: jest.fn(),
            };
            const next = jest.fn();

            // Mock the necessary functions
            Cart.findOne.mockResolvedValueOnce(null);
            sequelize.transaction.mockResolvedValueOnce({
                commit: jest.fn(),
                rollback: jest.fn(),
            });

            // Perform the test
            await OrderController.createOrder(req, res, next);

            // Assertions
            expect(Cart.findOne).toHaveBeenCalledWith({
                where: {
                    id: req.params.id,
                    UserId: req.user.id,
                    status: false,
                },
                include: [{ model: CartItem, include: [{ model: Menu }] }],
                transaction: expect.any(Object),
            });
            expect(next).toHaveBeenCalledWith({ name: "CartNotFound" });
        });

        it("should handle NotSufficientBalance error", async () => {
            // Mocked request and response objects
            const req = {
                params: { id: "mockCartId" },
                user: { id: "mockUserId" },
            };
            const res = {
                status: jest.fn(() => res),
                json: jest.fn(),
            };
            const next = jest.fn();

            // Mocked cart and user objects
            const mockCart = {
                id: "mockCartId",
                UserId: "mockUserId",
                totalPrice: 500,
                status: false,
                CartItems: [
                    {
                        MenuId: "menu1",
                        quantity: 2,
                        Menu: {
                            price: 50,
                        },
                    },
                ],
                save: jest.fn(),
            };
            const mockUser = {
                id: "mockUserId",
                Profile: {
                    currentBalance: 400,
                    save: jest.fn(),
                },
                Cart: {
                    include: [
                        {
                            model: CartItem,
                            include: [Menu],
                        },
                    ],
                },
            };

            // Mock the necessary functions
            Cart.findOne.mockResolvedValueOnce(mockCart);
            User.findOne.mockResolvedValueOnce(mockUser);

            // Mock the transaction
            const t = {
                commit: jest.fn(),
                rollback: jest.fn(),
            };

            sequelize.transaction.mockImplementation(async (callback) => {
                try {
                    if (typeof callback === "function") {
                        return await callback(t); // Call the callback with transaction mock
                    }
                    return Promise.resolve(t);
                } catch (error) {
                    await t.rollback();
                    throw error;
                }
            });

            // Perform the test
            await OrderController.createOrder(req, res, next);

            // Assertions
            expect(Cart.findOne).toHaveBeenCalledWith({
                where: {
                    id: req.params.id,
                    UserId: req.user.id,
                    status: false,
                },
                include: [{ model: CartItem, include: [{ model: Menu }] }],
                transaction: expect.any(Object),
            });
            expect(User.findOne).toHaveBeenCalledWith({
                where: { id: req.user.id },
                include: [
                    { model: Profile },
                    {
                        model: Cart,
                        include: [
                            {
                                model: CartItem,
                                include: [{ model: Menu }],
                            },
                        ],
                    },
                ],
                transaction: expect.any(Object),
            });
            expect(next).toHaveBeenCalledWith({ name: "NotSufficientBalance" });
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });


        it("should handle errors and call the next middleware", async () => {
            // Mocked request and response objects
            const req = {
                user: { id: "mockUserId" },
            };
            const res = {
                status: jest.fn(() => res),
                json: jest.fn(),
            };
            const next = jest.fn();

            // Mock the redis.get function
            redis.get.mockImplementation((key, callback) => {
                callback(new Error("Redis error"), null);
            });

            // Perform the test
            await OrderController.showOrders(req, res, next);

            // Assertions
            expect(redis.get).toHaveBeenCalledWith(
                `orders:getOrders:${req.user.id}`,
                expect.any(Function)
            );
            expect(next).toHaveBeenCalledWith(new Error("Redis error"));
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });


    });

    describe("showOrders", () => {
        it("should retrieve orders from the cache and send as the response if cache exists", async () => {
            // Mocked request and response objects
            const req = {
              user: { id: "mockUserId" },
            };
            const res = {
              status: jest.fn(() => res),
              json: jest.fn(),
            };
            const next = jest.fn();
        
            // Mock the redis.get function
            redis.get.mockImplementation((key, callback) => {
              callback(null, JSON.stringify(["order1", "order2"]));
            });
        
            // Perform the test
            await OrderController.showOrders(req, res, next);
        
            // Assertions
            expect(redis.get).toHaveBeenCalledWith(
                expect.stringMatching(/orders:getOrders:mockUserId/),
                expect.any(Function)
              );
              
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(["order1", "order2"]);
            expect(Order.findAll).not.toHaveBeenCalled();
            expect(redis.set).not.toHaveBeenCalled();
            expect(redis.expire).not.toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
          });
      
        it("should retrieve orders from the database, cache them, and send as the response if cache does not exist", async () => {
          // Mocked request and response objects
          const req = {
            user: { id: "mockUserId" },
          };
          const res = {
            status: jest.fn(() => res),
            json: jest.fn(),
          };
          const next = jest.fn();
      
          // Mocked orders from the database
          const mockOrders = [{ order: "mockOrder" }];
      
          // Mock the necessary functions
          Order.findAll.mockResolvedValueOnce(mockOrders);
          redis.get.mockImplementation((key, callback) => {
            callback(null, null);
          });
      
          // Perform the test
          await OrderController.showOrders(req, res, next);
      
          // Assertions
          expect(redis.get).toHaveBeenCalledWith(
            expect.stringMatching(/orders:getOrders:mockUserId/),
            expect.any(Function)
          );
          expect(Order.findAll).toHaveBeenCalledWith({
            where: { UserId: req.user.id },
            include: [
              {
                model: OrderItem,
                include: [
                  {
                    model: Menu,
                  },
                ],
              },
            ],
          });
          expect(redis.set).toHaveBeenCalledWith(
            expect.stringMatching(/orders:getOrders:mockUserId/),
            JSON.stringify(mockOrders),
            "EX",
            1800
          );
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.json).toHaveBeenCalledWith(mockOrders);
          expect(redis.expire).toHaveBeenCalledWith(
            expect.stringMatching(/orders:getOrders:mockUserId/),
            1800
          );
          expect(next).not.toHaveBeenCalled();
        });
      
        it("should handle errors and call the next middleware", async () => {
          // Mocked request and response objects
          const req = {
            user: { id: "mockUserId" },
          };
          const res = {
            status: jest.fn(() => res),
            json: jest.fn(),
          };
          const next = jest.fn();
      
          // Mock the redis.get function
          redis.get.mockImplementation((key, callback) => {
            callback(new Error("Redis error"), null);
          });
      
          // Perform the test
          await OrderController.showOrders(req, res, next);
      
          // Assertions
          expect(redis.get).toHaveBeenCalledWith(
            expect.stringMatching(/orders:getOrders:mockUserId/),
            expect.any(Function)
          );
          expect(next).toHaveBeenCalledWith(new Error("Redis error"));
          expect(res.status).not.toHaveBeenCalled();
          expect(res.json).not.toHaveBeenCalled();
        });
      });
      
});
