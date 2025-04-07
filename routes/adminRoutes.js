const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect} = require('../middlewares/auth');

// Reports monitoring
router.route('/reports')
    .get(protect,  adminController.getAllReports);

router.route('/reports/:reportId')
    .get(protect,  adminController.getReport)
    .patch(protect,  adminController.handleReport)
    .delete(protect,  adminController.deleteReport);

// Job management
router.route('/jobs')
    .get(protect,  adminController.getFlaggedJobs);

router.route('/jobs/:jobId')
    .patch(protect,  adminController.moderateJob)
    .delete(protect,  adminController.removeJob);

// Analytics
router.route('/analytics/overview')
    .get(protect,  adminController.getAnalyticsOverview);

router.route('/analytics/users')
    .get(protect,  adminController.getUserAnalytics);

router.route('/analytics/content')
    .get(protect,  adminController.getContentAnalytics);

module.exports = router;