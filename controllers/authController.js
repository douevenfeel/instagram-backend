const ApiError = require('../error/ApiError');
const { User } = require('../models/models');
const bcrypt = require('bcrypt');
const tokenService = require('../services/tokenService');

class AuthController {
    async signup(req, res, next) {
        try {
            const { username, password } = req.body;
            const candidate = await User.findOne({ where: { username } });
            if (candidate) {
                return next(ApiError.badRequest('user already exists'));
            }
            const hashPassword = await bcrypt.hash(password, 5);
            const user = await User.create({ username, password: hashPassword });
            const tokens = tokenService.generateTokens({
                id: user.id,
                username: user.username,
            });
            await tokenService.saveToken(user.id, tokens.refreshToken);
            res.cookie('refreshToken', tokens.refreshToken, { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true });
            delete user.dataValues.password;

            return res.json({
                ...tokens,
                user,
            });
        } catch (error) {
            next(error);
        }
    }

    async signin(req, res, next) {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ where: { username } });
            if (!user) {
                return next(ApiError.badRequest('wrong username or password'));
            }
            const isPassEquals = await bcrypt.compare(password, user.password);
            if (!isPassEquals) {
                return next(ApiError.badRequest('wrong username or password'));
            }
            const tokens = tokenService.generateTokens({
                id: user.id,
                username: user.username,
                role: user.role,
            });
            await tokenService.saveToken(user.id, tokens.refreshToken);
            res.cookie('refreshToken', tokens.refreshToken, { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true });
            delete user.dataValues.password;

            return res.json({
                ...tokens,
                user,
            });
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const token = tokenService.removeToken(refreshToken);
            res.clearCookie('refreshToken');

            return res.json(token);
        } catch (error) {
            next(error);
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            if (!refreshToken) {
                return next(ApiError.unauthorizedError());
            }
            const validToken = tokenService.validateRefreshToken(refreshToken);
            const findedToken = await tokenService.findToken(refreshToken);
            console.log(!validToken || !findedToken);
            if (!validToken || !findedToken) {
                return next(ApiError.unauthorizedError());
            }
            const user = await User.findOne({ where: { id: validToken.id } });
            const tokens = tokenService.generateTokens({
                id: user.id,
                username: user.username,
                role: user.role,
            });
            await tokenService.saveToken(user.id, tokens.refreshToken);
            res.cookie('refreshToken', tokens.refreshToken, { maxAge: 1000 * 60 * 60, httpOnly: true });
            delete user.dataValues.password;

            return res.json({
                ...tokens,
                user,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
