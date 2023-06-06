const { decodeToken } = require('../helpers/jwtEncoderDecoder');
const { User } = require('../models');
const userAuthentication = require('../middlewares/userAuthentication');

jest.mock('../helpers/jwtEncoderDecoder');
jest.mock('../models');

describe('userAuthentication', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {
            headers: {},
        };
        res = {};
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should pass authentication and proceed to next middleware if access token is valid', async () => {
        req.headers.access_token = 'valid-access-token';

        const payload = { id: 1 };
        const userData = { id: 1, role: 'User', email: 'user@example.com' };
        decodeToken.mockReturnValueOnce(payload);
        User.findByPk.mockResolvedValueOnce(userData);

        await userAuthentication(req, res, next);

        expect(decodeToken).toHaveBeenCalledWith('valid-access-token');
        expect(User.findByPk).toHaveBeenCalledWith(1);
        expect(req.user).toEqual({ id: 1, role: 'User', email: 'user@example.com' });
        expect(next).toHaveBeenCalled();
    });

    test('should throw AccessTokenMissing error if access token is not provided', async () => {
        await userAuthentication(req, res, next);

        expect(next).toHaveBeenCalledWith({ name: 'AccessTokenMissing' });
    });

    test('should throw InvalidToken error if user data is not found for the decoded payload', async () => {
        req.headers.access_token = 'valid-access-token';

        decodeToken.mockReturnValueOnce({ id: 1 });
        User.findByPk.mockResolvedValueOnce(null);

        await userAuthentication(req, res, next);

        expect(next).toHaveBeenCalledWith({ name: 'InvalidToken' });
    });

    test('should pass error to next middleware in case of any other error', async () => {
        req.headers.access_token = 'valid-access-token';

        const error = new Error('Some error');
        decodeToken.mockImplementationOnce(() => {
            throw error;
        });

        await userAuthentication(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
