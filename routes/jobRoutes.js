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

router.route('/saved')
    .get(protect,jobController.getSavedJobs)

router.route('/my-applications')
    .get(protect,jobController.getMyApplications)

// Mark an applicant as accepted for the job.
router.route('/jobId/applications/:userId/accept')
    .put(protect,jobController.acceptApplicant);

// Mark an applicant as rejected for the job.
router.route('/jobId/applications/:userId/reject')
    .put(protect,jobController.rejectApplicant);

// get all jobs created by a specific company.
router.route('/company/:companyId')
    .get(protect,jobController.getJobsByCompany)
    
    // get/search , Provide filtering/search capabilities (e.g., by workplace type, job location, job type).
    // Request: A GET request where query parameters (like ?workplace_type=Remote&job_type=full time) are used to filter jobs.
    // Response: A list of jobs that match the search criteria.
router.route('/:jobId/save')
    .post(protect,jobController.saveJob)
    .delete(protect,jobController.unsaveJob)

router.route('/:jobId/apply')
    .post(protect,jobController.applyForJob)
    .get(protect,jobController.getJobApplications)

router.route('/:jobId')
    .get(protect,jobController.getJob)
    .put(protect,jobController.updateJob)
    .delete(protect,jobController.deleteJob);
router.route('/')
    .post(protect,jobController.createJob)
    .get(protect,jobController.getAllJobs);
    module.exports = router;