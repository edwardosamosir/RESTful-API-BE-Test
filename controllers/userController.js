const { User, Profile, sequelize } = require("../models");
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

            // Creating a new customer profile
            await Profile.create({
                UserId: newCustomer.id,
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

    static async editProfile(req, res, next) {
        try {
            const userId = req.user.id
            // Extracting firstName, lastName, address from the request body using destructuring
            const { firstName, lastName, address } = req.body

            // Find profile of the user
            const profile = await Profile.findOne({
                where: {
                    UserId: userId
                }
            })

            // Check if the profile exists
            if (!profile) {
                throw { name: "ProfileNotFound" };
            }

            // Check if any values have changed
            if (profile.firstName == firstName && profile.lastName == lastName && profile.address === address) {
                return res.status(204).json({ message: "No changes were made to the profile item" });
            }

            // Update the profile with the provided data
            await profile.update({
                firstName,
                lastName,
                address
            })

            // Fetch the updated profile to include in the response
            const updatedProfile = await Profile.findOne({
                where: {
                    UserId: userId
                }
            });

            // Return the updated profile and a success message
            res.status(200).json({
                profile: updatedProfile,
                message: `Profile is successfully updated`
            })
        } catch (error) {
            // Passing the error to the next middleware functions
            next(error)
        }
    }

    static async addUserBalance(req, res, next) {
        // Begin a transaction
        const t = await sequelize.transaction();
        try {
            const userId = req.user.id
            const { amount } = req.body

            // Validate the amount to add
            if (amount <= 0) {
                throw { name: "InvalidAmount" };
            }

            // Find the user's profile to add balance
            const profile = await Profile.findOne({
                where: { UserId: userId },
                transaction: t,
            });

            // Update the current balance
            profile.currentBalance += Number(amount);

            // Save the changes to the database
            await profile.save({ transaction: t });

            // Commit the transaction
            await t.commit();

            // Return the updated profile or a success message
            return res.status(200).json({ message: 'Balance added successfully' });

        } catch (error) {
            console.log(error)
            // Rollback the transaction in case of an error
            await t.rollback();
            // Passing the error to the next middleware functions
            next(error);
        }
    }
}

module.exports = UserController;