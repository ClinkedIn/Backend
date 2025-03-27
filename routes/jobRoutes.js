// define end ponints , each endpoint what http requests ✅
// jobController functions
// job modeljs ok ✅

// swagger docs  make
// base alll of  schema
// request body
// tags
// endpoints  /impressions/{id}:
// security: * - BearerAuth: [];
const { protect, mockVerifyToken } = require('../middlewares/auth');
const express = require('express')
const router = express.Router();
const jobController = require('../controllers/jobController');

router.route('/')
    .post(jobController.createJob)
    .get(jobController.getAllJobs);

router.route('/:jobId')
    .get(jobController.getJob)
    .put(jobController.updateJob)
    .delete(jobController.deleteJob);

// Allow a user to apply for the job.
router.route('/:jobId/apply')
    .post(jobController.applyForJob);

// Mark an applicant as accepted for the job.
router.route('/jobId/applications/:userId/accept')
    .put(jobController.acceptApplicant);

// Mark an applicant as rejected for the job.
router.route('/jobId/applications/:userId/reject')
    .put(jobController.rejectApplicant);

// get all jobs created by a specific company.
router.route('/company/:companyId')
    .get(jobController.getJobsByCompany)
    
    // get/search , Provide filtering/search capabilities (e.g., by workplace type, job location, job type).
    // Request: A GET request where query parameters (like ?workplace_type=Remote&job_type=full time) are used to filter jobs.
    // Response: A list of jobs that match the search criteria.
router.route('/:jobId/save')
    .post(protect,jobController.saveJob)
    .delete(protect,jobController.unsaveJob)
    .get(protect,jobController.getSavedJobs);
    module.exports = router;