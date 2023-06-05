const { User } = require("../models");
const { compareHash } = require("../helpers/bcryptHasher");
const { encodeToken } = require("../helpers/jwtEncoderDecoder");

class UserController {
    static async loginUser(req, res, next) {
        try {
            // Extracting email and password from the request body using destructuring
            const { email, password } = req.body;

            // Checking if email is not provided
            if (!email) {
                throw { name: "EmailIsRequired" };
            }

            // Checking if password is not provided
            if (!password) { 
                throw { name: "PasswordIsRequired" };
            }

            // Finding a user record with the provided email
            const user = await User.findOne({ where: { email } });
            if (!user) { // Checking if user record is not found
                throw { name: "WrongEmailOrPassword" }; 
            }

            // Comparing the provided password with the hashed password
            const isPasswordCorrect = compareHash(password, user.password);

            // Checking if password comparison is incorrect
            if (!isPasswordCorrect) {
                throw { name: "WrongEmailOrPassword" };
            }

            // Generating an encoded token with user's ID as payload
            const encodedToken = encodeToken({ id: user.id });

            // Creating a response body object
            const responseBody = { 
                access_token: encodedToken,
                username: user.username,
                email: user.email,
                role: user.role,
                message: `${user.username} is successfully logged in`
            }

            // Sending a JSON response with the response body and status code 200
            res.status(200).json(responseBody);
        } catch (error) {
            // Passing the error to the next middleware function
            next(error);
        }
    }

    static async registerUser(req, res, next) {
        try {
            // Extracting username, email, password, and phoneNumber from the request body using destructuring
            const { username, email, password, phoneNumber } = req.body;

            // Creating a new user record with provided data
            const newCustomer = await User.create({
                username,
                email,
                password,
                role: "Customer",
                phoneNumber
            });
            
            // Creating a response body object
            const responseBody = { 
                id: newCustomer.id,
                email: newCustomer.email,
                message: `User with email ${newCustomer.email} and username ${newCustomer.username} is succesfully registered`
            }

            // Sending a JSON response with the response body and status code 201
            res.status(201).json(responseBody);
        } catch (error) {
            // Passing the error to the next middleware functions
            next(error);
        }
    }

    static async addUserBalance(req, res, next) {
        try {
            console.log("Test EndPoint users/add-balance")
        } catch (error) {
            
        }
    }
}

module.exports = UserController;