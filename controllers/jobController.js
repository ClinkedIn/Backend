// fuctions implementation is a placeholder
const companyModel = require('../models/companyModel');
const jobModel = require('../models/jobModel');
const mongoose = require('mongoose');
const userModel = require('../models/userModel');
const jobApplicationModel = require('../models/jobApplicationModel');
// Create a new job
const createJob = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware

        // Validate user permissions for the specified company
        const companyId = req.body.companyId;

        // Check if company ID is provided
        if (!companyId) {
            return res.status(400).json({
                message: 'Company ID is required to create a job',
            });
        }

        // Check if company ID is valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({
                message: 'Invalid company ID format',
            });
        }

        // Verify the company exists
        const company = await companyModel.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: 'Company not found',
            });
        }

        // Check if user is authorized to post for this company
        const isOwner = company.userId && company.userId.toString() === userId;
        const isAdmin = company.admins && company.admins.includes(userId);

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message:
                    'Unauthorized. You can only create jobs for companies you own or administer',
            });
        }

        // Validate required fields
        const requiredFields = [
            'title',
            'industry',
            'workplaceType',
            'jobLocation',
            'jobType',
            'description',
            'applicationEmail',
        ];

        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({
                    message: `${
                        field.charAt(0).toUpperCase() + field.slice(1)
                    } is required to create a job`,
                });
            }
        }

        // Validate the workplace type
        const validWorkplaceTypes = ['Onsite', 'Hybrid', 'Remote'];
        if (!validWorkplaceTypes.includes(req.body.workplaceType)) {
            return res.status(400).json({
                message:
                    'Workplace type must be one of: Onsite, Hybrid, Remote',
            });
        }

        // Validate the job type
        const validJobTypes = [
            'Full Time',
            'Part Time',
            'Contract',
            'Temporary',
            'Other',
            'Volunteer',
            'Internship',
        ];
        if (!validJobTypes.includes(req.body.jobType)) {
            return res.status(400).json({
                message:
                    'Job type must be one of: Full Time, Part Time, Contract, Temporary, Other, Volunteer, Internship',
            });
        }

        // Validate application email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.applicationEmail)) {
            return res.status(400).json({
                message: 'Please provide a valid application email address',
            });
        }

        // Validate screening questions if provided
        if (req.body.screeningQuestions) {
            if (!Array.isArray(req.body.screeningQuestions)) {
                return res.status(400).json({
                    message: 'Screening questions must be an array',
                });
            }

            const validQuestionTypes = [
                'Background Check',
                "Driver's License",
                'Drug Test',
                'Education',
                'Expertise with Skill',
                'Hybrid Work',
                'Industry Experience',
                'Language',
                'Location',
                'Onsite Work',
                'Remote Work',
                'Urgent Hiring Need',
                'Visa Status',
                'Work Authorization',
                'Work Experience',
                'Custom Question',
            ];

            for (const question of req.body.screeningQuestions) {
                if (!question.question) {
                    return res.status(400).json({
                        message:
                            'Each screening question must have a question field',
                    });
                }

                if (!validQuestionTypes.includes(question.question)) {
                    return res.status(400).json({
                        message: `Invalid question type: ${question.question}. Must be one of the valid types.`,
                    });
                }

                // If mustHave is specified, ensure it's a boolean
                if (
                    question.mustHave !== undefined &&
                    typeof question.mustHave !== 'boolean'
                ) {
                    return res.status(400).json({
                        message: 'mustHave field must be a boolean value',
                    });
                }
            }
        }

        // Create job object
        const job = new jobModel({
            companyId: companyId,
            title: req.body.title,
            industry: req.body.industry,
            workplaceType: req.body.workplaceType,
            jobLocation: req.body.jobLocation,
            jobType: req.body.jobType,
            description: req.body.description,
            applicationEmail: req.body.applicationEmail,
            screeningQuestions: req.body.screeningQuestions || [],
            autoRejectMustHave:
                req.body.autoRejectMustHave !== undefined
                    ? req.body.autoRejectMustHave
                    : false,
            rejectPreview: req.body.rejectPreview || '',
            applicants: [],
            accepted: [],
            rejected: [],
            isActive: true,
        });

        // Save the job
        const newJob = await job.save();

        // Add the job ID to the company's jobs array
        company.jobs.push(newJob._id);
        await company.save();

        // Return success response with created job
        res.status(201).json({
            message: 'Job created successfully',
            job: {
                id: newJob._id,
                title: newJob.title,
                company: {
                    id: company._id,
                    name: company.name,
                },
                industry: newJob.industry,
                workplaceType: newJob.workplaceType,
                jobLocation: newJob.jobLocation,
                jobType: newJob.jobType,
                description: newJob.description,
                createdAt: newJob.createdAt,
            },
        });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({
            message: 'Failed to create job',
            error: error.message,
        });
    }
};

// Get all jobs
const getAllJobs = async (req, res) => {
    try {
        // Only include active jobs and populate company information
        const jobs = await jobModel
            .find()
            .populate('companyId', 'name logo industry location')
            .sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        console.error('Error getting jobs:', error);
        res.status(500).json({
            message: 'Failed to retrieve jobs',
            error: error.message,
        });
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
        const userId = req.user.id;

        const job = await jobModel.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        const company = await companyModel.findById(job.companyId);

        const isOwner = company.userId && company.userId.toString() === userId;
        const isAdmin = company.admins && company.admins.includes(userId);

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message:
                    'Unauthorized. You can only update jobs for companies you own or administer',
            });
        }

        job.companyId = req.body.companyId || job.companyId;
        job.workplaceType = req.body.workplaceType || job.workplaceType;
        job.jobLocation = req.body.jobLocation || job.jobLocation;
        job.jobType = req.body.jobType || job.jobType;
        job.description = req.body.description || job.description;
        job.applicationEmail =
            req.body.applicationEmail || job.applicationEmail;
        job.screeningQuestions =
            req.body.screeningQuestions || job.screeningQuestions;
        job.autoRejectMustHave =
            req.body.autoRejectMustHave !== undefined
                ? req.body.autoRejectMustHave
                : job.autoRejectMustHave;
        job.rejectPreview = req.body.rejectPreview || job.rejectPreview;
        const updatedJob = await job.save();
        res.status(200).json(updatedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteJob = async (req, res) => {
    try {
        // Using findByIdAndUpdate to soft delete instead of findByIdAndDelete

        const userId = req.user.id;

        const job = await jobModel.findById(req.params.jobId);
        const company = await companyModel.findById(job.companyId);

        const isOwner = company.userId && company.userId.toString() === userId;
        const isAdmin = company.admins && company.admins.includes(userId);

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message:
                    'Unauthorized. You can only delete jobs for companies you own or administer',
            });
        }

        const deletedJob = await jobModel.findByIdAndUpdate(
            req.params.jobId,
            { isActive: false },
            { new: true } // Return the updated document
        );

        if (!deletedJob) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.status(200).json({
            message: 'Job deleted successfully',
            deletedJob: {
                id: deletedJob._id,
                title: deletedJob.title,
            },
        });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({
            message: 'Failed to delete job',
            error: error.message,
        });
    }
};

// Mark an applicant as accepted for the job
const acceptApplicant = async (req, res) => {
    try {
        const userId = req.user.id;

        const job = await jobModel.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        const company = await companyModel.findById(job.companyId);

        const isOwner = company.userId && company.userId.toString() === userId;
        const isAdmin = company.admins && company.admins.includes(userId);

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message:
                    'Unauthorized. You can only accept application for jobs in companies you own or administer',
            });
        }

        const applyingUserId = req.params.userId;
        if (!job.applicants.includes(applyingUserId)) {
            return res
                .status(400)
                .json({ message: 'User has not applied for this job' });
        }
        // Remove from applicants and add to accepted if not already present
        job.applicants = job.applicants.filter(
            (id) => id.toString() !== applyingUserId
        );
        if (!job.accepted.includes(applyingUserId)) {
            job.accepted.push(applyingUserId);
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
        const userId = req.user.id;

        const job = await jobModel.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        const company = await companyModel.findById(job.companyId);

        const isOwner = company.userId && company.userId.toString() === userId;
        const isAdmin = company.admins && company.admins.includes(userId);

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message:
                    'Unauthorized. You can only reject applications for jobs in companies you own or administer',
            });
        }
        const applyingUserId = req.params.userId;
        if (!job.applicants.includes(applyingUserId)) {
            return res
                .status(400)
                .json({ message: 'User has not applied for this job' });
        }
        // Remove from applicants and add to rejected if not already present
        job.applicants = job.applicants.filter(
            (id) => id.toString() !== applyingUserId
        );
        if (!job.rejected.includes(applyingUserId)) {
            job.rejected.push(applyingUserId);
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
        const jobs = await jobModel.find({
            companyId: req.params.companyId,
            isActive: true,
        });
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
                alreadySaved: true,
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
            savedJobId: jobId,
        });
    } catch (error) {
        console.error('Error saving job:', error);
        res.status(500).json({
            message: 'Failed to save job',
            error: error.message,
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
                alreadyRemoved: true,
            });
        }

        // Remove the job from the savedJobs array
        user.savedJobs = user.savedJobs.filter(
            (savedJobId) => savedJobId.toString() !== jobId
        );

        await user.save();

        return res.status(200).json({
            message: 'Job removed from saved list successfully',
            removedJobId: jobId,
        });
    } catch (error) {
        console.error('Error unsaving job:', error);
        res.status(500).json({
            message: 'Failed to remove job from saved list',
            error: error.message,
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
        const user = await userModel
            .findById(userId)
            .populate({
                path: 'savedJobs',
                populate: {
                    path: 'companyId',
                    select: 'name logo industry location',
                },
                options: {
                    sort: { createdAt: -1 },
                    skip: skipIndex,
                    limit: limit,
                },
            })
            .select('savedJobs');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get total count for pagination
        const totalJobs = user.savedJobs ? user.savedJobs.length : 0;
        const totalPages = Math.ceil(totalJobs / limit);

        // Format the saved jobs for the response
        const formattedJobs = user.savedJobs.map((job) => ({
            jobId: job._id,
            title: job.title,
            company: job.companyId
                ? {
                      id: job.companyId._id,
                      name: job.companyId.name,
                      logo: job.companyId.logo,
                      industry: job.companyId.industry,
                      location: job.companyId.location,
                  }
                : null,
            industry: job.industry,
            workplaceType: job.workplaceType,
            jobLocation: job.jobLocation,
            jobType: job.jobType,
            description: job.description,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        }));

        return res.status(200).json({
            message:
                formattedJobs.length > 0
                    ? 'Saved jobs retrieved successfully'
                    : 'No saved jobs found',
            jobs: formattedJobs,
            pagination: {
                totalJobs,
                totalPages,
                currentPage: page,
                pageSize: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        console.error('Error getting saved jobs:', error);
        res.status(500).json({
            message: 'Failed to retrieve saved jobs',
            error: error.message,
        });
    }
};

const applyForJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const userId = req.user.id; // From auth middleware
        const { contactEmail, contactPhone, answers } = req.body;

        // Validate required fields
        if (!contactEmail) {
            return res.status(400).json({
                message: 'Contact email is required for job applications',
            });
        }

        // Validate job ID
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'Invalid job ID format' });
        }

        // Get the job
        const job = await jobModel.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Get the user
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user already applied for this job
        const existingApplication = await jobApplicationModel.findOne({
            jobId: jobId,
            userId: userId,
        });

        if (existingApplication) {
            return res.status(400).json({
                message: 'You have already applied for this job',
                alreadyApplied: true,
                applicationId: existingApplication._id,
                applicationStatus: existingApplication.status,
            });
        }

        // Check if user has reached the monthly application limit (5 per month)
        const currentDate = new Date();
        const firstDayOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
        );
        const lastDayOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
        );

        // Count applications made this month
        const monthlyApplicationCount =
            await jobApplicationModel.countDocuments({
                userId: userId,
                createdAt: {
                    $gte: firstDayOfMonth,
                    $lte: lastDayOfMonth,
                },
            });

        // Check if user has reached the monthly limit
        if (monthlyApplicationCount >= 5 && user.isPremium === false) {
            return res.status(429).json({
                message:
                    'Monthly application limit reached. You can apply to a maximum of 5 jobs per month.',
                limitReached: true,
                currentCount: monthlyApplicationCount,
                limit: 5,
                resetDate: lastDayOfMonth.toISOString(),
            });
        }

        // Check for must-have screening questions and validate answers
        let applicationStatus = 'pending';
        let rejectionReason = null;
        let autoRejected = false;
        let screeningAnswersFormatted = [];

        if (job.screeningQuestions && job.screeningQuestions.length > 0) {
            // Validate that answers are provided if there are screening questions
            if (!answers || !Array.isArray(answers)) {
                return res.status(400).json({
                    message: 'Answers to screening questions are required',
                });
            }

            // Process and validate all screening questions
            for (const question of job.screeningQuestions) {
                const userAnswer = answers.find(
                    (a) => a.question === question.question
                );
                let meetsCriteria = null; // Default: not evaluated

                // Format the answer for saving
                const answerObj = {
                    question: question.question,
                    questionType: question.question,
                    answer: userAnswer ? userAnswer.answer : null,
                    meetsCriteria,
                };

                // If it's a must-have question, evaluate the answer
                if (question.mustHave) {
                    if (!userAnswer) {
                        // Must-have question not answered
                        meetsCriteria = false;
                        if (job.autoRejectMustHave) {
                            applicationStatus = 'rejected';
                            rejectionReason = `Missing answer for required question: ${question.question}`;
                            autoRejected = true;
                        }
                    } else if (question.question === 'Work Experience') {
                        // Special handling for work experience - numeric comparison
                        const requiredYears = parseFloat(question.idealAnswer);
                        const userYears = parseFloat(userAnswer.answer);

                        meetsCriteria =
                            !isNaN(userYears) && userYears >= requiredYears;

                        if (!meetsCriteria && job.autoRejectMustHave) {
                            applicationStatus = 'rejected';
                            rejectionReason = `Insufficient work experience. Required: ${question.idealAnswer} years`;
                            autoRejected = true;
                        }
                    } else {
                        // For other questions, check for exact match if idealAnswer is specified
                        if (question.idealAnswer) {
                            meetsCriteria =
                                question.idealAnswer.toLowerCase() ===
                                userAnswer.answer.toLowerCase();

                            if (!meetsCriteria && job.autoRejectMustHave) {
                                applicationStatus = 'rejected';
                                rejectionReason = `Incorrect answer for ${question.question}`;
                                autoRejected = true;
                            }
                        }
                    }
                }

                // Update the meetsCriteria field with the evaluation result
                answerObj.meetsCriteria = meetsCriteria;
                screeningAnswersFormatted.push(answerObj);
            }
        }

        // Create the job application
        const newApplication = new jobApplicationModel({
            jobId,
            userId,
            companyId: job.companyId,
            status: applicationStatus,
            contactEmail,
            contactPhone,
            screeningAnswers: screeningAnswersFormatted,
            rejectionReason,
            autoRejected,
        });

        await newApplication.save();

        // Add to appropriate list in the job document based on application status
        if (applicationStatus === 'pending') {
            job.applicants.push(userId);
        } else if (applicationStatus === 'rejected') {
            job.rejected.push(userId);
        }

        await job.save();

        // Get the updated monthly application count after this application
        const updatedMonthlyCount = monthlyApplicationCount + 1;

        // Construct the response based on application status
        const response = {
            message:
                applicationStatus === 'pending'
                    ? 'Application submitted successfully'
                    : 'Application automatically rejected',
            applicationStatus,
            applicationId: newApplication._id,
            jobId,
            applicationLimits: {
                monthlyLimit: 5,
                usedThisMonth: updatedMonthlyCount,
                remaining: 5 - updatedMonthlyCount,
                resetDate: lastDayOfMonth.toISOString(),
            },
        };

        // Include rejection reason if applicable
        if (rejectionReason) {
            response.reason = rejectionReason;
        }

        return res.status(200).json(response);
    } catch (error) {
        console.error('Error applying for job:', error);

        // Check for duplicate key error (user already applied)
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'You have already applied for this job',
                alreadyApplied: true,
            });
        }

        res.status(500).json({
            message: 'Failed to apply for job',
            error: error.message,
        });
    }
};

const getJobApplications = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { status, page = 1, limit = 10 } = req.query;
        const userId = req.user.id; // This comes from auth middleware
        // Validate job ID
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: 'Invalid job ID format' });
        }
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: 'Not authorized, no valid user info',
            });
        }
        const job = await jobModel.findById(jobId);
        // Get company details to check authorization
        const company = await companyModel.findById(job.companyId);

        if (!company) {
            return res.status(404).json({
                message: 'Company not found',
            });
        }
        // Get the job
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        //Check if user has permission (company representative)
        if (
            !company.admins.includes(userId) &&
            company.userId.toString() !== userId
        ) {
            return res.status(403).json({
                message:
                    "Unauthorized. You can only view applications for your company's jobs.",
            });
        }

        // Build the query
        const query = { jobId };
        if (
            status &&
            ['pending', 'viewed', 'rejected', 'accepted'].includes(status)
        ) {
            query.status = status;
        }

        // Parse pagination parameters
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skipIndex = (pageNum - 1) * limitNum;

        // Get total count for pagination
        const totalApplications = await jobApplicationModel.countDocuments(
            query
        );

        // Get the applications
        const applications = await jobApplicationModel
            .find(query)
            .populate(
                'userId',
                'firstName lastName email profilePicture headline'
            )
            .skip(skipIndex)
            .limit(limitNum)
            .sort({ createdAt: -1 }) // Newest first
            .lean();

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalApplications / limitNum);

        // Format the response
        const formattedApplications = applications.map((app) => ({
            applicationId: app._id,
            status: app.status,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt,
            lastViewed: app.lastViewed,
            applicant: {
                userId: app.userId._id,
                firstName: app.userId.firstName,
                lastName: app.userId.lastName,
                email: app.userId.email,
                profilePicture: app.userId.profilePicture,
                headline: app.userId.headline,
            },
            contactEmail: app.contactEmail,
            contactPhone: app.contactPhone,
            screeningAnswers: app.screeningAnswers,
            rejectionReason: app.rejectionReason,
            autoRejected: app.autoRejected,
        }));

        return res.status(200).json({
            message:
                formattedApplications.length > 0
                    ? 'Applications retrieved successfully'
                    : 'No applications found',
            jobTitle: job.title,
            applications: formattedApplications,
            pagination: {
                totalApplications,
                totalPages,
                currentPage: pageNum,
                pageSize: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
            },
            filters: {
                status: status || 'all',
            },
        });
    } catch (error) {
        console.error('Error getting job applications:', error);
        res.status(500).json({
            message: 'Failed to retrieve job applications',
            error: error.message,
        });
    }
};

const getMyApplications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;

        // Build the query
        const query = { userId };
        if (
            status &&
            ['pending', 'viewed', 'rejected', 'accepted'].includes(status)
        ) {
            query.status = status;
        }

        // Parse pagination parameters
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skipIndex = (pageNum - 1) * limitNum;

        // Get total count for pagination
        const totalApplications = await jobApplicationModel.countDocuments(
            query
        );

        // Get the applications
        const applications = await jobApplicationModel
            .find(query)
            .populate({
                path: 'jobId',
                select: 'title industry workplaceType jobLocation jobType companyId',
                populate: {
                    path: 'companyId',
                    select: 'name logo industry location',
                },
            })
            .skip(skipIndex)
            .limit(limitNum)
            .sort({ createdAt: -1 }) // Newest first
            .lean();

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalApplications / limitNum);

        // Format the response
        const formattedApplications = applications.map((app) => ({
            applicationId: app._id,
            status: app.status,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt,
            job: {
                jobId: app.jobId._id,
                title: app.jobId.title,
                industry: app.jobId.industry,
                workplaceType: app.jobId.workplaceType,
                jobLocation: app.jobId.jobLocation,
                jobType: app.jobId.jobType,
                company: app.jobId.companyId
                    ? {
                          id: app.jobId.companyId._id,
                          name: app.jobId.companyId.name,
                          logo: app.jobId.companyId.logo,
                          industry: app.jobId.companyId.industry,
                          location: app.jobId.companyId.location,
                      }
                    : null,
            },
            contactEmail: app.contactEmail,
            contactPhone: app.contactPhone,
            screeningAnswers: app.screeningAnswers.map((answer) => ({
                question: answer.question,
                answer: answer.answer,
            })),
            rejectionReason: app.rejectionReason,
            autoRejected: app.autoRejected,
        }));

        return res.status(200).json({
            message:
                formattedApplications.length > 0
                    ? 'Applications retrieved successfully'
                    : 'No applications found',
            applications: formattedApplications,
            pagination: {
                totalApplications,
                totalPages,
                currentPage: pageNum,
                pageSize: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
            },
            filters: {
                status: status || 'all',
            },
        });
    } catch (error) {
        console.error('Error getting user applications:', error);
        res.status(500).json({
            message: 'Failed to retrieve job applications',
            error: error.message,
        });
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
    getJobsByCompany,
    saveJob,
    unsaveJob,
    getSavedJobs,
    getJobApplications,
    getMyApplications,
};
