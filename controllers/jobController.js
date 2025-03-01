// fuctions implementation is a placeholder
const jobModel = require('../models/jobModel');

// Create a new job
const createJob = async (req, res) => {
    try {
        const job = new jobModel({
            companyId: req.body.companyId,
            workplaceType: req.body.workplaceType, // "Onsite", "Hybrid", or "Remote"
            jobLocation: req.body.jobLocation,
            jobType: req.body.jobType, // "Full Time", "Part Time", "Contract", etc.
            description: req.body.description,
            applicationEmail: req.body.applicationEmail,
            screeningQuestions: req.body.screeningQuestions, // Expected as an array of objects { question, mustHave }
            autoRejectMustHave: req.body.autoRejectMustHave,
            rejectPreview: req.body.rejectPreview,
            applicants: [],
            accepted: [],
            rejected: []
        });
        const newJob = await job.save();
        res.status(201).json(newJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all jobs
const getAllJobs = async (req, res) => {
    try {
        const jobs = await jobModel.find();
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a specific job by ID
const getJob = async (req, res) => {
    try {
        const job = await jobModel.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a job by ID
const updateJob = async (req, res) => {
    try {
        const job = await jobModel.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        job.companyId = req.body.companyId || job.companyId;
        job.workplaceType = req.body.workplaceType || job.workplaceType;
        job.jobLocation = req.body.jobLocation || job.jobLocation;
        job.jobType = req.body.jobType || job.jobType;
        job.description = req.body.description || job.description;
        job.applicationEmail = req.body.applicationEmail || job.applicationEmail;
        job.screeningQuestions = req.body.screeningQuestions || job.screeningQuestions;
        job.autoRejectMustHave = req.body.autoRejectMustHave !== undefined ? req.body.autoRejectMustHave : job.autoRejectMustHave;
        job.rejectPreview = req.body.rejectPreview || job.rejectPreview;
        const updatedJob = await job.save();
        res.status(200).json(updatedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a job by ID
const deleteJob = async (req, res) => {
    try {
        const job = await jobModel.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        await job.remove();
        res.status(200).json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Allow a user to apply for the job
const applyForJob = async (req, res) => {
    try {
        const job = await jobModel.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        const applicantId = req.body.userId;
        if (!applicantId) {
            return res.status(400).json({ message: 'Applicant ID is required' });
        }
        // Check if the user has already applied or been processed
        if (
            job.applicants.includes(applicantId) ||
            job.accepted.includes(applicantId) ||
            job.rejected.includes(applicantId)
        ) {
            return res.status(400).json({ message: 'User has already applied for this job' });
        }
        job.applicants.push(applicantId);
        const updatedJob = await job.save();
        res.status(200).json(updatedJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark an applicant as accepted for the job
const acceptApplicant = async (req, res) => {
    try {
        const job = await jobModel.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        const userId = req.params.userId;
        if (!job.applicants.includes(userId)) {
            return res.status(400).json({ message: 'User has not applied for this job' });
        }
        // Remove from applicants and add to accepted if not already present
        job.applicants = job.applicants.filter(id => id.toString() !== userId);
        if (!job.accepted.includes(userId)) {
            job.accepted.push(userId);
        }
        const updatedJob = await job.save();
        res.status(200).json(updatedJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark an applicant as rejected for the job
const rejectApplicant = async (req, res) => {
    try {
        const job = await jobModel.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        const userId = req.params.userId;
        if (!job.applicants.includes(userId)) {
            return res.status(400).json({ message: 'User has not applied for this job' });
        }
        // Remove from applicants and add to rejected if not already present
        job.applicants = job.applicants.filter(id => id.toString() !== userId);
        if (!job.rejected.includes(userId)) {
            job.rejected.push(userId);
        }
        const updatedJob = await job.save();
        res.status(200).json(updatedJob);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all jobs created by a specific company
const getJobsByCompany = async (req, res) => {
    try {
        const jobs = await jobModel.find({ companyId: req.params.companyId });
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createJob,
    getAllJobs,
    getJob,
    updateJob,
    deleteJob,
    applyForJob,
    acceptApplicant,
    rejectApplicant,
    getJobsByCompany
};
