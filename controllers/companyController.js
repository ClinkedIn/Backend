const companyModel = require('../models/companyModel');
const userModel = require('../models/userModel');
const postModel = require('../models/postModel');
const customError = require('./../utils/customError');
const {
    uploadFile,
    uploadMultipleImages,
    deleteFileFromUrl,
} = require('../utils/cloudinaryUpload');
const APIFeatures = require('../utils/apiFeatures');
const slugify = require('slugify');
// Create a new company
const createCompany = async (req, res) => {
    try {
        const {
            name,
            address,
            website,
            industry,
            organizationSize,
            organizationType,
            tagLine,
            location,
        } = req.body;
        if (
            !name ||
            !address ||
            !industry ||
            !organizationSize ||
            !organizationType
        ) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const organizationSizeEnum =
            companyModel.schema.path('organizationSize').enumValues;
        const organizationTypeEnum =
            companyModel.schema.path('organizationType').enumValues;

        if (!organizationSizeEnum.includes(organizationSize)) {
            return res.status(400).json({
                message: `Invalid organization size. Valid options are: ${organizationSizeEnum.join(
                    ', '
                )}`,
            });
        }
        if (!organizationTypeEnum.includes(organizationType)) {
            return res.status(400).json({
                message: `Invalid organization type. Valid options are: ${organizationTypeEnum.join(
                    ', '
                )}`,
            });
        }
        const cleanAddress = slugify(address, { lower: true, strict: true });

        const existingCompany = await companyModel.findOne({
            address: cleanAddress,
        });
        if (existingCompany) {
            return res.status(400).json({
                message: 'Company with this address already exists',
            });
        }
        const object = {
            name,
            address: cleanAddress,
            industry,
            organizationSize,
            organizationType,
        };

        let logo = null;
        if (req.file) {
            if (!req.file.mimetype.startsWith('image/')) {
                return res
                    .status(400)
                    .json({ message: 'Please upload an image file' });
            }
            try {
                const uploadResult = await uploadFile(
                    req.file.buffer,
                    req.file.mimetype
                );
                logo = uploadResult.url;
            } catch (err) {
                console.error('Error uploading file:', err);
                return res.status(500).json({
                    message: 'Failed to upload image',
                });
            }
        }
        if (logo) {
            object.logo = logo;
        }

        const protocol = req.protocol;
        const host = req.get('host'); // e.g., yourdomain.com
        const pageURL = `${protocol}://${host}/companies/${cleanAddress}`;

        const admins = [req.user.id]; // Add the creator as an admin

        object.admins = admins;
        object.ownerId = req.user.id; // Add the creator as the owner
        if (website) {
            object.website = website;
        }
        if (tagLine) {
            object.tagLine = tagLine;
        }
        if (location) {
            object.location = location;
        }

        const newCompany = new companyModel(object);
        // Save the new company to the database
        await newCompany.save();
        // Add the company to the creator's list of companies

        await userModel.findByIdAndUpdate(req.user.id, {
            $push: { companies: newCompany._id },
        });
        res.status(201).json({
            ...newCompany.toObject(),
            pageURL, // Include full URL in response
        });
    } catch (error) {
        console.error('Error creating company:', error);
        res.status(500).json({ message: 'Internal server error ' });
    }
};

// Get all companies
const getAllCompanies = async (req, res) => {
    try {
        const features = new APIFeatures(companyModel.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const companies = await features.query;
        res.status(200).json(companies);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get a specific company by ID
const getCompany = async (req, res) => {
    try {
        let company = null;

        if (req.params.companyId) {
            const slug = slugify(req.params.companyId, {
                lower: true,
                strict: true,
            });
            company = await companyModel.findOne({
                address: slug,
            });

            if (!company) {
                company = await companyModel.findById(req.params.companyId);
            }
        }
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.status(200).json(company);
    } catch (error) {
        console.error('Error fetching company:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update a company by ID
const updateCompany = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        console.log('Company ID:', companyId);
        // Find the company to update
        const company = await companyModel.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // Check authorization - only owner or admin can update
        if (
            company.ownerId.toString() !== req.user.id &&
            !company.admins.some((admin) => admin.toString() === req.user.id)
        ) {
            return res.status(403).json({
                message: 'Not authorized to update this company',
            });
        }

        // Extract fields from request body
        const {
            name,
            address,
            website,
            industry,
            organizationSize,
            organizationType,
            tagLine,
            location,
        } = req.body;

        // Create update object with only provided fields
        const updateData = {};
        if (name) updateData.name = name;
        if (website) updateData.website = website;
        if (industry) updateData.industry = industry;
        if (tagLine) updateData.tagLine = tagLine;
        if (location) updateData.location = location;

        // Validate organization size if provided
        if (organizationSize) {
            const organizationSizeEnum =
                companyModel.schema.path('organizationSize').enumValues;
            if (!organizationSizeEnum.includes(organizationSize)) {
                return res.status(400).json({
                    message: `Invalid organization size. Valid options are: ${organizationSizeEnum.join(
                        ', '
                    )}`,
                });
            }
            updateData.organizationSize = organizationSize;
        }

        // Validate organization type if provided
        if (organizationType) {
            const organizationTypeEnum =
                companyModel.schema.path('organizationType').enumValues;
            if (!organizationTypeEnum.includes(organizationType)) {
                return res.status(400).json({
                    message: `Invalid organization type. Valid options are: ${organizationTypeEnum.join(
                        ', '
                    )}`,
                });
            }
            updateData.organizationType = organizationType;
        }

        // Handle address update (which requires slugifying and uniqueness check)
        if (address) {
            const cleanAddress = slugify(address, {
                lower: true,
                strict: true,
            });

            // Check if new address conflicts with any existing company except the current one
            const existingCompany = await companyModel.findOne({
                address: cleanAddress,
                _id: { $ne: companyId }, // Exclude current company from check
            });

            if (existingCompany) {
                return res.status(400).json({
                    message: 'Company with this address already exists',
                });
            }

            updateData.address = cleanAddress;
        }

        // Handle logo upload if file is included
        if (req.file) {
            if (!req.file.mimetype.startsWith('image/')) {
                return res
                    .status(400)
                    .json({ message: 'Please upload an image file' });
            }

            try {
                const uploadResult = await uploadFile(
                    req.file.buffer,
                    req.file.mimetype
                );
                updateData.logo = uploadResult.url;
            } catch (err) {
                console.error('Error uploading file:', err);
                return res.status(500).json({
                    message: 'Failed to upload image',
                });
            }
        }

        // Update the company
        const updatedCompany = await companyModel.findByIdAndUpdate(
            companyId,
            updateData,
            { new: true, runValidators: true } // Return updated doc and run schema validators
        );

        // Generate page URL for response
        const protocol = req.protocol;
        const host = req.get('host');
        const pageURL = `${protocol}://${host}/companies/${updatedCompany.address}`;

        // Return the updated company
        res.status(200).json({
            ...updatedCompany.toObject(),
            pageURL,
        });
    } catch (error) {
        console.error('Error updating company:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a company by ID
const deleteCompany = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        // Find the company to delete
        const company = await companyModel.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // Check authorization - only owner or admin can delete
        if (
            company.ownerId.toString() !== req.user.id &&
            !company.admins.some((admin) => admin.toString() === req.user.id)
        ) {
            return res.status(403).json({
                message: 'Not authorized to delete this company',
            });
        }

        // Soft delete the company by setting isDeleted to true
        company.isDeleted = true;
        await company.save();

        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createPost = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const company = await companyModel.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        // Check authorization - only owner or admin can create posts
        if (
            company.ownerId.toString() !== req.user.id &&
            !company.admins.some((admin) => admin.toString() === req.user.id)
        ) {
            return res.status(403).json({
                message: 'Not authorized to create posts for this company',
            });
        }

        // Create the post using the utility function
        let post = null;
        try {
            post = await createPostUtils(req, 'Company');
        } catch (postError) {
            console.error('Error creating post:', postError);
            return res
                .status(postError.statusCode)
                .json({ message: postError.message });
        }
        // Add the post to the company's posts array
        company.posts.push(post._id);
        await company.save();

        let owner = null;
        try {
            owner = await getPostOwnerUtils(post);
        } catch (err) {
            return res.status(err.statusCode).json({ message: err.message });
        }

        res.status(201).json({
            message: 'Post created successfully',
            post: post,
            owner,
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updatePost = async (req, res) => {
    try {
        const { postId, companyId } = req.params;
        const userId = req.user.id;

        // Validate required params
        if (!postId || !companyId) {
            return res.status(400).json({
                message: !postId
                    ? 'Post ID is required'
                    : 'Company ID is required',
            });
        }

        // Fetch post and validate ownership
        const post = await postModel.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.owner.type !== 'Company') {
            return res.status(403).json({
                message: 'This route is only for company posts',
            });
        }

        if (post.owner.id.toString() !== companyId) {
            return res.status(403).json({
                message: 'This post does not belong to the provided company',
            });
        }

        if (!post.isActive) {
            return res
                .status(400)
                .json({ message: 'Cannot update inactive posts' });
        }

        // Fetch company and user
        const [company, user] = await Promise.all([
            companyModel.findById(companyId),
            userModel.findById(userId),
        ]);

        if (!company || !user) {
            return res.status(404).json({
                message: !company ? 'Company not found' : 'User not found',
            });
        }

        // Check user is owner or admin
        const isOwner = company.ownerId.toString() === userId;
        const isAdmin = company.admins.some(
            (admin) => admin.toString() === userId
        );

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message:
                    'You are not authorized to update posts for this company',
            });
        }

        // Update post using utility
        let updatedPost;
        try {
            updatedPost = await updatePostUtils(req, postId);
        } catch (err) {
            return res
                .status(err.statusCode || 500)
                .json({ message: err.message });
        }

        let owner = null;
        try {
            owner = await getPostOwnerUtils(updatedPost);
        } catch (err) {
            return res
                .status(err.statusCode || 500)
                .json({ message: err.message });
        }

        res.status(200).json({
            message: 'Post updated successfully',
            post: updatedPost,
            owner,
        });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({
            message: 'Failed to update post',
            error: error.message,
        });
    }
};

const deletePost = async (req, res) => {};

const addAdmin = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const userId = req.body.userId; // User ID to be added as admin

        // Validate required params
        if (!companyId || !userId) {
            return res.status(400).json({
                message: !companyId
                    ? 'Company ID is required'
                    : 'User ID is required',
            });
        }

        // Fetch company and validate ownership
        const company = await companyModel.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        if (company.ownerId.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'Only the owner can add admins',
            });
        }

        // Check if user is already an admin
        if (company.admins.includes(userId)) {
            return res.status(400).json({
                message: 'User is already an admin of this company',
            });
        }

        // Add user as admin
        company.admins.push(userId);
        await company.save();

        res.status(200).json({
            message: 'User added as admin successfully',
            admins: company.admins,
        });
    } catch (error) {
        console.error('Error adding admin:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const removeAdmin = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const userId = req.body.userId; // User ID to be removed as admin

        // Validate required params
        if (!companyId || !userId) {
            return res.status(400).json({
                message: !companyId
                    ? 'Company ID is required'
                    : 'User ID is required',
            });
        }

        // Fetch company and validate ownership
        const company = await companyModel.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        if (company.ownerId.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'Only the owner can remove admins',
            });
        }

        // Check if user is an admin
        if (!company.admins.includes(userId)) {
            return res.status(400).json({
                message: 'User is not an admin of this company',
            });
        }

        // Remove user as admin
        company.admins = company.admins.filter(
            (admin) => admin.toString() !== userId
        );
        await company.save();

        res.status(200).json({
            message: 'User removed as admin successfully',
            admins: company.admins,
        });
    } catch (error) {
        console.error('Error removing admin:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Follow a company
const followCompany = async (req, res) => {
    try {
        const userId = req.user.id;
        const companyId = req.params.companyId;
        const company = await companyModel.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (company.followers.includes(userId)) {
            return res.status(400).json({
                message: 'You are already following this company',
            });
        }
        company.followers.push(userId);
        await company.save();
        user.followingCompanies.push(companyId);
        await user.save();
        res.status(200).json({
            message: 'Successfully followed the company',
        });
    } catch (error) {
        console.error('Error following company:', error);
        res.status(500).json({ message: 'Interal server error' });
    }
};

// Unfollow a company
const unfollowCompany = async (req, res) => {
    try {
        const userId = req.user.id;
        const companyId = req.params.companyId;

        const company = await companyModel.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user is actually following the company
        if (
            !company.followers.some(
                (followerId) => followerId.toString() === userId
            )
        ) {
            return res.status(400).json({
                message: 'You are not following this company',
            });
        }

        // Remove user from company's followers
        company.followers = company.followers.filter(
            (followerId) => followerId.toString() !== userId
        );
        await company.save();

        // Remove company from user's followingCompanies
        user.followingCompanies = user.followingCompanies.filter(
            (compId) => compId.toString() !== companyId
        );
        await user.save();

        res.status(200).json({
            message: 'Successfully unfollowed the company',
        });
    } catch (error) {
        console.error('Error unfollowing company:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Add a visitor to the company's visitors list
const addVisitor = async (req, res) => {
    try {
        const company = await companyModel.findById(req.params.companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        const userId = req.body.userId;
        if (!userId) {
            return res
                .status(400)
                .json({ message: 'User ID is required to add a visitor' });
        }
        if (!company.visitors.includes(userId)) {
            company.visitors.push(userId);
        }
        const updatedCompany = await company.save();
        res.status(200).json(updatedCompany);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCompany,
    getAllCompanies,
    getCompany,
    updateCompany,
    deleteCompany,
    createPost,
    updatePost,
    deletePost,
    followCompany,
    unfollowCompany,
    addVisitor,
    addAdmin,
    removeAdmin,
};
