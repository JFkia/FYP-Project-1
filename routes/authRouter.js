const router = require('express').Router();
const userController = require('../controllers/userController');

router.post('/signin', userController.signin);
router.get('/logout', userController.logout);
router.get('/signup', userController.showSignupForm);
router.post('/signup', userController.signup);

module.exports = router;