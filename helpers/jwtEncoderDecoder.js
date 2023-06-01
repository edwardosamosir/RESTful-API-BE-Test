const jwt = require('jsonwebtoken')

const jwtSecretKey = process.env.SECRET_JWT_KEY

const encodeToken = (payload) => {
    return jwt.sign(payload, jwtSecretKey)
}

const decodeToken = (token) => {
    return jwt.verify(token, jwtSecretKey)
}

module.exports = {encodeToken, decodeToken}