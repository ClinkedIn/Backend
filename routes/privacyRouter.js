const { protect, mockVerifyToken } = require('../middlewares/auth');
const express = require('express')
const router = express.Router();
const privacyController = require('../controllers/privacyController');

    // tested
router.route('/block-user/:userId')
    .patch(protect, privacyController.blockUser);

    // tested
router.route('/unblock-user/:userId')
    .patch(protect, privacyController.unblockUser);

    // tested
router.route('/report-user/:userId')
    .post(protect, privacyController.reportUser);

router.route('/report-post/:postId')
    .post(protect, privacyController.reportPost);

    // tested
router.route('/blocked-users')
    .get(protect, privacyController.getBlockedUsers);

    // tested
router.route('/reported-users')
    .get(protect, privacyController.getRepotedUsers);

    // tested
router.route('/get-report/:reportId')
    .get(protect, privacyController.getReportById);


router.route('/connection-request')
    .patch(protect, privacyController.controlConnectionRequest);


module.exports = router;