const { Post } = require('../models/models');

class PostController {
    async createPost(req, res, next) {
        try {
        } catch (error) {
            next(error);
        }
    }
    async getPosts(req, res, next) {
        try {
            const posts = await Post.findAndCountAll();

            return res.json(posts);
        } catch (error) {
            next(error);
        }
    }

    async getPost(req, res, next) {
        try {
            const { id } = req.params;
            const post = await Post.findOne({ where: { id } });

            return res.json(post);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PostController();
