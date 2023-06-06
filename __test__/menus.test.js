const request = require("supertest");
const app = require("../app");
const MenuController = require('../controllers/menuController');
const { Menu, Sequelize, sequelize } = require('../models');
const { Op } = Sequelize;
const redis = require('../config/redis');
const adminAuthentication = require('../middlewares/adminAuthentication');

jest.mock('../config/redis');
jest.mock('../models');

describe('MenuController', () => {
    let access_token;
    beforeAll(async () => {
        await sequelize.queryInterface.bulkInsert(
            "Users",
            require("../data.json").users.map((el) => {
                el.createdAt = el.updatedAt = new Date();
                return el;
            })
        );

        await sequelize.queryInterface.bulkInsert(
            "Profiles",
            require("../data.json").profiles.map((el) => {
                el.createdAt = el.updatedAt = new Date();
                return el;
            }),
            {}
        );

        await sequelize.queryInterface.bulkInsert(
            "Menus",
            require("../data.json").menus.map((el) => {
                el.createdAt = el.updatedAt = new Date();
                return el;
            }),
            {}
        );

        await sequelize.queryInterface.bulkInsert(
            "Carts",
            require("../data.json").carts.map((el) => {
                el.createdAt = el.updatedAt = new Date();
                return el;
            })
        );

        await sequelize.queryInterface.bulkInsert(
            "CartItems",
            require("../data.json").cartItems.map((el) => {
                el.createdAt = el.updatedAt = new Date();
                return el;
            })
        );

        await sequelize.queryInterface.bulkInsert(
            "Orders",
            require("../data.json").orders.map((el) => {
                el.createdAt = el.updatedAt = new Date();
                return el;
            })
        );

        await sequelize.queryInterface.bulkInsert(
            "OrderItems",
            require("../data.json").orderItems.map((el) => {
                el.createdAt = el.updatedAt = new Date();
                return el;
            })
        );

        const authResponse = await request(app)
            .post('/users/login')
            .send({
                username: 'admin@admin.com',
                password: 'admin123',
            });

        access_token = authResponse.body.access_token;
    });

    afterAll(async () => {
        await sequelize.queryInterface.bulkDelete("Users", null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });

        await sequelize.queryInterface.bulkDelete("Profiles", null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });

        await sequelize.queryInterface.bulkDelete("Menus", null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });

        await sequelize.queryInterface.bulkDelete("Carts", null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });

        await sequelize.queryInterface.bulkDelete("CartItems", null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });

        await sequelize.queryInterface.bulkDelete("Orders", null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });

        await sequelize.queryInterface.bulkDelete("OrderItems", null, {
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });

        await redis.quit();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });



    describe('showAllMenus', () => {
        it('should retrieve all menus with default pagination', async () => {
            // Mocked request, response, and next function
            const req = { query: {} };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            // Mock the Menu.findAndCountAll method
            const menus = {
                count: 5,
                rows: [
                    { id: 1, name: 'Menu 1', price: 10 },
                    { id: 2, name: 'Menu 2', price: 15 },
                    { id: 3, name: 'Menu 3', price: 20 },
                    { id: 4, name: 'Menu 4', price: 12 },
                    { id: 5, name: 'Menu 5', price: 18 },
                ],
            };
            Menu.findAndCountAll = jest.fn().mockResolvedValue(menus);

            // Call the showAllMenus method
            await MenuController.showAllMenus(req, res, next);

            // Assertions
            expect(Menu.findAndCountAll).toHaveBeenCalledWith({
                limit: 5,
                offset: 0,
                order: undefined,
                where: undefined,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                menus: menus.rows,
                currentPage: 1,
                pageSize: 5,
                totalCount: 5,
                totalPages: 1,
            });
            expect(next).not.toHaveBeenCalled();
        });


        it('should retrieve all menus with custom pagination and sorting', async () => {
            const req = {
                query: {
                    maxPrice: 20,
                    sort: '-name',
                    page: {
                        size: 3,
                        number: 2,
                    },
                },
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            const menus = {
                count: 6,
                rows: [
                    { id: 4, name: 'Menu 4', price: 12 },
                    { id: 2, name: 'Menu 2', price: 15 },
                    { id: 5, name: 'Menu 5', price: 18 },
                ],
            };
            Menu.findAndCountAll = jest.fn().mockResolvedValue(menus);

            await MenuController.showAllMenus(req, res, next);

            expect(Menu.findAndCountAll).toHaveBeenCalledWith({
                where: {
                    price: {
                        [Op.lte]: 20,
                    },
                },
                limit: 3,
                offset: 3,
                order: [['name', 'DESC']],
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                menus: menus.rows,
                currentPage: 2,
                pageSize: 3,
                totalCount: 6,
                totalPages: 2,
                previousPage: 1,
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should retrieve menus from cache if available', async () => {
            const req = { query: {} };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            const cachedData = {
                menus: [
                    { id: 1, name: 'Menu 1', price: 10 },
                    { id: 2, name: 'Menu 2', price: 15 },
                ],
                currentPage: 1,
                pageSize: 2,
                totalCount: 2,
                totalPages: 1,
            };
            redis.get = jest.fn().mockResolvedValue(JSON.stringify(cachedData));

            await MenuController.showAllMenus(req, res, next);

            expect(Menu.findAndCountAll).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(cachedData);
            expect(next).not.toHaveBeenCalled();
        });


    })

    describe('showMenuById', () => {
        it('should retrieve a menu by its id', async () => {
            // Mocked request, response, and next function
            const req = { params: { id: 1 } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            // Mock the Menu.findOne method
            const menu = { id: 1, name: 'Menu 1', price: 10 };
            Menu.findOne = jest.fn().mockResolvedValue(menu);

            // Call the showMenuById method
            await MenuController.showMenuById(req, res, next);

            // Assertions
            expect(Menu.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(menu);
            expect(next).not.toHaveBeenCalled();
        });

        it('should handle menu not found error', async () => {
            // Mocked request, response, and next function
            const req = { params: { id: 1 } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            // Mock the Menu.findOne method to return null (menu not found)
            Menu.findOne = jest.fn().mockResolvedValue(null);

            // Call the showMenuById method
            await MenuController.showMenuById(req, res, next);

            // Assertions
            expect(Menu.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith({ name: 'MenuNotFound' });
        });

        it('should handle errors and pass them to the next middleware', async () => {
            // Mocked request, response, and next function
            const req = { params: { id: 1 } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            // Mock the Menu.findOne method to throw an error
            const error = new Error('Database error');
            Menu.findOne = jest.fn().mockRejectedValue(error);

            // Call the showMenuById method
            await MenuController.showMenuById(req, res, next);

            // Assertions
            expect(Menu.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('createMenu', () => {
        it('should create a new menu item and return the created menu item', async () => {
            // Mocked request, response, and next function
            const req = {
                body: {
                    name: 'New Menu',
                    price: 25,
                    imageUrl: 'https://example.com/menu.jpg',
                },
                headers: { access_token: access_token }, // Add the access_token to the request headers
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            // Mock the Menu.create method
            const createdMenu = { id: 1, name: 'New Menu', price: 25, imageUrl: 'https://example.com/menu.jpg' };
            Menu.create = jest.fn().mockResolvedValue(createdMenu);

            // Mock the redis.flushall method
            redis.flushall = jest.fn().mockResolvedValue();

            // Call the adminAuthentication middleware directly
            await adminAuthentication(req, res, next);

            // Assertions for adminAuthentication middleware
            expect(next).toHaveBeenCalledTimes(1); // Check if next() has been called

            // Reset the next mock
            next.mockReset();

            // Call the createMenu method
            await MenuController.createMenu(req, res, next);

            // Assertions
            expect(Menu.create).toHaveBeenCalledWith({
                name: 'New Menu',
                price: 25,
                imageUrl: 'https://example.com/menu.jpg',
            });
            expect(redis.flushall).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                createdMenu,
                message: `Succesfully Added ${createdMenu.name} Menu!`,
            });
            expect(next).not.toHaveBeenCalled(); // Check if next() is not called during createMenu

            // Restore the original implementation of adminAuthentication if needed
            // mockAdminAuthentication.mockRestore();
        });

        it('should return an error if admin authentication fails', async () => {
            // Mocked request, response, and next function
            const req = {
                body: {
                    name: 'New Menu',
                    price: 25,
                    imageUrl: 'https://example.com/menu.jpg',
                },
                headers: { access_token: 'invalid_token' }, // Invalid access_token
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            // Call the adminAuthentication middleware directly
            await adminAuthentication(req, res, next);

            // Assertions for adminAuthentication middleware
            expect(next).toHaveBeenCalledWith(expect.any(Error)); // Check if the error is an instance of Error
            expect(Menu.create).not.toHaveBeenCalled(); // Menu.create should not be called
            expect(redis.flushall).not.toHaveBeenCalled(); // redis.flushall should not be called
            expect(res.status).not.toHaveBeenCalled(); // res.status should not be called
            expect(res.json).not.toHaveBeenCalled(); // res.json should not be called
        });

    });

    describe('deleteMenuById', () => {
        it('should delete a menu item by its id', async () => {
            // Mocked request, response, and next function
            const req = { params: { id: 1 }, headers: { access_token } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            // Mock the Menu.findByPk and Menu.destroy methods
            const menu = { id: 1, name: 'Menu 1' };
            Menu.findByPk = jest.fn().mockResolvedValue(menu);
            Menu.destroy = jest.fn();

            // Mock the redis.flushall method
            redis.flushall = jest.fn().mockResolvedValue();

            // Call the adminAuthentication middleware directly
            await adminAuthentication(req, res, next);

            // Assertions for adminAuthentication middleware
            expect(next).toHaveBeenCalledTimes(1); // Check if next() has been called

            // Reset the next mock
            next.mockReset();

            // Call the deleteMenuById method
            await MenuController.deleteMenuById(req, res, next);

            // Assertions
            expect(Menu.findByPk).toHaveBeenCalledWith(1);
            expect(Menu.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(redis.flushall).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: `Successfully Removed ${menu.name} Menu.` });
            expect(next).not.toHaveBeenCalled(); // Check if next() is not called during deleteMenuById
        });

        it('should handle menu not found error', async () => {
            // Mocked request, response, and next function
            const req = { params: { id: 1 }, headers: { access_token } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            // Mock the Menu.findByPk method to return null (menu not found)
            Menu.findByPk = jest.fn().mockResolvedValue(null);

            // Call the adminAuthentication middleware directly
            await adminAuthentication(req, res, next);

            // Assertions for adminAuthentication middleware
            expect(next).toHaveBeenCalledTimes(1); // Check if next() has been called

            // Reset the next mock
            next.mockReset();

            // Call the deleteMenuById method
            await MenuController.deleteMenuById(req, res, next);

            // Assertions
            expect(Menu.findByPk).toHaveBeenCalledWith(1);
            expect(Menu.destroy).not.toHaveBeenCalled();
            expect(redis.flushall).not.toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith({ name: 'MenuNotFound' });
        });

        it('should return an error if admin authentication fails', async () => {
            // Mocked request, response, and next function
            const req = { params: { id: 1 }, headers: { access_token: 'invalid_token' } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            // Call the adminAuthentication middleware directly
            await adminAuthentication(req, res, next);

            // Assertions for adminAuthentication middleware
            expect(next).toHaveBeenCalledWith(expect.any(Error)); // Check if the error is an instance of Error
            expect(Menu.findByPk).not.toHaveBeenCalled(); // Menu.findByPk should not be called
            expect(Menu.destroy).not.toHaveBeenCalled(); // Menu.destroy should not be called
            expect(redis.flushall).not.toHaveBeenCalled(); // redis.flushall should not be called
            expect(res.status).not.toHaveBeenCalled(); // res.status should not be called
            expect(res.json).not.toHaveBeenCalled(); // res.json should not be called
        });

    });

    describe('updateMenuById', () => {
        it('should update a menu by ID', async () => {
            const menuId = 1;
            const updatedMenuData = {
              name: 'Updated Menu',
              price: 25,
              imageUrl: 'https://example.com/menu.jpg',
            };
            const req = {
              params: {
                id: menuId,
              },
              body: updatedMenuData,
            };
            const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
            };
            const next = jest.fn();
      
            // Mock the Menu.findByPk and Menu.prototype.update methods
            const foundMenu = {
              name: 'Old Menu',
              price: 20,
              imageUrl: 'https://example.com/old-menu.jpg',
              update: jest.fn().mockResolvedValue(updatedMenuData),
            };
            Menu.findByPk = jest.fn().mockResolvedValue(foundMenu);
      
            await MenuController.updateMenuById(req, res, next);
      
            expect(Menu.findByPk).toHaveBeenCalledWith(menuId);
            expect(foundMenu.update).toHaveBeenCalledWith(updatedMenuData);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
              menu: foundMenu,
              message: `${foundMenu.name} menu is successfully updated`,
            });
            expect(next).not.toHaveBeenCalled();
          });
    });

});
