const { Menu, Sequelize } = require("../models");
const { Op } = Sequelize;
const redis = require("../config/redis")

class MenuController {
    static async showAllMenus(req, res, next) {
        // Retrieve query parameters
        const { maxPrice, sort, page } = req.query;
        // Prepare the query options
        const queryOptions = {};
        let limit;
        let offset;

        // Filter by maximum price if provided
        if (maxPrice) {
            queryOptions.where = {
                price: {
                    [Op.lte]: maxPrice
                }
            };
        }

        // Handle sorting parameter
        if (sort !== '' && typeof sort !== 'undefined') {
            let query;
            if (sort.charAt(0) !== '-') {
                // Sort in ascending order
                query = [[sort, 'ASC']];
            } else {
                // Sort in descending order using negative symbol
                query = [[sort.replace('-', ''), 'DESC']];
            };

            queryOptions.order = query;
        }

        // Handle pagination parameters
        if (page !== '' && typeof page !== 'undefined') {
            if (page.size !== '' && typeof page.size !== 'undefined') {
                limit = page.size;
                queryOptions.limit = limit;
            };

            if (page.number !== '' && typeof page.number !== 'undefined') {
                offset = page.number * limit - limit;
                queryOptions.offset = offset;
            };
        } else {
            // Set default pagination values
            limit = 5;
            offset = 0;
            queryOptions.limit = limit;
            queryOptions.offset = offset;
        }

        try {
            // Generate the cache key based on the request query parameters 
            const cacheKey = `menus:getMenus:${JSON.stringify(req.query)}`;

            // retrieve the cached data
            const menusCache = await redis.get(cacheKey);

            // If cached data exists, parse it and send it as the response
            if (menusCache) {
                const responseBody = JSON.parse(menusCache)
                res.status(200).json(responseBody)
            } else {
                // Retrieve menus based on the query parameters
                const menus = await Menu.findAndCountAll(queryOptions);
                if (menus) {
                    const totalCount = menus.count;
                    const currentPage = page && page.number ? parseInt(page.number) : 1;
                    const pageSize = Number(limit) || 5;
                    const totalPages = Math.ceil(totalCount / pageSize);

                    // Prepare the response object
                    const responseBody = {
                        menus: menus.rows,
                        currentPage,
                        pageSize,
                        totalCount,
                        totalPages,
                    };

                    // Set next and previous page numbers if applicable
                    if (currentPage < totalPages) {
                        responseBody.nextPage = currentPage + 1;
                    };

                    if (currentPage > 1) {
                        responseBody.previousPage = currentPage - 1;
                    };

                    // Store the response body in the redis caching using the cache key
                    await redis.set(cacheKey, JSON.stringify(responseBody));

                    // Expire the cache after a certain time (e.g., half an hour)
                    await redis.expire(cacheKey, 1800);

                    // Sending a JSON response with the response body and status code 200
                    res.status(200).json(responseBody);
                }
            }

        } catch (error) {
            console.log(error);
            // Passing the error to the next middleware functions
            next(error);
        }
    }

    static async showMenuById(req, res, next) {
        try {
            const { id } = req.params;

            // Find a menu by its id 
            const menu = await Menu.findOne({
                where: {
                    id
                }
            });

            // Validate the existence of found menu
            if (!menu) {
                throw { name: "MenuNotFound" };
            }

            // Sending a JSON response with the response and status code 200
            res.status(200).json(menu);
        } catch (error) {
            // Passing the error to the next middleware functions
            next(error);
        }
    }

    static async createMenu(req, res, next) {
        const { name, price, imageUrl } = req.body;

        try {
            // Create a new menu item using the provided data
            const createdMenu = await Menu.create({
                name,
                price,
                imageUrl
            });
             
            // Caching Invalidation so the latest changes can be retrieved
            await redis.flushall();

            // Send a response with the created menu item and success message
            res.status(201).json(
                {
                    createdMenu,
                    message: `Succesfully Added ${createdMenu.name} Menu!`
                }
            );
            
        } catch (error) {
            // Passing the error to the next middleware functions
            next(error);
        }
    }

    static async deleteMenuById(req, res, next) {
        try {
            const { id } = req.params;
            // Find the menu item by its id
            const menu = await Menu.findByPk(id);

            // Check if the menu item exists
            if (!menu) {
                throw { name: "MenuNotFound" };
            }

            // Delete the menu item from the database
            await Menu.destroy({
                where: { id }
            });

            // Caching Invalidation so the latest changes can be retrieved
            await redis.flushall();

            // Send a response with a success message
            res.status(200).json({
                message: `Successfully Removed ${menu.name} Menu.`
            });

        } catch (error) {
            // Passing the error to the next middleware functions
            next(error);
        }
    }

    static async updateMenuById(req, res, next) {
        try {
            const { id } = req.params
            const { name, price, imageUrl } = req.body

            // Find the menu item by its id
            const menu = await Menu.findByPk(id)

            // Check if the menu item exists
            if (!menu) {
                throw { name: "MenuNotFound" };
            }

            // Check if any values have changed
            if (menu.name == name && menu.price == price && menu.imageUrl === imageUrl) {
                return res.status(204).json({ message: "No changes were made to the menu item" });
            }

            // Update the menu item with the provided data
            await menu.update({
                name,
                price,
                imageUrl,
            })

            // Fetch the updated menu item to include in the response
            const updatedMenu = await Menu.findByPk(id);

            // Caching Invalidation so the latest changes can be retrieved
            await redis.flushall();

            res.status(200).json({
                menu: updatedMenu,
                message: `${menu.name} menu is successfully updated`
            })
        } catch (error) {
            // Passing the error to the next middleware functions
            next(error)
        }
    }

}

module.exports = MenuController;