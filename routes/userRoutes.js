const express = require('express');
const router = express.Router();
const { verifyToken, isLoggedIn, verifyGoogleToken, mockVerifyToken } = require('../middlewares/auth');


const userController = require('../controllers/userController');

// router.post('/register', userController.registerUser)
<<<<<<< HEAD
router.route('/').post(userController.registerUser);

// router.route('/confirm-email').patch(mockVerifyToken , userController.confirmEmail)
router.route('/confirm-email').patch(userController.confirmEmail);
router.route('/login').post(userController.login);



=======
router.route('/').post(userController.registerUser)
>>>>>>> 2e4c884ebc3902ba26dd3fa1c3e5447b60084487

// router.route('/confirm-email').patch(mockVerifyToken , userController.confirmEmail)
router.route('/confirm-email').patch(userController.confirmEmail)
router.route('/login').post(userController.login)




module.exports = router;
