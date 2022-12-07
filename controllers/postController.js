const { Post, Like, User } = require('../models/models');
const uuid = require('uuid');
const path = require('path');

class PostController {
    async createPost(req, res, next) {
        try {
            const userId = req.userId;
            let { description } = req.body;
            const { photo } = req.files;
            description = !!description ? description : '';
            let fileName = uuid.v4() + '.png';
            console.log(photo);
            photo.mv(path.resolve(__dirname, '..', 'static', fileName));
            await Post.create({ description, userId, photo: fileName });

            return res.json({ message: 'post created' });
        } catch (error) {
            next(error);
        }
    }
    async getPosts(req, res, next) {
        try {
            const posts = await Post.findAndCountAll({
                include: [{ model: Like }, { model: User, attributes: ['username'] }],
                order: [['createdAt', 'desc']],
            });

            return res.json(posts);
        } catch (error) {
            next(error);
        }
    }

    async getPost(req, res, next) {
        try {
            const { id } = req.params;
            const post = await Post.findOne({
                where: { id },
                include: [
                    { model: Like, attributes: ['userId'] },
                    { model: User, attributes: ['username'] },
                ],
            });

            return res.json(post);
        } catch (error) {
            next(error);
        }
    }

    async getEstimatedPosts(req, res, next) {
        try {
            const userId = req.userId;
            const user = await User.findOne({ where: { id: userId } });
            const posts = await Like.findAll({
                where: { userId },
                include: { model: Post, attributes: ['id', 'photo', 'description'] },
                order: [['createdAt', 'desc']],
            });

            return res.json({ username: user.dataValues.username, posts });
        } catch (error) {
            next(error);
        }
    }

    async estimate(req, res, next) {
        try {
            const userId = req.userId;
            const { id } = req.params;
            const candidate = await Like.findOne({ where: { postId: id, userId } });
            if (candidate) {
                candidate.destroy();

                return res.json('dislike');
            }
            await Like.create({ postId: id, userId });

            return res.json('like');
        } catch (error) {
            next(error);
        }
    }

    async updatePost(req, res, next) {
        try {
            const userId = req.userId;
            const { id } = req.params;
            let { description } = req.body;
            console.log(description);
            description = !!description ? description : '';
            const post = await Post.findOne({ where: { id, userId } });
            if (post) {
                post.description = description;
                post.save();
                return res.json({ message: 'post updated' });
            }
            return res.json({ message: 'post doesnt exist' });
        } catch (error) {
            next(error);
        }
    }

    async deletePost(req, res, next) {
        try {
            const userId = req.userId;
            const { id } = req.params;
            const candidate = await Post.findOne({ where: { id, userId } });
            console.log(candidate);
            if (candidate) {
                const likes = await Like.findAll({ where: { postId: id } });
                likes.forEach((like) => like.destroy());
                await Post.destroy({ where: { id, userId } });

                return res.json({ message: 'post deleted' });
            }
            return res.json({ message: 'post doesnt exist' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PostController();
