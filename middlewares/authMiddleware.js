const ApiError = require('../error/ApiError');
const { User } = require('../models/models');
const tokenService = require('../services/tokenService');

module.exports = async function (req, res, next) {
    if (req.method === 'OPTIONS') {
        next();
    }
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return next(ApiError.unauthorizedError());
        }
        const validToken = tokenService.validateRefreshToken(refreshToken);
        const findedToken = await tokenService.findToken(refreshToken);
        if (!validToken || !findedToken) {
            return next(ApiError.unauthorizedError());
        }
        const user = await User.findOne({ where: { id: findedToken.userId } });
        req.user = user;
        next();
    } catch (e) {
        return next(ApiError.unauthorizedError());
    }
};
