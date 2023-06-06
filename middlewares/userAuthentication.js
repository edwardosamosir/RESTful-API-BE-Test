const { decodeToken } = require("../helpers/jwtEncoderDecoder");
const { User } = require("../models");

const userAuthentication = async (req, res, next) => {
    try {
        const { access_token } = req.headers;

        // Check if access token is present
        if (!access_token) {
            throw { name: "AccessTokenMissing" };
        }

        // Decode the access token
        const payload = decodeToken(access_token);
        // Retrieve user data based on the payload
        const userData = await User.findByPk(payload.id);

        // Check if user data exists
        if (!userData) {
            throw { name: "InvalidToken" };
        }

        // Assign user data to req.user
        req.user = {
            id: userData.id,
            role: userData.role,
            email: userData.email   
        }

        // Proceed to the next middleware
        next();
    } catch (error) {
        // Passing any error to the next middleware functions
        next(error);
    }
};

module.exports = userAuthentication;