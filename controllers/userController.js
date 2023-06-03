const { User } = require("../models");
const { compareHash } = require("../helpers/bcryptHasher");
const { encodeToken } = require("../helpers/jwtEncoderDecoder");

class UserController {
    static async loginUser(req, res, next) {
        try {
            // Extracting email and password from the request body using destructuring
            const { email, password } = req.body;

            if (!email) { // Checking if email is not provided
                throw { name: "EmailIsRequired" };
            }
            if (!password) { // Checking if password is not provided
                throw { name: "PasswordIsRequired" };
            }

            // Finding a user record with the provided email
            const user = await User.findOne({ where: { email } });
            if (!user) { // Checking if user record is not found
                throw { name: "WrongEmailOrPassword" }; 
            }

            // Comparing the provided password with the hashed password
            const isPasswordCorrect = compareHash(password, user.password);
            if (!isPasswordCorrect) { // Checking if password comparison is incorrect
                throw { name: "WrongEmailOrPassword" };
            }

            // Generating an encoded token with user's ID as payload
            const encodedToken = encodeToken({ id: user.id });
            const responseBody = { // Creating a response body object
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
            
            const responseBody = { // Creating a response body object
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
}

module.exports = UserController;