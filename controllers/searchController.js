const userModel = require('../models/userModel');
const jobModel = require('../models/jobModel');
const companyModel = require('../models/companyModel');
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
            keyword, 
            location, 
            industry, 
            workplaceType,
            jobType,
            page = 1, 
            limit = 10 
        } = req.query;
        
        // Parse pagination parameters
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skipIndex = (pageNum - 1) * limitNum;
        
        // Build the query object
        const query = {};
        
        // Main search criteria group (keyword OR industry OR workplace type OR job type)
        const searchCriteria = [];
        
        // Add keyword search (searches in job description)
        if (keyword && keyword.trim().length >= 2) {
            const keywordRegex = new RegExp(keyword, 'i');
            searchCriteria.push({ description: keywordRegex });
        }
        
        // For industry search, we need to find companies in that industry
        if (industry && industry.trim()) {
            const industryRegex = new RegExp(industry, 'i');
            
            // Find companies in the specified industry
            const companies = await companyModel.find({ industry: industryRegex })
                .select('_id')
                .lean();
            
            const companyIds = companies.map(company => company._id);
            
            // If companies found in this industry, add to search criteria
            if (companyIds.length > 0) {
                searchCriteria.push({ companyId: { $in: companyIds } });
            }
        }
        
        // Add workplace type to search criteria
        if (workplaceType && workplaceType.trim()) {
            searchCriteria.push({ workplaceType: workplaceType });
        }
        
        // Add job type to search criteria
        if (jobType && jobType.trim()) {
            searchCriteria.push({ jobType: jobType });
        }
        
        // If any search criteria were provided, add them as an OR condition
        if (searchCriteria.length > 0) {
            query.$or = searchCriteria;
        }
        
        // Add location filter (separate from the main search group)
        if (location && location.trim()) {
            query.jobLocation = new RegExp(location, 'i');
        }
        
        // Get total count for pagination metadata
        const totalJobs = await jobModel.countDocuments(query);
        
        // Execute search with pagination
        const jobs = await jobModel.find(query)
            .populate('companyId', 'name logo industry location')
            .skip(skipIndex)
            .limit(limitNum)
            .sort({ createdAt: -1 }) // Sort by newest first
            .lean();
            
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalJobs / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;
        
        // Format the response
        const formattedJobs = jobs.map(job => ({
            jobId: job._id,
            company: {
                id: job.companyId._id,
                name: job.companyId.name,
                logo: job.companyId.logo,
                industry: job.companyId.industry,
                location: job.companyId.location,
            },
            workplaceType: job.workplaceType,
            jobLocation: job.jobLocation,
            jobType: job.jobType,
            description: job.description,
            applicationEmail: job.applicationEmail,
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
                keyword: keyword || null,
                location: location || null, 
                industry: industry || null,
                workplaceType: workplaceType || null,
                jobType: jobType || null
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