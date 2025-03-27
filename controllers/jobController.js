// fuctions implementation is a placeholder
const jobModel = require('../models/jobModel');
const mongoose = require('mongoose');
const userModel = require('../models/userModel');
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

const saveJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const userId = req.user.id; // This comes from auth middleware
        
        // Validate job ID
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'Invalid job ID format' });
        }
        
        // Check if job exists
        const job = await jobModel.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        
        // Get the user document from the database
        const userModel = require('../models/userModel');
        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if the job is already saved
        if (user.savedJobs && user.savedJobs.includes(jobId)) {
            return res.status(400).json({ 
                message: 'This job is already in your saved list',
                alreadySaved: true
            });
        }
        
        // Add the job to the user's savedJobs array
        if (!user.savedJobs) {
            user.savedJobs = [];
        }
        
        user.savedJobs.push(jobId);
        await user.save();
        
        return res.status(200).json({
            message: 'Job saved successfully',
            savedJobId: jobId
        });
    } catch (error) {
        console.error('Error saving job:', error);
        res.status(500).json({ 
            message: 'Failed to save job',
            error: error.message 
        });
    }
};
const unsaveJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const userId = req.user.id; // This comes from auth middleware
        
        // Validate job ID
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'Invalid job ID format' });
        }
        
        // Get the user document from the database
        const userModel = require('../models/userModel');
        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if the job is in the saved list
        if (!user.savedJobs || !user.savedJobs.includes(jobId)) {
            return res.status(400).json({ 
                message: 'This job is not in your saved list',
                alreadyRemoved: true
            });
        }
        
        // Remove the job from the savedJobs array
        user.savedJobs = user.savedJobs.filter(
            savedJobId => savedJobId.toString() !== jobId
        );
        
        await user.save();
        
        return res.status(200).json({
            message: 'Job removed from saved list successfully',
            removedJobId: jobId
        });
    } catch (error) {
        console.error('Error unsaving job:', error);
        res.status(500).json({ 
            message: 'Failed to remove job from saved list',
            error: error.message 
        });
    }
};

const getSavedJobs = async (req, res) => {
    try {
        const userId = req.user.id; // This comes from auth middleware
        
        // Parse pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skipIndex = (page - 1) * limit;
        
        // Get the user with populated savedJobs
        const user = await userModel.findById(userId)
            .populate({
                path: 'savedJobs',
                populate: {
                    path: 'companyId',
                    select: 'name logo industry location'
                },
                options: {
                    sort: { createdAt: -1 },
                    skip: skipIndex,
                    limit: limit
                }
            })
            .select('savedJobs');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Get total count for pagination
        const totalJobs = user.savedJobs ? user.savedJobs.length : 0;
        const totalPages = Math.ceil(totalJobs / limit);
        
        // Format the saved jobs for the response
        const formattedJobs = user.savedJobs.map(job => ({
            jobId: job._id,
            title: job.title,
            company: job.companyId ? {
                id: job.companyId._id,
                name: job.companyId.name,
                logo: job.companyId.logo,
                industry: job.companyId.industry,
                location: job.companyId.location
            } : null,
            industry: job.industry,
            workplaceType: job.workplaceType,
            jobLocation: job.jobLocation,
            jobType: job.jobType,
            description: job.description,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt
        }));
        
        return res.status(200).json({
            message: formattedJobs.length > 0 ? 
                'Saved jobs retrieved successfully' : 
                'No saved jobs found',
            jobs: formattedJobs,
            pagination: {
                totalJobs,
                totalPages,
                currentPage: page,
                pageSize: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error getting saved jobs:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve saved jobs',
            error: error.message 
        });
    }
};

// DON't Review this code it is made by ali abdelghani

module.exports = {
    createJob,
    getAllJobs,
    getJob,
    updateJob,
    deleteJob,
    applyForJob,
    acceptApplicant,
    rejectApplicant,
    getJobsByCompany,
    saveJob,
    unsaveJob,
    getSavedJobs
};
