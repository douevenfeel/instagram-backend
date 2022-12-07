const Router = require('express');
const router = new Router();

const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, postController.createPost);
router.get('/', postController.getPosts);
router.get('/estimated', authMiddleware, postController.getEstimatedPosts);
router.get('/:id', postController.getPost);
router.post('/estimate/:id', authMiddleware, postController.estimate);
router.put('/:id', authMiddleware, postController.updatePost);
router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;
