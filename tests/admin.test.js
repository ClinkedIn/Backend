const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Report = require('../models/reportModel');
const Job = require('../models/jobModel');
const User = require('../models/userModel');
const Post = require('../models/postModel');
const Company = require('../models/companyModel');
const {
    getAllReports,
    getReport,
    handleReport,
    deleteReport,
    getFlaggedJobs,
    moderateJob,
    removeJob,
    getAnalyticsOverview,
    getUserAnalytics,
    getContentAnalytics
} = require('../controllers/adminController');

// Mock all models
jest.mock('../models/reportModel');
jest.mock('../models/jobModel');
jest.mock('../models/userModel');
jest.mock('../models/postModel');
jest.mock('../models/companyModel');

const app = express();
app.use(express.json());

// Mock auth middleware
const mockVerifyToken = (req, res, next) => {
    req.user = { 
        id: 'mock-admin-id',
        role: 'admin'
    };
    next();
};

// Setup routes for testing
app.get('/admin/reports', mockVerifyToken, getAllReports);
app.get('/admin/reports/:reportId', mockVerifyToken, getReport);
app.patch('/admin/reports/:reportId', mockVerifyToken, handleReport);
app.delete('/admin/reports/:reportId', mockVerifyToken, deleteReport);
app.get('/admin/jobs', mockVerifyToken, getFlaggedJobs);
app.patch('/admin/jobs/:jobId', mockVerifyToken, moderateJob);
app.delete('/admin/jobs/:jobId', mockVerifyToken, removeJob);
app.get('/admin/analytics/overview', mockVerifyToken, getAnalyticsOverview);
app.get('/admin/analytics/users', mockVerifyToken, getUserAnalytics);
app.get('/admin/analytics/content', mockVerifyToken, getContentAnalytics);

describe('Admin Controller Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Report Management', () => {
        describe('GET /admin/reports', () => {
            test('should get all reports successfully', async () => {
                const mockReports = [
                    {
                        _id: 'report1',
                        userId: 'user1',
                        reportedId: 'post1',
                        reportedType: 'Post',
                        status: 'pending'
                    },
                    {
                        _id: 'report2',
                        userId: 'user2',
                        reportedId: 'comment1',
                        reportedType: 'Comment',
                        status: 'pending'
                    }
                ];

                Report.find = jest.fn().mockImplementation(() => ({
                    populate: jest.fn().mockReturnThis(),
                    sort: jest.fn().mockResolvedValue(mockReports)
                }));

                const response = await request(app)
                    .get('/admin/reports');

                expect(response.status).toBe(200);
                expect(response.body.status).toBe('success');
                expect(response.body.data).toHaveLength(2);
                expect(Report.find).toHaveBeenCalled();
            });
        });

        describe('GET /admin/reports/:reportId', () => {
            test('should get specific report successfully', async () => {
                const mockReport = {
                    _id: 'report1',
                    userId: 'user1',
                    reportedId: 'post1',
                    reportedType: 'Post',
                    status: 'pending'
                };

                Report.findById = jest.fn().mockImplementation(() => ({
                    populate: jest.fn().mockResolvedValue(mockReport)
                }));

                const response = await request(app)
                    .get('/admin/reports/report1');

                expect(response.status).toBe(200);
                expect(response.body.data._id).toBe('report1');
                expect(Report.findById).toHaveBeenCalledWith('report1');
            });

            test('should return 404 for non-existent report', async () => {
                Report.findById = jest.fn().mockImplementation(() => ({
                    populate: jest.fn().mockResolvedValue(null)
                }));

                const response = await request(app)
                    .get('/admin/reports/nonexistent');

                expect(response.status).toBe(404);
            });
        });

        describe('PATCH /admin/reports/:reportId', () => {
            test('should handle report successfully', async () => {
                const mockUpdatedReport = {
                    _id: 'report1',
                    status: 'approved',
                    adminFeedback: 'Violation confirmed'
                };

                Report.findByIdAndUpdate = jest.fn().mockImplementation(() => ({
                    populate: jest.fn().mockResolvedValue(mockUpdatedReport)
                }));

                const response = await request(app)
                    .patch('/admin/reports/report1')
                    .send({
                        action: 'approved',
                        reason: 'Violation confirmed'
                    });

                expect(response.status).toBe(200);
                expect(response.body.data.status).toBe('approved');
            });
        });
    });

    describe('Job Management', () => {
        describe('GET /admin/jobs', () => {
            test('should get flagged jobs successfully', async () => {
                const mockJobs = [
                    {
                        _id: 'job1',
                        title: 'Software Engineer',
                        isFlagged: true,
                        flagReason: 'Inappropriate content'
                    }
                ];

                Job.find = jest.fn().mockImplementation(() => ({
                    populate: jest.fn().mockReturnThis(),
                    sort: jest.fn().mockResolvedValue(mockJobs)
                }));

                const response = await request(app)
                    .get('/admin/jobs');

                expect(response.status).toBe(200);
                expect(response.body.data).toHaveLength(1);
                expect(Job.find).toHaveBeenCalledWith({ isFlagged: true });
            });
        });

        describe('PATCH /admin/jobs/:jobId', () => {
            test('should moderate job successfully', async () => {
                const mockUpdatedJob = {
                    _id: 'job1',
                    isFlagged: false,
                    moderationStatus: 'approved'
                };

                Job.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedJob);

                const response = await request(app)
                    .patch('/admin/jobs/job1')
                    .send({
                        action: 'approve',
                        reason: 'Content reviewed and approved'
                    });

                expect(response.status).toBe(200);
                expect(response.body.data.isFlagged).toBe(false);
            });
        });
    });

    describe('Analytics', () => {
        describe('GET /admin/analytics/overview', () => {
            test('should get analytics overview successfully', async () => {
                const mockCounts = {
                    users: 100,
                    posts: 500,
                    jobs: 50,
                    companies: 20
                };

                User.countDocuments = jest.fn().mockResolvedValue(mockCounts.users);
                Post.countDocuments = jest.fn().mockResolvedValue(mockCounts.posts);
                Job.countDocuments = jest.fn().mockResolvedValue(mockCounts.jobs);
                Company.countDocuments = jest.fn().mockResolvedValue(mockCounts.companies);

                const response = await request(app)
                    .get('/admin/analytics/overview');

                expect(response.status).toBe(200);
                expect(response.body.data).toHaveProperty('totalUsers', 100);
                expect(response.body.data).toHaveProperty('totalPosts', 500);
                expect(response.body.data).toHaveProperty('totalJobs', 50);
                expect(response.body.data).toHaveProperty('totalCompanies', 20);
            });
        });

        describe('GET /admin/analytics/users', () => {
            test('should get user analytics successfully', async () => {
                const mockUserStats = {
                    _id: null,
                    totalUsers: 100,
                    activeUsers: 80,
                    premiumUsers: 20
                };

                User.aggregate = jest.fn().mockResolvedValue([mockUserStats]);

                const response = await request(app)
                    .get('/admin/analytics/users');

                expect(response.status).toBe(200);
                expect(response.body.data).toHaveProperty('totalUsers', 100);
                expect(response.body.data).toHaveProperty('activeUsers', 80);
                expect(response.body.data).toHaveProperty('premiumUsers', 20);
            });
        });

        describe('GET /admin/analytics/content', () => {
            test('should get content analytics successfully', async () => {
                const mockContentStats = {
                    postTypes: { text: 30, image: 40, video: 30 },
                    totalEngagement: 1000,
                    avgEngagementRate: 0.25
                };

                Post.aggregate = jest.fn().mockResolvedValue([mockContentStats]);

                const response = await request(app)
                    .get('/admin/analytics/content');

                expect(response.status).toBe(200);
                expect(response.body.data).toHaveProperty('postTypes');
                expect(response.body.data).toHaveProperty('totalEngagement');
                expect(response.body.data).toHaveProperty('avgEngagementRate');
            });
        });
    });

    describe('Error Handling', () => {
        test('should handle database errors gracefully', async () => {
            Report.find = jest.fn().mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .get('/admin/reports');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('status', 'error');
        });

        test('should handle invalid ObjectId format', async () => {
            const response = await request(app)
                .get('/admin/reports/invalid-id');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('status', 'error');
        });
    });
});
