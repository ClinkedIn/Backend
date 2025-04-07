const Report = require('../models/reportModel');
const Job = require('../models/jobModel');
const User = require('../models/userModel');
const Post = require('../models/postModel');


// Reports monitoring
exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('userId', 'name email')
            .sort('-createdAt');
        
        res.status(200).json({
            status: 'success',
            data: reports
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.getReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.reportId)
            .populate('userId', 'name email')
            .populate('reportedId');

        if (!report) {
            return res.status(404).json({
                status: 'fail',
                message: 'Report not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: report
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.handleReport = async (req, res) => {
    try {
        const { action, reason } = req.body;
        const report = await Report.findByIdAndUpdate(
            req.params.reportId,
            { 
                status: action,
                moderationReason: reason,
                moderatedAt: Date.now()
            },
            { new: true }
        );

        res.status(200).json({
            status: 'success',
            data: report
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
exports.deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.reportId);

        if (!report) {
            return res.status(404).json({
                status: 'fail',
                message: 'Report not found'
            });
        }

        // Delete the report
        await Report.findByIdAndDelete(req.params.reportId);

        res.status(200).json({
            status: 'success',
            message: 'Report deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
// Job management
exports.getFlaggedJobs = async (req, res) => {
    try {
        const flaggedJobs = await Job.find({ isFlagged: true })
            .populate('companyId', 'name');

        res.status(200).json({
            status: 'success',
            data: flaggedJobs
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.moderateJob = async (req, res) => {
    try {
        const { action, reason } = req.body;
        const job = await Job.findByIdAndUpdate(
            req.params.jobId,
            {
                status: action,
                moderationReason: reason,
                moderatedAt: Date.now()
            },
            { new: true }
        );

        res.status(200).json({
            status: 'success',
            data: job
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
exports.removeJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);

        if (!job) {
            return res.status(404).json({
                status: 'fail',
                message: 'Job not found'
            });
        }

        // Delete the job
        await Job.findByIdAndDelete(req.params.jobId);

        // Notify the job owner (company) about the removal
        // You might want to implement notification logic here

        res.status(200).json({
            status: 'success',
            message: 'Job removed successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};


// Analytics
exports.getAnalyticsOverview = async (req, res) => {
    try {
        const [
            userStats,
            postStats,
            jobStats,
            connectionStats,
            companyStats
        ] = await Promise.all([
            // User Statistics
            User.aggregate([
                {
                    $group: {
                        _id: null,
                        totalUsers: { $sum: 1 },
                        activeUsers: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "active"] }, 1, 0]
                            }
                        },
                        premiumUsers: {
                            $sum: {
                                $cond: [{ $eq: ["$accountType", "premium"] }, 1, 0]
                            }
                        }
                    }
                }
            ]),

            // Post Statistics
            Post.aggregate([
                {
                    $group: {
                        _id: null,
                        totalPosts: { $sum: 1 },
                        totalImpressions: { $sum: "$impressionCount" },
                        totalComments: { $sum: "$commentCount" },
                        totalShares: { $sum: "$shareCount" }
                    }
                }
            ]),

            // Job Statistics
            Job.aggregate([
                {
                    $group: {
                        _id: null,
                        totalJobs: { $sum: 1 },
                        activeJobs: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "active"] }, 1, 0]
                            }
                        },
                        totalApplications: { $sum: "$applicationCount" }
                    }
                }
            ]),

            // Connection Statistics
            Connection.aggregate([
                {
                    $group: {
                        _id: null,
                        totalConnections: { $sum: 1 },
                        pendingConnections: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "pending"] }, 1, 0]
                            }
                        }
                    }
                }
            ]),

            // Company Statistics
            Company.aggregate([
                {
                    $group: {
                        _id: null,
                        totalCompanies: { $sum: 1 },
                        verifiedCompanies: {
                            $sum: {
                                $cond: [{ $eq: ["$isVerified", true] }, 1, 0]
                            }
                        }
                    }
                }
            ])
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                users: {
                    total: userStats[0]?.totalUsers || 0,
                    active: userStats[0]?.activeUsers || 0,
                    premium: userStats[0]?.premiumUsers || 0
                },
                posts: {
                    total: postStats[0]?.totalPosts || 0,
                    totalImpressions: postStats[0]?.totalImpressions || 0,
                    totalComments: postStats[0]?.totalComments || 0,
                    totalShares: postStats[0]?.totalShares || 0
                },
                jobs: {
                    total: jobStats[0]?.totalJobs || 0,
                    active: jobStats[0]?.activeJobs || 0,
                    totalApplications: jobStats[0]?.totalApplications || 0
                },
                connections: {
                    total: connectionStats[0]?.totalConnections || 0,
                    pending: connectionStats[0]?.pendingConnections || 0
                },
                companies: {
                    total: companyStats[0]?.totalCompanies || 0,
                    verified: companyStats[0]?.verifiedCompanies || 0
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.getUserAnalytics = async (req, res) => {
    try {
        const timeRange = req.query.range || '30'; // days
        const endDate = new Date();
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - parseInt(timeRange));

        const [
            userGrowth,
            userEngagement,
            userDistribution,
            connectionMetrics
        ] = await Promise.all([
            // User Growth
            User.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                            day: { $dayOfMonth: "$createdAt" }
                        },
                        newUsers: { $sum: 1 },
                        premiumUsers: {
                            $sum: {
                                $cond: [{ $eq: ["$accountType", "premium"] }, 1, 0]
                            }
                        }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
            ]),

            // User Engagement
            User.aggregate([
                {
                    $match: {
                        lastActive: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$lastActive" },
                            month: { $month: "$lastActive" },
                            day: { $dayOfMonth: "$lastActive" }
                        },
                        dailyActiveUsers: { $sum: 1 },
                        postingUsers: {
                            $sum: { $cond: [{ $gt: ["$postCount", 0] }, 1, 0] }
                        },
                        commentingUsers: {
                            $sum: { $cond: [{ $gt: ["$commentCount", 0] }, 1, 0] }
                        }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
            ]),

            // User Distribution
            User.aggregate([
                {
                    $group: {
                        _id: "$industry",
                        count: { $sum: 1 },
                        averageConnections: { $avg: "$connectionCount" },
                        averagePostCount: { $avg: "$postCount" }
                    }
                },
                { $sort: { count: -1 } }
            ]),

            // Connection Metrics
            Connection.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                            day: { $dayOfMonth: "$createdAt" }
                        },
                        newConnections: { $sum: 1 },
                        acceptedConnections: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "accepted"] }, 1, 0]
                            }
                        }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
            ])
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                timeRange: {
                    start: startDate,
                    end: endDate
                },
                growth: userGrowth,
                engagement: userEngagement,
                industryDistribution: userDistribution,
                connections: connectionMetrics
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.getContentAnalytics = async (req, res) => {
    try {
        const timeRange = req.query.range || '30'; // days
        const endDate = new Date();
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - parseInt(timeRange));

        const [
            postAnalytics,
            jobAnalytics,
            engagementMetrics,
            contentDistribution
        ] = await Promise.all([
            // Post Analytics
            Post.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                            day: { $dayOfMonth: "$createdAt" }
                        },
                        totalPosts: { $sum: 1 },
                        textPosts: {
                            $sum: { $cond: [{ $eq: ["$type", "text"] }, 1, 0] }
                        },
                        imagePosts: {
                            $sum: { $cond: [{ $eq: ["$type", "image"] }, 1, 0] }
                        },
                        videoPosts: {
                            $sum: { $cond: [{ $eq: ["$type", "video"] }, 1, 0] }
                        },
                        articlePosts: {
                            $sum: { $cond: [{ $eq: ["$type", "article"] }, 1, 0] }
                        },
                        avgImpressions: { $avg: "$impressionCount" },
                        avgComments: { $avg: "$commentCount" },
                        avgShares: { $avg: "$shareCount" }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
            ]),

            // Job Analytics
            Job.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                            day: { $dayOfMonth: "$createdAt" }
                        },
                        newJobs: { $sum: 1 },
                        totalApplications: { $sum: "$applicationCount" },
                        avgApplicationsPerJob: { $avg: "$applicationCount" },
                        remoteJobs: {
                            $sum: { $cond: [{ $eq: ["$locationType", "remote"] }, 1, 0] }
                        }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
            ]),

            // Engagement Metrics
            Post.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: "$type",
                        count: { $sum: 1 },
                        avgEngagement: {
                            $avg: {
                                $add: [
                                    "$impressionCount",
                                    "$commentCount",
                                    "$shareCount"
                                ]
                            }
                        },
                        topReactions: {
                            $push: {
                                $cond: [
                                    { $gt: ["$impressionCount", 100] },
                                    {
                                        postId: "$_id",
                                        reactions: "$impressionCount"
                                    },
                                    null
                                ]
                            }
                        }
                    }
                }
            ]),

            // Content Distribution by Industry/Category
            Post.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: "$user"
                },
                {
                    $group: {
                        _id: "$user.industry",
                        postCount: { $sum: 1 },
                        avgEngagement: {
                            $avg: {
                                $add: [
                                    "$impressionCount",
                                    "$commentCount",
                                    "$shareCount"
                                ]
                            }
                        }
                    }
                },
                { $sort: { postCount: -1 } }
            ])
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                timeRange: {
                    start: startDate,
                    end: endDate
                },
                posts: {
                    daily: postAnalytics,
                    engagementByType: engagementMetrics,
                    distributionByIndustry: contentDistribution
                },
                jobs: jobAnalytics
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

