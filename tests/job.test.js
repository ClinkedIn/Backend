const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { 
  createJob,
  getAllJobs,
  getJob,
  updateJob,
  deleteJob,
  saveJob,
  unsaveJob,
  getSavedJobs,
  applyForJob,
  getJobApplications,
  getMyApplications
} = require('../controllers/jobController');

// Set up mocks
jest.mock('../models/companyModel');
jest.mock('../models/jobModel');
jest.mock('../models/userModel');
jest.mock('../models/jobApplicationModel');
jest.mock('../models/notificationModel');
mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
// Import models after mocking
const companyModel = require('../models/companyModel');
const jobModel = require('../models/jobModel');
const userModel = require('../models/userModel');
const jobApplicationModel = require('../models/jobApplicationModel');
const notificationModel = require('../models/notificationModel');

// Setup express app for testing
const app = express();
app.use(express.json());

// Mock authentication middleware
const mockVerifyToken = (req, res, next) => {
  req.user = { 
    id: 'cc81c18d6b9fc1b83e2bebe3', 
    firstName: 'Jane',
    lastName: 'Doe',
    headline: 'Software Engineer',
    profilePicture: 'profile.jpg'
  };
  next();
};

// Set up test routes
app.post('/jobs', mockVerifyToken, createJob);
app.get('/jobs', mockVerifyToken, getAllJobs);

// These specific routes need to be BEFORE the parameterized routes
app.get('/jobs/saved', mockVerifyToken, getSavedJobs);
app.get('/jobs/my-applications', mockVerifyToken, getMyApplications);

// Parameter routes
app.get('/jobs/:jobId', mockVerifyToken, getJob);
app.put('/jobs/:jobId', mockVerifyToken, updateJob);
app.delete('/jobs/:jobId', mockVerifyToken, deleteJob);
app.post('/jobs/:jobId/save', mockVerifyToken, saveJob);
app.delete('/jobs/:jobId/save', mockVerifyToken, unsaveJob);
app.post('/jobs/:jobId/apply', mockVerifyToken, applyForJob);
app.get('/jobs/:jobId/applications', mockVerifyToken, getJobApplications);

describe('Job Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests for createJob
  describe('POST /jobs - Create Job', () => {
    test('should successfully create a job when user is authorized', async () => {
      // Mock company
      const mockCompany = {
        _id: 'company123',
        name: 'Tech Company',
        userId: 'cc81c18d6b9fc1b83e2bebe3', // Same as logged in user
        admins: []
      };

      // Mock new job
      const mockNewJob = {
        _id: 'job456',
        companyId: 'company123',
        title: 'Senior Developer',
        industry: 'Information Technology',
        workplaceType: 'Remote',
        jobLocation: 'New York, NY',
        jobType: 'Full Time',
        description: 'Job description here',
        applicationEmail: 'hiring@techcompany.com',
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };

      // Set up mocks
      companyModel.findById.mockResolvedValue(mockCompany);
      jobModel.prototype.save = jest.fn().mockResolvedValue(mockNewJob);

      const response = await request(app)
        .post('/jobs')
        .send({
          companyId: 'company123',
          title: 'Senior Developer',
          industry: 'Information Technology',
          workplaceType: 'Remote',
          jobLocation: 'New York, NY',
          jobType: 'Full Time',
          description: 'Job description here',
          applicationEmail: 'hiring@techcompany.com'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Job created successfully');
      expect(response.body.job).toHaveProperty('title', 'Senior Developer');
      expect(response.body.job.company).toHaveProperty('id', 'company123');
    });

    test('should return 403 if user is not authorized for the company', async () => {
      // Mock company with different owner
      const mockCompany = {
        _id: 'company123',
        name: 'Tech Company',
        userId: 'differentUser456',
        admins: []
      };

      // Set up mocks
      companyModel.findById.mockResolvedValue(mockCompany);

      const response = await request(app)
        .post('/jobs')
        .send({
          companyId: 'company123',
          title: 'Senior Developer',
          industry: 'Information Technology',
          workplaceType: 'Remote',
          jobLocation: 'New York, NY',
          jobType: 'Full Time',
          description: 'Job description here',
          applicationEmail: 'hiring@techcompany.com'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Unauthorized. You can only create jobs for companies you own or administer');
      expect(jobModel.prototype.save).not.toHaveBeenCalled();
    });

    test('should return 400 if required fields are missing', async () => {
      // Mock company
      const mockCompany = {
        _id: 'company123',
        name: 'Tech Company',
        userId: 'cc81c18d6b9fc1b83e2bebe3', // Same as logged in user
        admins: []
      };

      // Set up mocks
      companyModel.findById.mockResolvedValue(mockCompany);

      const response = await request(app)
        .post('/jobs')
        .send({
          companyId: 'company123',
          title: 'Senior Developer',
          // Missing required fields
          workplaceType: 'Remote',
          jobType: 'Full Time'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/is required to create a job/);
      expect(jobModel.prototype.save).not.toHaveBeenCalled();
    });
  });

  // Tests for getAllJobs
  describe('GET /jobs - Get All Jobs', () => {
    test('should successfully retrieve all jobs', async () => {
      // Mock jobs
      const mockJobs = [
        {
          _id: 'job123',
          companyId: {
            _id: 'company1',
            name: 'Tech Company',
            logo: 'logo.jpg',
            industry: 'IT',
            location: 'San Francisco'
          },
          title: 'Software Engineer',
          industry: 'Technology',
          workplaceType: 'Remote',
          jobLocation: 'San Francisco, CA',
          jobType: 'Full Time',
          description: 'Job description',
          createdAt: new Date()
        },
        {
          _id: 'job456',
          companyId: {
            _id: 'company2',
            name: 'Finance Corp',
            logo: 'logo2.jpg',
            industry: 'Finance',
            location: 'New York'
          },
          title: 'Financial Analyst',
          industry: 'Finance',
          workplaceType: 'Onsite',
          jobLocation: 'New York, NY',
          jobType: 'Full Time',
          description: 'Job description',
          createdAt: new Date()
        }
      ];

      // Set up mock
      jobModel.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockJobs)
      }));

      const response = await request(app).get('/jobs');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Software Engineer');
      expect(response.body[1].title).toBe('Financial Analyst');
    });

    test('should handle empty job list', async () => {
      // Mock empty list
      jobModel.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([])
      }));

      const response = await request(app).get('/jobs');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    test('should handle database errors', async () => {
      // Mock database error
      jobModel.find = jest.fn().mockImplementation(() => {
        throw new Error('Database connection error');
      });

      const response = await request(app).get('/jobs');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to retrieve jobs');
    });
  });

  // Tests for getJob
  describe('GET /jobs/:jobId - Get Job by ID', () => {
    test('should successfully retrieve a job by ID', async () => {
      // Mock job
      const mockJob = {
        _id: 'job123',
        companyId: 'company1',
        title: 'Software Engineer',
        industry: 'Technology',
        workplaceType: 'Remote',
        jobLocation: 'San Francisco, CA',
        jobType: 'Full Time',
        description: 'Job description',
        applicationEmail: 'jobs@company.com',
        screeningQuestions: [
          {
            question: 'Work Experience',
            idealAnswer: '3',
            mustHave: true
          }
        ],
        createdAt: new Date()
      };

      // Set up mock
      jobModel.findById.mockResolvedValue(mockJob);

      const response = await request(app).get('/jobs/job123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', 'job123');
      expect(response.body.title).toBe('Software Engineer');
    });

    test('should return 404 if job is not found', async () => {
      // Mock job not found
      jobModel.findById.mockResolvedValue(null);

      const response = await request(app).get('/jobs/nonexistentjob');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Job not found');
    });

    test('should handle database errors', async () => {
      // Mock database error
      jobModel.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app).get('/jobs/job123');

      expect(response.status).toBe(500);
      expect(response.body.message).toBeDefined();
    });
  });

  // Tests for updateJob
  describe('PUT /jobs/:jobId - Update Job', () => {
    test('should successfully update a job', async () => {
      // Mock existing job
      const mockJob = {
        _id: 'job123',
        companyId: 'company1',
        title: 'Software Engineer',
        industry: 'Technology',
        workplaceType: 'Remote',
        jobLocation: 'San Francisco, CA',
        jobType: 'Full Time',
        description: 'Original description',
        applicationEmail: 'jobs@company.com',
        screeningQuestions: [],
        autoRejectMustHave: false,
        save: jest.fn().mockResolvedValue(true)
      };

      // Updated job
      const updatedJob = {
        ...mockJob,
        description: 'Updated description',
        workplaceType: 'Hybrid',
        jobLocation: 'New York, NY',
        autoRejectMustHave: true
      };

      // Set up mocks
      jobModel.findById.mockResolvedValue(mockJob);
      mockJob.save.mockResolvedValue(updatedJob);

      const response = await request(app)
        .put('/jobs/job123')
        .send({
          description: 'Updated description',
          workplaceType: 'Hybrid',
          jobLocation: 'New York, NY',
          autoRejectMustHave: true
        });

      expect(response.status).toBe(200);
      expect(mockJob.description).toBe('Updated description');
      expect(mockJob.workplaceType).toBe('Hybrid');
      expect(mockJob.jobLocation).toBe('New York, NY');
      expect(mockJob.autoRejectMustHave).toBe(true);
      expect(mockJob.save).toHaveBeenCalled();
    });

    test('should return 404 if job is not found', async () => {
      // Mock job not found
      jobModel.findById.mockResolvedValue(null);

      const response = await request(app)
        .put('/jobs/nonexistentjob')
        .send({
          description: 'Updated description'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Job not found');
    });

    test('should handle validation errors', async () => {
      // Mock existing job
      const mockJob = {
        _id: 'job123',
        companyId: 'company1',
        title: 'Software Engineer',
        save: jest.fn().mockImplementation(() => {
          throw new Error('Validation error: Invalid workplace type');
        })
      };

      // Set up mocks
      jobModel.findById.mockResolvedValue(mockJob);

      const response = await request(app)
        .put('/jobs/job123')
        .send({
          workplaceType: 'InvalidType' // Invalid workplace type
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  // Tests for deleteJob
  describe('DELETE /jobs/:jobId - Delete Job', () => {
    test('should successfully mark a job as inactive', async () => {
      // Mock deleted job
      const mockDeletedJob = {
        _id: 'job123',
        title: 'Software Engineer',
        isActive: false
      };

      // Set up mock
      jobModel.findByIdAndUpdate.mockResolvedValue(mockDeletedJob);

      const response = await request(app).delete('/jobs/job123');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Job deleted successfully');
      expect(response.body.deletedJob.id).toBe('job123');
      expect(jobModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'job123',
        { isActive: false },
        { new: true }
      );
    });

    test('should return 404 if job is not found', async () => {
      // Mock job not found
      jobModel.findByIdAndUpdate.mockResolvedValue(null);

      const response = await request(app).delete('/jobs/nonexistentjob');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Job not found');
    });

    test('should handle database errors', async () => {
      // Mock database error
      jobModel.findByIdAndUpdate.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app).delete('/jobs/job123');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to delete job');
    });
  });

  // Tests for saveJob
  describe('POST /jobs/:jobId/save - Save Job', () => {
    test('should successfully save a job for the user', async () => {
      // Mock job
      const mockJob = {
        _id: 'job123',
        title: 'Software Engineer'
      };

      // Mock user
      const mockUser = {
        _id: 'cc81c18d6b9fc1b83e2bebe3',
        firstName: 'Jane',
        lastName: 'Doe',
        savedJobs: [],
        save: jest.fn().mockResolvedValue(true)
      };

      // Set up mocks
      jobModel.findById.mockResolvedValue(mockJob);
      userModel.findById.mockResolvedValue(mockUser);

      const response = await request(app).post('/jobs/job123/save');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Job saved successfully');
      expect(response.body.savedJobId).toBe('job123');
      expect(mockUser.savedJobs).toContain('job123');
      expect(mockUser.save).toHaveBeenCalled();
    });

    test('should return 400 if job is already saved', async () => {
      // Mock job
      const mockJob = {
        _id: 'job123',
        title: 'Software Engineer'
      };

      // Mock user with job already saved
      const mockUser = {
        _id: 'cc81c18d6b9fc1b83e2bebe3',
        firstName: 'Jane',
        lastName: 'Doe',
        savedJobs: ['job123'], // Job already in saved list
        save: jest.fn().mockResolvedValue(true)
      };

      // Set up mocks
      jobModel.findById.mockResolvedValue(mockJob);
      userModel.findById.mockResolvedValue(mockUser);

      const response = await request(app).post('/jobs/job123/save');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('This job is already in your saved list');
      expect(response.body.alreadySaved).toBe(true);
      expect(mockUser.save).not.toHaveBeenCalled();
    });

    test('should return 404 if job is not found', async () => {
      // Set up mocks
      jobModel.findById.mockResolvedValue(null);

      const response = await request(app).post('/jobs/nonexistentjob/save');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Job not found');
    });
  });

  // Tests for unsaveJob
  describe('DELETE /jobs/:jobId/save - Unsave Job', () => {
    test('should successfully remove a job from saved list', async () => {
      // Mock user with saved job
      const mockUser = {
        _id: 'cc81c18d6b9fc1b83e2bebe3',
        firstName: 'Jane',
        lastName: 'Doe',
        savedJobs: ['job123', 'job456'],
        save: jest.fn().mockResolvedValue(true)
      };

      // Set up mocks
      userModel.findById.mockResolvedValue(mockUser);

      const response = await request(app).delete('/jobs/job123/save');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Job removed from saved list successfully');
      expect(response.body.removedJobId).toBe('job123');
      expect(mockUser.savedJobs).toHaveLength(1);
      expect(mockUser.savedJobs).toContain('job456');
      expect(mockUser.savedJobs).not.toContain('job123');
      expect(mockUser.save).toHaveBeenCalled();
    });

    test('should return 400 if job is not in saved list', async () => {
      // Mock user without the job in saved list
      const mockUser = {
        _id: 'cc81c18d6b9fc1b83e2bebe3',
        firstName: 'Jane',
        lastName: 'Doe',
        savedJobs: ['job456'], // job123 not in list
        save: jest.fn().mockResolvedValue(true)
      };

      // Set up mocks
      userModel.findById.mockResolvedValue(mockUser);

      const response = await request(app).delete('/jobs/job123/save');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('This job is not in your saved list');
      expect(response.body.alreadyRemoved).toBe(true);
      expect(mockUser.save).not.toHaveBeenCalled();
    });

    test('should return 404 if user is not found', async () => {
      // Set up mocks
      userModel.findById.mockResolvedValue(null);

      const response = await request(app).delete('/jobs/job123/save');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });

  // Tests for getSavedJobs
  describe('GET /jobs/saved - Get Saved Jobs', () => {
    test('should successfully retrieve user\'s saved jobs with pagination', async () => {
      // Mock saved jobs
      const mockSavedJobs = [
        {
          _id: 'job123',
          title: 'Software Engineer',
          industry: 'Technology',
          workplaceType: 'Remote',
          jobLocation: 'San Francisco, CA',
          jobType: 'Full Time',
          description: 'Job description',
          companyId: {
            _id: 'company1',
            name: 'Tech Company',
            logo: 'logo.jpg',
            industry: 'IT',
            location: 'San Francisco'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'job456',
          title: 'Product Manager',
          industry: 'Technology',
          workplaceType: 'Hybrid',
          jobLocation: 'New York, NY',
          jobType: 'Full Time',
          description: 'Job description',
          companyId: {
            _id: 'company2',
            name: 'Startup Inc',
            logo: 'logo2.jpg',
            industry: 'Software',
            location: 'New York'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Mock user with saved jobs
      const mockUser = {
        _id: 'cc81c18d6b9fc1b83e2bebe3',
        savedJobs: mockSavedJobs
      };

      // Set up mocks
      userModel.findById = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(mockUser)
      }));

      const response = await request(app).get('/jobs/saved?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Saved jobs retrieved successfully');
      expect(response.body.jobs).toHaveLength(2);
      expect(response.body.jobs[0].title).toBe('Software Engineer');
      expect(response.body.jobs[1].title).toBe('Product Manager');
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.totalJobs).toBe(2);
    });

    test('should return appropriate message when no saved jobs exist', async () => {
      // Mock user with no saved jobs
      const mockUser = {
        _id: 'cc81c18d6b9fc1b83e2bebe3',
        savedJobs: []
      };

      // Set up mocks
      userModel.findById = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(mockUser)
      }));

      const response = await request(app).get('/jobs/saved');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('No saved jobs found');
      expect(response.body.jobs).toHaveLength(0);
      expect(response.body.pagination.totalJobs).toBe(0);
    });

    test('should return 404 if user is not found', async () => {
      // Set up mocks
      userModel.findById = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(null)
      }));

      const response = await request(app).get('/jobs/saved');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });

  // Tests for applyForJob
  describe('POST /jobs/:jobId/apply - Apply for Job', () => {
    test('should successfully apply for a job', async () => {
      // Mock job
      const mockJob = {
        _id: 'job123',
        companyId: 'company1',
        title: 'Software Engineer',
        screeningQuestions: [
          {
            question: 'Work Experience',
            idealAnswer: '3',
            mustHave: true
          }
        ],
        autoRejectMustHave: false,
        applicants: [],
        rejected: [],
        save: jest.fn().mockResolvedValue(true)
      };

      // Mock user
      const mockUser = {
        _id: 'cc81c18d6b9fc1b83e2bebe3',
        firstName: 'Jane',
        lastName: 'Doe'
      };

      // Mock new application
      const mockApplication = {
        _id: 'application789',
        jobId: 'job123',
        userId: 'cc81c18d6b9fc1b83e2bebe3',
        status: 'pending',
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };

      // Mock current date to determine month boundaries
      const mockDate = new Date(2025, 3, 15); // April 15, 2025
      const realDate = Date;
      global.Date = class extends Date {
        constructor(date) {
          if (date) {
            return new realDate(date);
          }
          return mockDate;
        }
      };
      global.Date.now = jest.fn(() => mockDate.getTime());

      // Set up mocks
      jobModel.findById.mockResolvedValue(mockJob);
      userModel.findById.mockResolvedValue(mockUser);
      jobApplicationModel.findOne.mockResolvedValue(null);
      jobApplicationModel.countDocuments.mockResolvedValue(2); // 2 applications this month
      jobApplicationModel.prototype.save = jest.fn().mockResolvedValue(mockApplication);

      const response = await request(app)
        .post('/jobs/job123/apply')
        .send({
          contactEmail: 'jane.doe@example.com',
          contactPhone: '555-123-4567',
          answers: [
            {
              question: 'Work Experience',
              answer: '5'
            }
          ]
        });

      // Restore Date
      global.Date = realDate;

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Application submitted successfully');
      expect(response.body.applicationStatus).toBe('pending');
      expect(response.body.applicationLimits.usedThisMonth).toBe(3); // 2 previous + 1 new
      expect(response.body.applicationLimits.remaining).toBe(2); // 5 - 3
      expect(mockJob.applicants).toContain('cc81c18d6b9fc1b83e2bebe3');
      expect(mockJob.save).toHaveBeenCalled();
    });

    test('should automatically reject if required criteria not met', async () => {
      // Mock job with auto-reject for must-have requirements
      const mockJob = {
        _id: 'job123',
        companyId: 'company1',
        title: 'Senior Software Engineer',
        screeningQuestions: [
          {
            question: 'Work Experience',
            idealAnswer: '5',
            mustHave: true
          }
        ],
        autoRejectMustHave: true,
        applicants: [],
        rejected: [],
        save: jest.fn().mockResolvedValue(true)
      };

      // Mock user
      const mockUser = {
        _id: 'cc81c18d6b9fc1b83e2bebe3',
        firstName: 'Jane',
        lastName: 'Doe'
      };

      // Mock rejected application
      const mockRejectedApp = {
        _id: 'application789',
        jobId: 'job123',
        userId: 'cc81c18d6b9fc1b83e2bebe3',
        status: 'rejected',
        rejectionReason: 'Insufficient work experience. Required: 5 years',
        autoRejected: true,
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };

      // Set up mocks
      jobModel.findById.mockResolvedValue(mockJob);
      userModel.findById.mockResolvedValue(mockUser);
      jobApplicationModel.findOne.mockResolvedValue(null);
      jobApplicationModel.countDocuments.mockResolvedValue(3); // 3 applications this month
      jobApplicationModel.prototype.save = jest.fn().mockResolvedValue(mockRejectedApp);

      const response = await request(app)
        .post('/jobs/job123/apply')
        .send({
          contactEmail: 'jane.doe@example.com',
          contactPhone: '555-123-4567',
          answers: [
            {
              question: 'Work Experience',
              answer: '3' // Less than required 5 years
            }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Application automatically rejected');
      expect(response.body.applicationStatus).toBe('rejected');
      expect(response.body.reason).toBeDefined();
      expect(mockJob.rejected).toContain('cc81c18d6b9fc1b83e2bebe3');
      expect(mockJob.save).toHaveBeenCalled();
    });

    test('should return 400 if user already applied', async () => {
      // Mock existing application
      const mockExistingApp = {
        _id: 'application789',
        jobId: 'job123',
        userId: 'cc81c18d6b9fc1b83e2bebe3',
        status: 'pending'
      };

      // Set up mocks
      jobApplicationModel.findOne.mockResolvedValue(mockExistingApp);

      const response = await request(app)
        .post('/jobs/job123/apply')
        .send({
          contactEmail: 'jane.doe@example.com',
          contactPhone: '555-123-4567'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('You have already applied for this job');
      expect(response.body.alreadyApplied).toBe(true);
    });
  });

  // Tests for getJobApplications
  describe('GET /jobs/:jobId/applications - Get Job Applications', () => {
    test('should successfully retrieve applications for a job', async () => {
      // Mock job
      const mockJob = {
        _id: 'job123',
        companyId: 'company1',
        title: 'Software Engineer'
      };

      // Mock company with user as admin
      const mockCompany = {
        _id: 'company1',
        name: 'Tech Company',
        userId: 'companyOwner',
        admins: ['cc81c18d6b9fc1b83e2bebe3'] // Logged in user is admin
      };

      // Mock applications
      const mockApplications = [
        {
          _id: 'application1',
          jobId: 'job123',
          userId: {
            _id: 'applicant1',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john@example.com',
            profilePicture: 'john.jpg',
            headline: 'Developer'
          },
          status: 'pending',
          contactEmail: 'john@example.com',
          contactPhone: '555-111-2222',
          screeningAnswers: [
            {
              question: 'Work Experience',
              answer: '5',
              meetsCriteria: true
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'application2',
          jobId: 'job123',
          userId: {
            _id: 'applicant2',
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice@example.com',
            profilePicture: 'alice.jpg',
            headline: 'Designer'
          },
          status: 'viewed',
          contactEmail: 'alice@example.com',
          contactPhone: '555-333-4444',
          screeningAnswers: [
            {
              question: 'Work Experience',
              answer: '3',
              meetsCriteria: false
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
          lastViewed: new Date()
        }
      ];

      // Set up mocks
      jobModel.findById.mockResolvedValue(mockJob);
      companyModel.findById.mockResolvedValue(mockCompany);
      jobApplicationModel.countDocuments.mockResolvedValue(2);
      jobApplicationModel.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockApplications)
      }));

      const response = await request(app).get('/jobs/job123/applications?status=all&page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Applications retrieved successfully');
      expect(response.body.applications).toHaveLength(2);
      expect(response.body.applications[0].applicant.firstName).toBe('John');
      expect(response.body.applications[1].applicant.firstName).toBe('Alice');
      expect(response.body.pagination.totalApplications).toBe(2);
      expect(response.body.jobTitle).toBe('Software Engineer');
    });

    test('should return 403 if user is not authorized to view applications', async () => {
        // Mock mongoose.Types.ObjectId.isValid to return true
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
        
        // Mock job
        const mockJob = {
          _id: 'job123',
          companyId: 'company1',
          title: 'Software Engineer'
        };
      
        // Mock company with different owner and admins
        const mockCompany = {
          _id: 'company1',
          name: 'Tech Company',
          userId: 'companyOwner',
          admins: ['someOtherAdmin'] // Logged in user is not admin
        };
      
        // Set up mocks
        jobModel.findById.mockResolvedValue(mockJob);
        companyModel.findById.mockResolvedValue(mockCompany);
      
        const response = await request(app).get('/jobs/job123/applications');
      
        expect(response.status).toBe(403); // Changed from 400 to 403 for authorization error
        expect(response.body.message).toBe('Unauthorized. You can only view applications for your company\'s jobs.');
      });
  });

  // Tests for getMyApplications
  describe('GET /jobs/my-applications - Get User\'s Applications', () => {
    test('should successfully retrieve user\'s job applications with pagination', async () => {
      // Mock applications
      const mockApplications = [
        {
          _id: 'application1',
          jobId: {
            _id: 'job1',
            title: 'Software Engineer',
            industry: 'Technology',
            workplaceType: 'Remote',
            jobLocation: 'San Francisco, CA',
            jobType: 'Full Time',
            companyId: {
              _id: 'company1',
              name: 'Tech Company',
              logo: 'logo1.jpg',
              industry: 'IT',
              location: 'San Francisco'
            }
          },
          userId: 'cc81c18d6b9fc1b83e2bebe3',
          status: 'pending',
          contactEmail: 'jane.doe@example.com',
          contactPhone: '555-123-4567',
          screeningAnswers: [
            {
              question: 'Work Experience',
              answer: '5'
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'application2',
          jobId: {
            _id: 'job2',
            title: 'Product Manager',
            industry: 'Technology',
            workplaceType: 'Hybrid',
            jobLocation: 'New York, NY',
            jobType: 'Full Time',
            companyId: {
              _id: 'company2',
              name: 'Startup Inc',
              logo: 'logo2.jpg',
              industry: 'Software',
              location: 'New York'
            }
          },
          userId: 'cc81c18d6b9fc1b83e2bebe3',
          status: 'rejected',
          contactEmail: 'jane.doe@example.com',
          contactPhone: '555-123-4567',
          screeningAnswers: [
            {
              question: 'Work Experience',
              answer: '3'
            }
          ],
          rejectionReason: 'Insufficient experience',
          autoRejected: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Set up mocks
      jobApplicationModel.countDocuments.mockResolvedValue(2);
      jobApplicationModel.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockApplications)
      }));

      const response = await request(app).get('/jobs/my-applications?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Applications retrieved successfully');
      expect(response.body.applications).toHaveLength(2);
      expect(response.body.applications[0].job.title).toBe('Software Engineer');
      expect(response.body.applications[1].job.title).toBe('Product Manager');
      expect(response.body.applications[0].status).toBe('pending');
      expect(response.body.applications[1].status).toBe('rejected');
      expect(response.body.pagination.totalApplications).toBe(2);
    });

    test('should filter applications by status', async () => {
      // Mock applications (only rejected ones for this test)
      const mockJobApplication = {
            _id: 'job2',
            title: 'Product Manager',
            industry: 'Technology',
            workplaceType: 'Hybrid',
            jobLocation: 'New York, NY',
            jobType: 'Full Time',
            companyId: {
              _id: 'company2',
              name: 'Startup Inc',
              logo: 'logo2.jpg',
              industry: 'Software',
              location: 'New York'
            }
        }
      const mockRejectedApplications = [
        {
          _id: 'application2',
          jobId: 'job2',
          userId: 'cc81c18d6b9fc1b83e2bebe3',
          status: 'rejected',
          contactEmail: 'jane.doe@example.com',
          contactPhone: '555-123-4567',
          screeningAnswers: [
            {
              question: 'Work Experience',
              answer: '3'
            }
          ],
          rejectionReason: 'Insufficient experience',
          autoRejected: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Set up mocks
      jobApplicationModel.countDocuments.mockResolvedValue(1);
      jobApplicationModel.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockRejectedApplications)
      }));

      const response = await request(app).get('/jobs/my-applications?status=rejected');

      expect(response.status).toBe(200);
      expect(response.body.applications).toHaveLength(1);
      expect(response.body.applications[0].status).toBe('rejected');
      expect(response.body.filters.status).toBe('rejected');
      expect(jobApplicationModel.find).toHaveBeenCalledWith({
        userId: 'cc81c18d6b9fc1b83e2bebe3',
        status: 'rejected'
      });
    });

    test('should return appropriate message when no applications exist', async () => {
      // Set up mocks
      jobApplicationModel.countDocuments.mockResolvedValue(0);
      jobApplicationModel.find = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      }));

      const response = await request(app).get('/jobs/my-applications');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('No applications found');
      expect(response.body.applications).toHaveLength(0);
      expect(response.body.pagination.totalApplications).toBe(0);
    });
  });
});