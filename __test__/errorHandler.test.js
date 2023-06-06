const errorHandler = require('../middlewares/errorHandler');

describe('errorHandler', () => {
    let res;

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    test('should handle SequelizeValidationError', () => {
        const error = {
            name: 'SequelizeValidationError',
            errors: [{ message: 'Validation error message' }],
        };

        errorHandler(error, null, res, null);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Validation error message' });
    });

    test('should handle SequelizeUniqueConstraintError', () => {
        const error = {
            name: 'SequelizeUniqueConstraintError',
            errors: [{ message: 'Unique constraint error message' }],
        };

        errorHandler(error, null, res, null);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unique constraint error message' });
    });

    test('should handle EmailIsRequired', () => {
        const error = {
            name: 'EmailIsRequired',
        };

        errorHandler(error, null, res, null);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Email is Required!' });
    });

    test('should handle PasswordIsRequired', () => {
        const error = {
            name: 'PasswordIsRequired',
        };

        errorHandler(error, null, res, null);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Password is Required!' });
    });

    test('should handle WrongEmailOrPassword', () => {
        const error = {
            name: 'WrongEmailOrPassword',
        };

        errorHandler(error, null, res, null);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid Email or Password' });
    });

    test('should handle AccessTokenMissing', () => {
        const error = {
            name: 'AccessTokenMissing',
        };

        errorHandler(error, null, res, null);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Access required, please sign in first!' });
    });

    test('should handle InvalidAmount', () => {
        const error = {
            name: 'InvalidAmount',
        };

        errorHandler(error, null, res, null);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid amount. Amount must be a positive number.' });
    });

    test('should handle InvalidToken', () => {
        const error = {
            name: 'InvalidToken',
        };

        errorHandler(error, null, res, null);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid Token' });
    });

    test('should handle ProfileNotFound', () => {
        const error = {
            name: 'ProfileNotFound',
        };

        errorHandler(error, null, res, null);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Profile Not Found' });
    });

    test('should handle MenuNotFound', () => {
        const error = {
            name: 'MenuNotFound',
        };

        errorHandler(error, null, res, null);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Menu Not Found' });
    });

    test('should handle ItemNotFound', () => {
        const error = {
            name: 'ItemNotFound',
        };

        errorHandler(error, null, res, null);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Item Not Found' });
    });

    test('should handle CartNotFound', () => {
        const error = {
            name: 'CartNotFound',
        };

        errorHandler(error, null, res, null);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Cart Not Found' });
    });

    test('should handle NotSufficientBalance', () => {
        const error = {
            name: 'NotSufficientBalance',
        };

        errorHandler(error, null, res, null);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Insufficient balance. Payment required!' });
    });

    test('should handle Forbidden', () => {
        const error = {
            name: 'Forbidden',
        };

        errorHandler(error, null, res, null);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden, Admin Authentication required!.' });
    });

    test('should handle unknown error', () => {
        const error = new Error('Some unknown error');

        errorHandler(error, null, res, null);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });
});
