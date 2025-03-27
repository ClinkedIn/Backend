const userModel = require('../models/userModel');
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

// Add to module exports
module.exports = {
    searchUsers
};