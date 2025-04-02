const userModel = require('../models/userModel');
const jobModel = require('../models/jobModel');
const companyModel = require('../models/companyModel');
const mongoose = require('mongoose');
const searchUsers = async (req, res) => {
    try {
        const { name, page = 1, limit = 10 } = req.query;
        
        // Validate input
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ 
                message: "Search term must be at least 2 characters" 
            });
        }
        
        // Parse pagination parameters
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skipIndex = (pageNum - 1) * limitNum;
        
        // Create search regex - case insensitive search
        const searchRegex = new RegExp(name, 'i');
        
        // Create query with OR conditions for first and last name
        const query = {
            $or: [
                { firstName: searchRegex },
                { lastName: searchRegex }
            ],
            isActive: true // Only return active users
        };
        
        // Get total count for pagination metadata
        const totalUsers = await userModel.countDocuments(query);
        
        // Execute search with pagination
        const users = await userModel.find(query)
            .select('_id firstName lastName headline profilePicture')
            .skip(skipIndex)
            .limit(limitNum)
            .sort({ firstName: 1, lastName: 1 }); // Sort alphabetically
            
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalUsers / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;
        
        // Return results with pagination metadata
        res.status(200).json({
            message: "Users found successfully",
            users,
            pagination: {
                totalUsers,
                totalPages,
                currentPage: pageNum,
                pageSize: limitNum,
                hasNextPage,
                hasPrevPage
            }
        });
        
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({
            message: 'Failed to search users',
            error: error.message
        });
    }
};

const searchJobs = async (req, res) => {
    try {
        const { 
            q,              // General query for title, description, etc.
            location,       // Specific location query
            industry,       // Industry filter
            companyId,      // Company filter
            minExperience,  // Minimum work experience filter
            page = 1, 
            limit = 10 
        } = req.query;
        
        // Parse pagination parameters
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skipIndex = (pageNum - 1) * limitNum;
        
        // Build the match stage for aggregation pipeline
        const matchStage = {};
        
        // Add general search criteria (searches across multiple fields)
        if (q && q.trim().length >= 2) {
            const searchRegex = new RegExp(q, 'i');
            
            // Search across job title, description, industry, workplace type, and job type
            matchStage.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { industry: searchRegex },
                { workplaceType: searchRegex },
                { jobType: searchRegex }
            ];
            
            // Also include companies matching the industry search
            const relevantCompanies = await companyModel.find({ industry: searchRegex })
                .select('_id')
                .lean();
                
            if (relevantCompanies.length > 0) {
                const companyIds = relevantCompanies.map(company => company._id);
                matchStage.$or.push({ companyId: { $in: companyIds } });
            }
        }
        
        // Add location filter (always treated as an AND condition)
        if (location && location.trim().length >= 2) {
            matchStage.jobLocation = new RegExp(location, 'i');
        }
        
        // Add industry filter (exact match)
        if (industry && industry.trim()) {
            matchStage.industry = industry.trim();
        }
        
        // Add company filter (exact match)
        if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
            matchStage.companyId = new mongoose.Types.ObjectId(companyId);
        }
        
        // Add work experience filter using aggregation
        let workExpFilter = {};
        if (minExperience !== undefined && !isNaN(minExperience) && minExperience >= 0) {
            // Add filter for screening questions with Work Experience that meets minimum requirement
            workExpFilter = {
                screeningQuestions: {
                    $elemMatch: {
                        question: "Work Experience",
                        idealAnswer: { $exists: true }
                    }
                }
            };
            
            Object.assign(matchStage, workExpFilter);
        }
        
        // Build the aggregation pipeline
        const pipeline = [
            { $match: matchStage },
        ];
        
        // If we have a minExperience filter, add a specialized filter stage
        if (minExperience !== undefined && !isNaN(minExperience)) {
            pipeline.push({
                $addFields: {
                    workExpQuestion: {
                        $filter: {
                            input: "$screeningQuestions",
                            as: "question",
                            cond: { $eq: ["$$question.question", "Work Experience"] }
                        }
                    }
                }
            });
            
            // Convert work experience value to a number and filter
            pipeline.push({
                $addFields: {
                    experienceValue: {
                        $let: {
                            vars: {
                                expAnswer: { $arrayElemAt: ["$workExpQuestion.idealAnswer", 0] }
                            },
                            in: { $toDouble: "$$expAnswer" }
                        }
                    }
                }
            });
            
            // Filter by minimum experience
            pipeline.push({
                $match: {
                    experienceValue: { $gte: parseFloat(minExperience) }
                }
            });
        }
        
        // Count total jobs before pagination
        const countPipeline = [...pipeline];
        countPipeline.push({ $count: "total" });
        const countResult = await jobModel.aggregate(countPipeline);
        const totalJobs = countResult.length > 0 ? countResult[0].total : 0;
        
        // Add sorting, pagination, and populate company info
        pipeline.push(
            { $sort: { createdAt: -1 } },
            { $skip: skipIndex },
            { $limit: limitNum },
            {
                $lookup: {
                    from: "companies",
                    localField: "companyId",
                    foreignField: "_id",
                    as: "company"
                }
            },
            {
                $addFields: {
                    company: { $arrayElemAt: ["$company", 0] }
                }
            }
        );
        
        // Execute the pipeline
        const jobs = await jobModel.aggregate(pipeline);
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalJobs / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;
        
        // Format the response
        const formattedJobs = jobs.map(job => ({
            jobId: job._id,
            company: job.company ? {
                id: job.company._id,
                name: job.company.name,
                logo: job.company.logo,
                industry: job.company.industry,
                location: job.company.location,
            } : null,
            title: job.title,
            industry: job.industry,
            workplaceType: job.workplaceType,
            jobLocation: job.jobLocation,
            jobType: job.jobType,
            description: job.description,
            applicationEmail: job.applicationEmail,
            screeningQuestions: job.screeningQuestions?.map(q => ({
                question: q.question,
                specification: q.specification,
                mustHave: q.mustHave
            })),
            createdAt: job.createdAt,
            updatedAt: job.updatedAt
        }));
        
        // Return results with pagination metadata
        res.status(200).json({
            message: formattedJobs.length > 0 ? "Jobs found successfully" : "No jobs match your search criteria",
            jobs: formattedJobs,
            pagination: {
                totalJobs,
                totalPages,
                currentPage: pageNum,
                pageSize: limitNum,
                hasNextPage,
                hasPrevPage
            },
            filters: {
                q: q || null,
                location: location || null,
                industry: industry || null,
                companyId: companyId || null,
                minExperience: minExperience !== undefined ? Number(minExperience) : null
            }
        });
        
    } catch (error) {
        console.error('Error searching jobs:', error);
        res.status(500).json({
            message: 'Failed to search jobs',
            error: error.message
        });
    }
};
// Add to module exports
module.exports = {
    searchUsers,
    searchJobs
};