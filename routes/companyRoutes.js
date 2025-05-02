const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/multer');

router
    .route('/')
    .post(protect, upload.single('file'), companyController.createCompany)
    .get(protect, companyController.getAllCompanies);

router
    .route('/:companyId')
    .get(protect, companyController.getCompany)
    .patch(protect, upload.single('file'), companyController.updateCompany)
    .delete(protect, companyController.deleteCompany);

// Endpoint to follow/unfollow a company
router
    .route('/:companyId/follow')
    .post(protect, companyController.followCompany)
    .delete(protect, companyController.unfollowCompany)
    .get(protect, companyController.getFollowers);

router
    .route('/:companyId/post')
    .get(protect, companyController.getCompanyPosts)
    .post(protect, upload.array('files'), companyController.createPost);

router
    .route('/:companyId/admin')
    .get(protect, companyController.getAdmins)
    .post(protect, companyController.addAdmin)
    .delete(protect, companyController.removeAdmin);

router
    .route('/:companyId/analytics')
    .get(protect, companyController.getCompanyAnalytics);

module.exports = router;
