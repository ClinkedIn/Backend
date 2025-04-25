const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const { protect, mockVerifyToken } = require('../middlewares/auth');
router.route('/create-checkout-session')
    .post(protect, stripeController.createCheckoutSession);
router.route('/cancel-subscription')
    .delete(protect, stripeController.cancelSubscription);
module.exports = router;