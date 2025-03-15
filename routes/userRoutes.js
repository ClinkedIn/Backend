const express = require("express");
const router = express.Router();
const {
  isLoggedIn,
  verifyGoogleToken,
  mockVerifyToken,
} = require("../middlewares/auth");

const userController = require("../controllers/userController");

// router.post('/register', userController.registerUser)
router
  .route("/")
  .post(userController.registerUser)
  .delete(isLoggedIn, userController.deleteUser);

// router.route('/confirm-email').patch(mockVerifyToken , userController.confirmEmail)
router.route("/confirm-email").patch(userController.confirmEmail);
router.route("/login").post(userController.login);
router.route("/forgot-password").post(userController.forgorPassword);
router.patch("/reset-password/:token", userController.resetPassword);
router.patch("/update-password", isLoggedIn, userController.updatePassword);
module.exports = router;
