const request = require("supertest");
const app = require("../app");
const { Profile, sequelize } = require("../models");
const { decodeToken } = require("../helpers/jwtEncoderDecoder");
const redis = require("../config/redis")


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

let access_token;


describe("POST /users", () => {
    describe("/register", () => {
        it("should not have empty username field", async () => {
            const response = await request(app)
                .post("/users/register")
                .send({ email: "edwardosamosir@gmail.com", password: "l154inb4b1$$", phoneNumber: "67645348768" });
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Username is required!");
        });

        it("username should not be empty string", async () => {
            const response = await request(app)
                .post("/users/register")
                .send({ username: "", email: "edwardosamosir997@gmail.com", password: "l154inb4b1$$", phoneNumber: "67645348768" });
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Username is required!");
        });

        it("should not have duplicate username", async () => {
            const response = await request(app)
                .post("/users/register")
                .send({ username: "edwardosamosir", email: "edwardosamosir997@gmail.com", password: "l154inb4b1$$", phoneNumber: "67645348768" });
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Username is already used, please use another username!");
        });

        it("should not have empty email field", async () => {
            const response = await request(app)
                .post("/users/register")
                .send({ username: "edwardosamosir997", password: "l154inb4b1$$", phoneNumber: "67645348768" });
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Email is required!");
        });

        it("email should not be empty string", async () => {
            const response = await request(app)
                .post("/users/register")
                .send({ username: "edwardosamosir997", email: "", password: "l154inb4b1$$", phoneNumber: "67645348768" });
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Email is required!");
        });

        it("should not have an invalid email format", async () => {
            const response = await request(app)
                .post("/users/register")
                .send({ username: "edwardosamosir997", email: "edwardosamosir", password: "l154inb4b1$$", phoneNumber: "67645348768" });
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Email format is not valid!");
        });

        it("should not have duplicate email", async () => {
            const response = await request(app)
                .post("/users/register")
                .send({ username: "edwardosamosir997", email: "edwardosamosir@gmail.com", password: "l154inb4b1$$", phoneNumber: "67645348768" });
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Email is already used, please use another email!");
        });

        it("should not have empty password field", async () => {
            const response = await request(app)
                .post("/users/register")
                .send({ username: "edwardosamosir997", email: "edwardosamosir@gmail.com", phoneNumber: "67645348768" });
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Password is required!");
        });

        it("password should not be empty string", async () => {
            const response = await request(app)
                .post("/users/register")
                .send({ username: "edwardosamosir997", password: "", email: "edwardosamosir@gmail.com", phoneNumber: "67645348768" });
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Password is required!");
        });

        it("password should not be less than 8 characters", async () => {
            const response = await request(app)
                .post("/users/register")
                .send({ username: "edwardosamosir997", password: "sqws", email: "edwardosamosir@gmail.com", phoneNumber: "67645348768" });
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Password length are minimum 8 characters!");
        });

        it("should not have empty phone number field", async () => {
            const response = await request(app)
                .post("/users/register")
                .send({ username: "edwardosamosir997", email: "edwardosamosir@gmail.com", password: "l154inb4b1$$" });
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Phone number is required!");
        });

        it("phone number should not be empty string", async () => {
            const response = await request(app)
                .post("/users/register")
                .send({ username: "edwardosamosir997", email: "edwardosamosir@gmail.com", password: "l154inb4b1$$", phoneNumber: "" });
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Phone number is required!");
        });

        it("success to register", async () => {
            const response = await request(app)
                .post("/users/register")
                .send({ username: "edwardosamosir1997", email: "edwardosamosir997@gmail.com", password: "l154inb4b1$$", phoneNumber: "67645348768" });
            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe("User with email edwardosamosir997@gmail.com and username edwardosamosir1997 is succesfully registered");
        });
    })

    describe("/login", () => {
        it("should not empty email field", async () => {
            const response = await request(app)
                .post("/users/login")
                .send({ password: "l154inb4b1$$" });
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Email is Required!");
        });

        it("should not empty password field", async () => {
            const response = await request(app)
                .post("/users/login")
                .send({ email: "edwardosamosir997@gmail.com" });
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe("Password is Required!");
        });

        it("should not wrong password or email", async () => {
            const response = await request(app)
                .post("/users/login")
                .send({ email: "edwardosamosir997@gmail.com", password: "gkjhsadjkah" });
            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe("Invalid Email or Password");
        });

        it("should success login", async () => {
            const response = await request(app)
                .post("/users/login")
                .send({ email: "edwardosamosir997@gmail.com", password: "l154inb4b1$$" });
            expect(response.statusCode).toBe(200);
            expect(response.body.access_token).toEqual(expect.any(String));
            access_token = response.body.access_token;
        });

        describe("PUT /users", () => {
            describe("/profile", () => {
                it("should return 401 if user is not authenticated", async () => {
                    const response = await request(app).put("/users/profile");
                    expect(response.statusCode).toBe(400);
                    expect(response.body.message).toBe("Access required, please sign in first!");
                });

                it("should update the profile successfully", async () => {
                    const response = await request(app)
                        .put("/users/profile")
                        .set("access_token", access_token)
                        .send({
                            firstName: "John",
                            lastName: "Doe",
                            address: "123 Street",
                        });
                    expect(response.statusCode).toBe(200);
                    expect(response.body.message).toBe("Profile is successfully updated");
                    expect(response.body.profile.firstName).toBe("John");
                    expect(response.body.profile.lastName).toBe("Doe");
                    expect(response.body.profile.address).toBe("123 Street");
                });

            });
        });

        describe("POST /users/add-balance", () => {

            it("should add balance to the user's profile", async () => {
                const amount = 500000;
                const expectedBalance = Number(amount);

                // Decode the access_token to retrieve the userId
                const decodedToken = decodeToken(access_token);
                const userId = decodedToken.id;

                // Make a request to add balance to the user's profile
                const response = await request(app)
                    .post("/users/add-balance")
                    .set("access_token", access_token)
                    .send({ amount });


                expect(response.statusCode).toBe(200);
                expect(response.body.message).toBe("Successfully added balance.");

                // Fetch the updated profile from the database
                const updatedProfile = await Profile.findOne({ where: { UserId: userId } });

                // Fix: Convert the currentBalance values to numbers for proper comparison
                expect(Number(updatedProfile.currentBalance)).toBe(Number(expectedBalance));
            });


            it("should return an error for invalid amount", async () => {
                const invalidAmount = -500000;

                // Make a request with an invalid amount
                const response = await request(app)
                    .post("/users/add-balance")
                    .set("access_token", access_token)
                    .send({ amount: invalidAmount });

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe("Invalid amount. Amount must be a positive number.");
            });

        });

    });
});





