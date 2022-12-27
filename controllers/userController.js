const { Op } = require('sequelize');
const { User, Post } = require('../models/models');

class UserController {
    async getUsers(req, res, next) {
        try {
            let { q } = req.query;
            let users;
            if (q) {
                users = await User.findAll({
                    attributes: { exclude: ['password'] },
                    where: { username: { [Op.iLike]: `%${q}%` }, isBanned: false },
                    order: [['username', 'asc']],
                });
            } else {
                users = await User.findAll({
                    attributes: { exclude: ['password'] },
                    order: [['id', 'desc']],
                });
            }

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
                attributes: { exclude: ['password'] },
                include: { model: Post },
                order: [[Post, 'createdAt', 'desc']],
            });
            let likesCount = 0;
            user.dataValues.posts.map((post) => (likesCount += post.dataValues.likesCount));

            return res.json({ user, likesCount });
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

    async banUser(req, res, next) {
        try {
            const moderator = req.user;
            const { username } = req.params;
            const user = await User.findOne({
                where: { username },
            });
            if (moderator.username !== username) {
                user.isBanned = !user.isBanned;
                user.save();
                return res.json({ message: `user ${user.isBanned ? 'banned' : 'unbanned'}` });
            }

            return res.json({ message: 'error' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
