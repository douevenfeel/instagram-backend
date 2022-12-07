const { Post, Like, User } = require('../models/models');
const uuid = require('uuid');
const path = require('path');

class PostController {
    async createPost(req, res, next) {
        try {
            const user = req.user;
            let { description } = req.body;
            const { photo } = req.files;
            description = !!description ? description : '';
            let fileName = uuid.v4() + '.png';
            console.log(photo);
            photo.mv(path.resolve(__dirname, '..', 'static', fileName));
            await Post.create({ description, userId: user.id, photo: fileName });

            return res.json({ message: 'post created' });
        } catch (error) {
            next(error);
        }
    }
    async getPosts(req, res, next) {
        try {
            const { order } = req.query;
            const posts = await Post.findAll({
                include: [{ model: Like }, { model: User, attributes: ['id', 'username'] }],
                order: [order],
            });

            return res.json(posts);
        } catch (error) {
            console.log(error);
        }
    }

    async getPost(req, res, next) {
        try {
            const { id } = req.params;
            const post = await Post.findOne({
                where: { id },
                include: [{ model: Like, attributes: ['userId'] }, { model: User }],
            });

            return res.json(post);
        } catch (error) {
            next(error);
        }
    }

    async getEstimatedPosts(req, res, next) {
        try {
            const { id } = req.user;
            const posts = await Like.findAll({
                where: { userId: id },
                include: [
                    {
                        model: Post,
                        attributes: ['id', 'photo', 'description'],
                        include: { model: User, attributes: ['isBanned'] },
                    },
                ],
                order: [['createdAt', 'desc']],
            });

            return res.json(posts);
        } catch (error) {
            next(error);
        }
    }

    async estimate(req, res, next) {
        try {
            const user = req.user;
            const { id } = req.params;
            const candidate = await Like.findOne({ where: { postId: id, userId: user.id } });
            const post = await Post.findOne({ where: { id } });
            if (candidate) {
                candidate.destroy();
                post.likesCount = post.likesCount - 1;
                post.save();

                return res.json('dislike');
            }
            await Like.create({ postId: id, userId: user.id });
            post.likesCount = post.likesCount + 1;
            post.save();

            return res.json('like');
        } catch (error) {
            next(error);
        }
    }

    async updatePost(req, res, next) {
        try {
            const user = req.user;
            const { id } = req.params;
            let { description } = req.body;
            description = !!description ? description : '';
            const post = await Post.findOne({ where: { id, userId: user.id } });
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
            const user = req.user;
            const { id } = req.params;
            let candidate;
            if (user.role === 'MODERATOR') {
                candidate = await Post.findOne({ where: { id } });
                console.log(candidate, 'moder');
            } else {
                candidate = await Post.findOne({ where: { id, userId: user.id } });
                console.log(candidate, 'nemoder');
            }
            if (candidate) {
                const likes = await Like.findAll({ where: { postId: id } });
                likes.forEach((like) => like.destroy());
                candidate.destroy();

                return res.json({ message: 'post deleted' });
            }
            console.log(false);
            return res.json({ message: 'post doesnt exist' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PostController();
