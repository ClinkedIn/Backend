const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");

const userController = require("../controllers/userController");

router
  .route("/")
  .post(userController.registerUser)
  .delete(protect, userController.deleteUser);

router
  .route("/confirm-email")
  .get(protect, userController.resendConfirmationEmail);

router
  .route("/confirm-email/:emailVerificationToken")
  .patch(userController.confirmEmail);
router.route("/login").post(userController.login);
router.route("/logout").post(userController.logout);
router.route("/forgot-password").post(userController.forgotPassword);
router
  .patch("/reset-password/:token", userController.resetPassword)
  .get("/reset-password/:token", userController.verifyResetPasswordToken);

router.post("/auth/google", userController.googleLogin);
router.patch("/update-password", protect, userController.updatePassword);
router.patch("/update-email", protect, userController.updateEmail);

module.exports = router;
