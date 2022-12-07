const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRoleMiddleware = require('../middlewares/checkRoleMiddleware');

router.get('/', userController.getUsers);
router.get('/:username', userController.getUser);
router.post('/ban/:username', authMiddleware, checkRoleMiddleware('MODERATOR'), userController.banUser);

module.exports = router;
