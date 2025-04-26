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

const helper = (company, user) => {
    const followers = company.followers.map((follower) => {
        return {
            id: follower.entity.toString(),
            entityType: follower.entityType,
            followedAt: follower.followedAt,
        };
    });

    const following = company.following.map((following) => {
        return {
            id: following.entity.toString(),
            entityType: following.entityType,
            followedAt: following.followedAt,
        };
    });
    let userRelationship = 'visitor'; // Default relationship

    // Check ownership first (highest priority)
    const isOwner = company.ownerId.toString() === user.id;
    if (isOwner) {
        userRelationship = 'owner';
    } else {
        // Check if user is an admin
        const isAdmin = company.admins.some(
            (admin) => admin.toString() === user.id
        );
        if (isAdmin) {
            userRelationship = 'admin';
        } else {
            // Check if user is a follower
            const isFollower = company.followers.some(
                (follower) => follower.entity.toString() === user.id
            );
            if (isFollower) {
                userRelationship = 'follower';
            }
        }
    }

    return {
        company: {
            id: company._id,
            name: company.name,
            address: company.address,
            website: company.website,
            location: company.location,
            tagLine: company.tagLine,
            posts: company.posts,
            logo: company.logo,
            industry: company.industry,
            organizationSize: company.organizationSize,
            followersCount: company.followers.length,
        },
        userRelationship,
    };
};

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
        } else {
            object.logo = null;
        }

        const protocol = req.protocol;
        const host = req.get('host'); // e.g., yourdomain.com
        const pageURL = `${protocol}://${host}/companies/${cleanAddress}`;

        const admins = [req.user.id]; // Add the creator as an admin

        object.admins = admins;
        object.ownerId = req.user.id; // Add the creator as the owner
        if (website) {
            object.website = website;
        } else {
            object.website = null;
        }
        if (tagLine) {
            object.tagLine = tagLine;
        } else {
            object.tagLine = null;
        }

        if (location) {
            object.location = location;
        } else {
            object.location = null;
        }

        const newCompany = new companyModel(object);
        // Save the new company to the database
        await newCompany.save();
        // Add the company to the creator's list of companies

        await userModel.findByIdAndUpdate(req.user.id, {
            $push: { companies: newCompany._id },
        });

        const representation = helper(newCompany, req.user);

        res.status(201).json({
            ...representation,
            pageURL, // Include full URL in response
            message: 'Company created successfully',
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

        if (!companies || companies.length === 0) {
            return res.status(404).json({ message: 'No companies found' });
        }
        const formattedCompanies = companies.map((company) => {
            return { ...helper(company, req.user) };
        });

        res.status(200).json(formattedCompanies);
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

        const representation = helper(company, req.user);

        if (
            representation.userRelationship === 'visitor' ||
            representation.userRelationship === 'follower'
        ) {
            // if the user is a visitor, we need to add him to company's visitors list
            // Get today's start date (midnight)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Check if user already visited today
            const existingVisit = company.visitors.find(
                (visitor) => visitor.id.toString() === req.user.id
            );

            if (existingVisit) {
                // Convert visitedAt to date object if it's a string
                const visitDate = new Date(existingVisit.visitedAt);
                visitDate.setHours(0, 0, 0, 0);

                // Check if last visit was before today
                if (visitDate < today) {
                    // Update the visit date to now
                    existingVisit.visitedAt = new Date();
                    await company.save();
                }
                // If they already visited today, do nothing
            } else {
                // Add new visitor
                company.visitors.push({
                    id: req.user.id,
                    visitedAt: new Date(),
                });
                await company.save();
            }
        }

        res.status(200).json({ ...representation });
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

        const representation = helper(updatedCompany, req.user);
        res.status(200).json({
            representation,
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
        let { description, taggedUsers, whoCanSee, whoCanComment } = req.body;
        const userId = req.user.id; // From authentication middleware
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
        let newPost;
        try {
            if (!description || description.trim() === '') {
                return res
                    .status(400)
                    .json({ message: 'Post description is required' });
            }

            // Initialize post object
            const newPostData = {
                companyId,
                description,
                attachments: [],
                taggedUsers: taggedUsers || [],
                whoCanSee: whoCanSee || 'anyone',
                whoCanComment: whoCanComment || 'anyone',
            };
            if (req.files && req.files.length > 0) {
                try {
                    // Use the helper function to handle attachments
                    newPostData.attachments = await uploadPostAttachments(
                        req.files
                    );
                } catch (uploadError) {
                    return res
                        .status(400)
                        .json({ message: uploadError.message });
                }
            }
            const newPost = await postModel.create(newPostData);
            const postResponse = {
                postId: newPost._id,
                companyId: {
                    id: company._id,
                    name: company.name,
                    address: company.address,
                    logo: company.logo,
                    industry: company.industry,
                    organizationSize: company.organizationSize,
                    organizationType: company.organizationType,
                }, // Original user ID reference
                firstName: null,
                lastName: null,
                headline: null,
                postDescription: newPost.description,
                attachments: newPost.attachments,
                impressionTypes: [],
                impressionCounts: newPost.impressionCounts,
                commentCount: newPost.commentCount,
                repostCount: newPost.repostCount,
                createdAt: newPost.createdAt,
                taggedUsers: newPost.taggedUsers,
            };
            company.posts.push(newPost._id); // Add post ID to company's posts array
            await company.save();

            res.status(201).json({
                message: 'Post created successfully',
                post: postResponse,
            });
        } catch (error) {
            console.error('Error creating post:', error);
            res.status(500).json({
                message: 'Failed to create post',
                error: error.message,
            });
        }
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({
            message: 'Failed to create post',
            error: error.message,
        });
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

        const companyFollowers = company.followers;

        for (let i = 0; i < companyFollowers.length; i++) {
            if (companyFollowers[i].entity.toString() === userId) {
                return res.status(400).json({
                    message: 'You are already following this company',
                });
            }
        }

        companyFollowers.push({
            entity: userId,
            entityType: 'User',
            followedAt: Date.now(),
        });
        company.followers = companyFollowers;

        const userFollowing = user.following;

        for (let i = 0; i < userFollowing.length; i++) {
            if (userFollowing[i].entity.toString() === companyId) {
                return res.status(400).json({
                    message: 'You are already following this company',
                });
            }
        }
        userFollowing.push({
            entity: companyId,
            entityType: 'Company',
            followedAt: Date.now(),
        });
        user.followingCompanies = userFollowing;
        await company.save();
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

        // Check if the user is actually following the company using entity field
        const isFollowing = company.followers.some(
            (follower) =>
                follower.entity.toString() === userId &&
                follower.entityType === 'User'
        );

        if (!isFollowing) {
            return res.status(400).json({
                message: 'You are not following this company',
            });
        }

        // Remove user from company's followers
        company.followers = company.followers.filter(
            (follower) =>
                !(
                    follower.entity.toString() === userId &&
                    follower.entityType === 'User'
                )
        );
        await company.save();

        // Remove company from user's followingCompanies
        const userFollowingCompanies = user.following || [];
        user.following = userFollowingCompanies.filter(
            (following) =>
                !(
                    following.entity.toString() === companyId &&
                    following.entityType === 'Company'
                )
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

const getFollowers = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const { page = 1, limit = 10 } = req.query;

        // Convert query parameters to numbers with validation
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10)); // Limit between 1 and 50
        const skipIndex = (pageNum - 1) * limitNum;

        // Verify company exists
        const company = await companyModel.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const isAdmin = company.admins.some(
            (admin) => admin.toString() === req.user.id
        );

        if (!isAdmin) {
            return res.status(403).json({
                message:
                    'You are not authorized to see followers of this company',
            });
        }

        // Get total count for pagination
        const totalFollowers = company.followers.length;

        // Apply pagination to followers array
        const paginatedFollowers = company.followers.slice(
            skipIndex,
            skipIndex + limitNum
        );

        // Extract user IDs from the followers who are users
        const userFollowerIds = paginatedFollowers
            .filter((follower) => follower.entityType === 'User')
            .map((follower) => follower.entity);

        // Fetch user details in a single query
        const userDetails = await userModel
            .find(
                {
                    _id: { $in: userFollowerIds },
                    isActive: true,
                },
                {
                    firstName: 1,
                    lastName: 1,
                    profilePicture: 1,
                    location: 1,
                    industry: 1,
                    mainEducation: 1,
                    'about.description': 1,
                    profilePrivacySettings: 1,
                    education: 1,
                }
            )
            .lean();

        // Create a map for quick lookup of user details
        const userMap = {};
        userDetails.forEach((user) => {
            userMap[user._id.toString()] = user;
        });

        // Create the enhanced followers array with all requested details
        const enhancedFollowers = paginatedFollowers.map((follower) => {
            const followerId = follower.entity.toString();
            const followerDetails = userMap[followerId] || null;

            if (!followerDetails || follower.entityType !== 'User') {
                // Handle company followers or missing users
                return {
                    id: followerId,
                    entityType: follower.entityType,
                    followedAt: follower.followedAt,
                };
            }

            // Get the main education if specified
            let mainEducationDetails = null;
            if (
                followerDetails.mainEducation !== null &&
                followerDetails.education &&
                followerDetails.education.length > followerDetails.mainEducation
            ) {
                mainEducationDetails =
                    followerDetails.education[followerDetails.mainEducation];
            }

            // Return enhanced user follower
            return {
                id: followerId,
                firstName: followerDetails.firstName,
                lastName: followerDetails.lastName,
                profilePicture: followerDetails.profilePicture,
                location: followerDetails.location,
                industry: followerDetails.industry,
                mainEducation: mainEducationDetails,
                bio: followerDetails.about?.description || null,
                profilePrivacySettings: followerDetails.profilePrivacySettings,
                followedAt: follower.followedAt,
            };
        });

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalFollowers / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;

        res.status(200).json({
            message: 'Followers fetched successfully',
            followers: enhancedFollowers,
            pagination: {
                total: totalFollowers,
                page: pageNum,
                limit: limitNum,
                pages: totalPages,
                hasNextPage,
                hasPrevPage,
            },
        });
    } catch (error) {
        console.error('Error fetching followers:', error);
        res.status(500).json({ message: 'Internal server error' });
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
    addAdmin,
    removeAdmin,
    getFollowers,
};
