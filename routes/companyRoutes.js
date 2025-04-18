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
    .put(protect, companyController.updateCompany)
    .delete(protect, companyController.deleteCompany);

// Endpoint to follow/unfollow a company
router
    .route('/:companyId/follow')
    .post(protect, companyController.followCompany)
    .delete(protect, companyController.unfollowCompany);

// Endpoint to add a visitor to a company
router.route('/:companyId/visit').post(protect, companyController.addVisitor);

module.exports = router;
