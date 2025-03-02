const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');


router.route('/')
    .post(companyController.createCompany)
    .get(companyController.getAllCompanies);

router.route('/:companyId')
    .get(companyController.getCompany)
    .put(companyController.updateCompany)
    .delete(companyController.deleteCompany);

// Endpoint to follow/unfollow a company
router.route('/:companyId/follow')
    .post(companyController.followCompany)
    .delete(companyController.unfollowCompany);

// Endpoint to add a visitor to a company
router.route('/:companyId/visit')
    .post(companyController.addVisitor);

module.exports = router;
