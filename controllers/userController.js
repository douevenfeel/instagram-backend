const { Op } = require('sequelize');
const { User } = require('../models/models');

class UserController {
    async getUsers(req, res, next) {
        try {
            const { q } = req.query;
            const users = await User.findAll({ where: { username: { [Op.iLike]: `%${q}%` } } });
            users.map((user) => delete user.dataValues.password);

            return res.json(users);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
