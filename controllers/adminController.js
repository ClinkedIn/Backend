const Report = require('../models/reportModel');
const Job = require('../models/jobModel');
const User = require('../models/userModel');
const Post = require('../models/postModel');
const Company = require('../models/companyModel');


// Reports monitoring
exports.getAllReports = async (req, res) => {
    try {
        let reports = await Report.find()
            .populate({
                path: 'userId',
                select: 'firstName lastName email'
            });

        // Process each report to add reportedUser or reportedPost
        const processedReports = await Promise.all(reports.map(async report => {
            let upreport = {};
            if (report.reportedType === 'User') {
                const reportedUser = await User.findById(report.reportedId, 'firstName lastName email');
                upreport = {
                    reportedUser: reportedUser,
                    report: report
                };
            } else if (report.reportedType === 'Post') {
                const reportedPost = await Post.findById(report.reportedId, 'attachments description');
                upreport = {
                    reportedPost: reportedPost,
                    report: report
                };
            }
            return upreport;
        }));

        res.status(200).json({
            status: 'success',
            data: processedReports
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
        // console.log(req.params.reportId);
        const report = await Report.findOne({ _id: req.params.reportId })
        .populate({
        path: 'userId',
        select: 'firstName lastName email'
    })
        // console.log(report.reportedType);

        let  upreport = {};
        if (report.reportedType === 'User') {
            
            const reportedUser = await User.findById(report.reportedId, 'firstName lastName email');
             upreport = {
                 reportedUser: reportedUser,
                 report: report
            }
            
        } else if (report.reportedType === 'Post') {
            const reportedPost = await Post.findById(report.reportedId, 'attachments description')
             upreport = {
                 reportedPost: reportedPost,
                 report: report
            }
        }
        
        
    if (!report) {
        return res.status(404).json({
            status: 'fail',
            message: 'Report not found'
        });
    }

    res.status(200).json({
        status: 'success',
        data: upreport
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
        console.log(action, reason);

        const report = await Report.findById(req.params.reportId);

        if (!report) {
            return res.status(404).json({
                status: 'fail',
                message: 'Report not found'
            });
        }

        report.status = action;
        report.moderationReason = reason;
        report.moderatedAt = Date.now();

        await report.save();

        const populatedReport = await Report.findById(req.params.reportId).populate({
            path: 'userId',
            select: 'firstName lastName email'
        });

        res.status(200).json({
            status: 'success',
            data: populatedReport
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



exports.getAnalyticsOverview = async (req, res) => {
    ;
    try {
        const [userStatsAggregation, postStatsAggregation, jobStatsAggregation, companyStatsAggregation] = await Promise.all([
            User.aggregate([
                {
                    $facet: {
                        totalUsers: [{ $count: 'count' }],
                        activeUsers: [{ $match: { isActive: true } }, { $count: 'count' }],
                        premiumUsers: [{ $match: { isPremium: true } }, { $count: 'count' }],
                        usersByIndustry: [{ $group: { _id: "$industry", count: { $sum: 1 } } }],
                        averageConnections: [
                            { $project: { connectionCount: { $size: "$connectionList" } } },
                            { $group: { _id: null, average: { $avg: "$connectionCount" } } }
                        ],
                        usersByProfilePrivacy: [{ $group: { _id: "$profilePrivacySettings", count: { $sum: 1 } } }],
                        usersByConnectionRequestPrivacy: [{ $group: { _id: "$connectionRequestPrivacySetting", count: { $sum: 1 } } }],
                        usersByDefaultMode: [{ $group: { _id: "$defaultMode", count: { $sum: 1 } } }],
                        employmentTypeCounts: [
                            { $unwind: "$workExperience" },
                            { $group: { _id: "$workExperience.employmentType", count: { $sum: 1 } } }
                        ]
                    }
                },
                {
                    $project: {
                        totalUsers: { $arrayElemAt: ["$totalUsers.count", 0] },
                        activeUsers: { $arrayElemAt: ["$activeUsers.count", 0] },
                        premiumUsers: { $arrayElemAt: ["$premiumUsers.count", 0] },
                        usersByIndustry: 1,
                        averageConnections: { $arrayElemAt: ["$averageConnections.average", 0] },
                        usersByProfilePrivacy: 1,
                        usersByConnectionRequestPrivacy: 1,
                        usersByDefaultMode: 1,
                        employmentTypeCounts: 1
                    }
                }
            ]),
            Post.aggregate([
                {
                    $facet: {
                        totalPosts: [{ $count: "count" }],
                        activePosts: [{ $match: { isActive: true } }, { $count: "count" }],
                        totalImpressions: [
                            {
                                $group: {
                                    _id: null,
                                    total: {
                                        $sum: "$impressionCounts.total"
                                    }
                                }
                            }
                        ],
                        averageEngagement: [
                            {
                                $group: {
                                    _id: null,
                                    avgImpressions: { $avg: "$impressionCounts.total" },
                                    avgComments: { $avg: "$commentCount" },
                                    avgReposts: { $avg: "$repostCount" }
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        totalPosts: { $arrayElemAt: ["$totalPosts.count", 0] },
                        activePosts: { $arrayElemAt: ["$activePosts.count", 0] },
                        totalImpressions: { $arrayElemAt: ["$totalImpressions.total", 0] },
                        averageEngagement: { $arrayElemAt: ["$averageEngagement", 0] }
                    }
                }
            ]),
            Job.aggregate([
                {
                    $facet: {
                        totalJobs: [{ $count: "count" }],
                        activeJobs: [{ $match: { isActive: true } }, { $count: "count" }],
                        jobsByType: [
                            {
                                $group: {
                                    _id: "$jobType",
                                    count: { $sum: 1 }
                                }
                            }
                        ],
                        jobsByWorkplaceType: [
                            {
                                $group: {
                                    _id: "$workplaceType",
                                    count: { $sum: 1 }
                                }
                            }
                        ],
                        averageApplications: [
                            {
                                $project: {
                                    applicationCount: { $size: "$applicants" }
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    average: { $avg: "$applicationCount" }
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        totalJobs: { $arrayElemAt: ["$totalJobs.count", 0] },
                        activeJobs: { $arrayElemAt: ["$activeJobs.count", 0] },
                        jobsByType: 1,
                        jobsByWorkplaceType: 1,
                        averageApplications: { $arrayElemAt: ["$averageApplications.average", 0] }
                    }
                }
            ]),
            Company.aggregate([
                {
                    $facet: {
                        totalCompanies: [{ $count: "count" }],
                        activeCompanies: [{ $match: { isActive: true } }, { $count: "count" }],
                        companiesBySize: [
                            {
                                $group: {
                                    _id: "$organizationSize",
                                    count: { $sum: 1 }
                                }
                            }
                        ],
                        companiesByIndustry: [
                            {
                                $group: {
                                    _id: "$industry",
                                    count: { $sum: 1 }
                                }
                            }
                        ],
                        averageFollowers: [
                            {
                                $project: {
                                    followerCount: { $size: "$followers" }
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    average: { $avg: "$followerCount" }
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        totalCompanies: { $arrayElemAt: ["$totalCompanies.count", 0] },
                        activeCompanies: { $arrayElemAt: ["$activeCompanies.count", 0] },
                        companiesBySize: 1,
                        companiesByIndustry: 1,
                        averageFollowers: { $arrayElemAt: ["$averageFollowers.average", 0] }
                    }
                }
            ])
        ]);

        const userStats = {
            totalUsers: userStatsAggregation[0]?.totalUsers || 0,
            activeUsers: userStatsAggregation[0]?.activeUsers || 0,
            premiumUsers: userStatsAggregation[0]?.premiumUsers || 0,
            usersByIndustry: userStatsAggregation[0]?.usersByIndustry || [],
            averageConnections: Math.round(userStatsAggregation[0]?.averageConnections || 0),
            usersByProfilePrivacy: userStatsAggregation[0]?.usersByProfilePrivacy || [],
            usersByConnectionRequestPrivacy: userStatsAggregation[0]?.usersByConnectionRequestPrivacy || [],
            usersByDefaultMode: userStatsAggregation[0]?.usersByDefaultMode || [],
            employmentTypeCounts: userStatsAggregation[0]?.employmentTypeCounts || []
        };

        const postStats = {
            totalPosts: postStatsAggregation[0]?.totalPosts || 0,
            activePosts: postStatsAggregation[0]?.activePosts || 0,
            totalImpressions: postStatsAggregation[0]?.totalImpressions || 0,
            averageEngagement: {
                impressions: Math.round(postStatsAggregation[0]?.averageEngagement?.avgImpressions || 0),
                comments: Math.round(postStatsAggregation[0]?.averageEngagement?.avgComments || 0),
                reposts: Math.round(postStatsAggregation[0]?.averageEngagement?.avgReposts || 0)
            }
        };

        const jobStats = {
            totalJobs: jobStatsAggregation[0]?.totalJobs || 0,
            activeJobs: jobStatsAggregation[0]?.activeJobs || 0,
            jobsByType: jobStatsAggregation[0]?.jobsByType || [],
            jobsByWorkplaceType: jobStatsAggregation[0]?.jobsByWorkplaceType || [],
            averageApplications: Math.round(jobStatsAggregation[0]?.averageApplications || 0)
        };

        const companyStats = {
            totalCompanies: companyStatsAggregation[0]?.totalCompanies || 0,
            activeCompanies: companyStatsAggregation[0]?.activeCompanies || 0,
            companiesBySize: companyStatsAggregation[0]?.companiesBySize || [],
            companiesByIndustry: companyStatsAggregation[0]?.companiesByIndustry || [],
            averageFollowers: Math.round(companyStatsAggregation[0]?.averageFollowers || 0)
        };

        // Format response data
        const analyticsOverview = {
            userStats: userStats,
            postStats: postStats,
            jobStats: jobStats,
            companyStats: companyStats
        };

        res.status(200).json({
            status: 'success',
            data: analyticsOverview
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};