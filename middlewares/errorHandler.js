const errorHandler = (error, req, res, next) => {
    let status = 500;
    let message = "Internal Server Error";

    switch (error.name) {
        case "SequelizeValidationError":
        case "SequelizeUniqueConstraintError":
            status = 400;
            message = error.errors[0].message;
            break;
        case "EmailIsRequired":
            status = 400;
            message = "Email is Required!";
            break;
        case "PasswordIsRequired":
            status = 400;
            message = "Password is Required!";
            break;
        case "WrongEmailOrPassword":
            status = 401;
            message = "Invalid Email or Password";
            break;
        case "AccessTokenMissing":
            status = 400;
            message = "Access required, please sign in first!";
            break;
        case "InvalidToken":
        case "JsonWebTokenError":
            status = 401;
            message = "Invalid Token";
            break;
        case "MenuNotFound":
            status = 404;
            message = "Menu Not Found";
            break;
        case "ItemNotFound":
            status = 404;
            message = "Item Not Found";
            break;
        case "CartNotFound":
            status = 404;
            message = "Cart Not Found";
            break;
        case "NotSufficientBalance":
            status = 403;
            message = "Insufficient balance. Payment required!";
            break;
    }

    res.status(status).json({ message });
};

module.exports = errorHandler;
