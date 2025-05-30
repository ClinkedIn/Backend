const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");

const userController = require("../controllers/userController");

router
  .route("/")
  .post(userController.registerUser)
  .delete(protect, userController.deleteUser);

router
  .route("/resend-confirmation-email")
  .get(protect, userController.resendConfirmationEmail);

router.route("/confirm-email").post(protect, userController.confirmEmail);
router.route("/login").post(userController.login);
router.route("/logout").post(protect, userController.logout);
router.route("/forgot-password").post(userController.forgotPassword);
router.patch("/reset-password", userController.resetPassword);

router
  .route("/verify-reset-password-otp")
  .post(userController.verifyResetPasswordOTP);

router.post("/auth/google", userController.googleLogin);
router.patch("/update-password", protect, userController.updatePassword);
router.patch("/update-email", protect, userController.updateEmail);

module.exports = router;
