const express = require("express");
const router = express.Router();
const {
  isLoggedIn,
  protect,
  verifyGoogleToken,
  mockVerifyToken,
} = require("../middlewares/auth");

const userController = require("../controllers/userController");

// router.post('/register', userController.registerUser)
router
  .route("/")
  .post(userController.registerUser)
  .delete(protect, userController.deleteUser);

// router.route('/confirm-email').patch(mockVerifyToken , userController.confirmEmail)
router
  .route("/confirm-email/:emailVerificationToken")
  .get(userController.confirmEmail);
router.route("/login").post(userController.login);
router.route("/forgot-password").post(userController.forgotPassword);
router
  .patch("/reset-password/:token", userController.resetPassword)
  .get("/reset-password/:token", userController.verifyResetPasswordToken);

router.post("/auth/google", userController.googleLogin);
router.patch("/update-password", protect, userController.updatePassword);
router.patch("/update-email", protect, userController.updateEmail);
router.patch("/update-name", protect, userController.updateName);

module.exports = router;
