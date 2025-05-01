const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, checkAdmin } = require('../middlewares/auth');

// Reports monitoring
router.route('/reports')
    .get(protect,checkAdmin,  adminController.getAllReports);
    

router.route('/reports/:reportId')

.get(protect, checkAdmin, adminController.getReport)
.patch(protect, checkAdmin, adminController.handleReport)
.delete(protect, checkAdmin, adminController.deleteReport);

// Job management 
router.route('/jobs')
    .get(protect, checkAdmin, adminController.getFlaggedJobs);
    

    router.route('/jobs/flag/:jobId')
    .patch(protect, checkAdmin, adminController.flagJob);
        
router.route('/jobs/:jobId')
    .delete(protect, checkAdmin,  adminController.removeJob);
    
    

// Analytics
router.route('/analytics/overview')
    .get(protect,checkAdmin,  adminController.getAnalyticsOverview);
    



module.exports = router;