const Router = require('express');
const router = new Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/logout', authController.logout);
router.get('/refresh', authController.refresh);

module.exports = router;
