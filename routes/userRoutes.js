const express = require('express');
const router = express.Router();
const { verifyToken, isLoggedIn, verifyGoogleToken, mockVerifyToken } = require('../middlewares/auth');


const userController = require('../controllers/userController');

// router.post('/register', userController.registerUser)
router.route('/').post(userController.registerUser);

// router.route('/confirm-email').patch(mockVerifyToken , userController.confirmEmail)
router.route('/confirm-email').patch(userController.confirmEmail);
router.route('/login').post(userController.login);




module.exports = router;
