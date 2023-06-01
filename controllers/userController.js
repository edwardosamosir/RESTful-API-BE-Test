const { User } = require("../models");
const { compareHash } = require("../helpers/bcryptHasher");
const { encodeToken } = require("../helpers/jwtEncoderDecoder");

class UserController {
    static async loginUser(req, res, next) {
        try {
            const { email, password } = req.body;

            if (!email) {
                throw { name: "EmailIsRequired" };
            }
            if (!password) {
                throw { name: "PasswordIsRequired" };
            }

            const user = await User.findOne({ where: { email } });
            if (!user) {
                throw { name: "WrongEmailOrPassword" };
            }

            const isPasswordCorrect = compareHash(password, user.password);
            if (!isPasswordCorrect) {
                throw { name: "WrongEmailOrPassword" };
            }

            const encodedToken = encodeToken({ id: user.id });
            const responseBody = {
                access_token: encodedToken,
                username: user.username,
                email: user.email,
                role: user.role,
                message: `${user.username} is successfully logged in`
            }

            res.status(200).json(responseBody);
        } catch (error) {
            next(error);
        }
    }

    static async registerUser(req, res, next) {
        try {
            const { username, email, password, phoneNumber } = req.body;

            const newCustomer = await User.create({
                username,
                email,
                password,
                role: "Customer",
                phoneNumber
            });

            const responseBody = {
                id: newCustomer.id,
                email: newCustomer.email,
                message: `User with email ${newCustomer.email} and username ${newCustomer.username} is succesfully registered`
            }

            res.status(201).json(responseBody);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;