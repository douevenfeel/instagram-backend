const { Op } = require('sequelize');
const { User, Post } = require('../models/models');

class UserController {
    async getUsers(req, res, next) {
        try {
            const { q } = req.query;
            const users = await User.findAll({
                where: { username: { [Op.iLike]: `%${q}%` } },
                order: [['username', 'asc']],
            });
            users.map((user) => delete user.dataValues.password);

            return res.json(users);
        } catch (error) {
            next(error);
        }
    }

    async getUser(req, res, next) {
        try {
            const { username } = req.params;
            const user = await User.findOne({
                where: { username },
                attributes: ['username'],
                include: { model: Post },
                order: [[Post, 'createdAt', 'desc']],
            });

            return res.json(user);
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    async banUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await User.findOne({
                where: { id },
            });
            user.isBanned = !user.isBanned;
            user.save();

            return res.json({ message: `user ${user.isBanned ? 'banned' : 'unbanned'}` });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
