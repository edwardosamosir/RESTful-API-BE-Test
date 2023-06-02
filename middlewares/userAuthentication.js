const { decodeToken } = require("../helpers/jwtEncoderDecoder");
const { User } = require("../models");

const userAuthentication = async (req, res, next) => {
    try {
        const { access_token } = req.headers;

        if (!access_token) {
            throw { name: "AccessTokenMissing" };
        }

        const payload = decodeToken(access_token);
        const userData = await User.findByPk(payload.id);

        if (!userData) {
            throw { name: "InvalidToken" };
        }

        req.user = {
            id: userData.id,
            role: userData.role,
            email: userData.email   
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = userAuthentication;