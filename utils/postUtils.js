const cloudinary = require('../utils/cloudinary');
const {
    uploadFile,
    uploadMultipleImages,
    deleteFileFromUrl,
} = require('../utils/cloudinaryUpload');

const postModel = require('../models/postModel');
const userModel = require('../models/userModel');
const companyModel = require('../models/companyModel');
const customError = require('./customError');
const uploadPostAttachments = async (files) => {
    // Return empty array if no files
    if (!files || files.length === 0) {
        return [];
    }

    // Validate number of attachments
    if (files.length > 10) {
        throw new Error('Maximum 10 files allowed per post');
    }

    // Check if there's more than one video
    const videoFiles = files.filter((file) =>
        file.mimetype.startsWith('video/')
    );

    if (videoFiles.length > 0 && files.length > 1) {
        throw new Error(
            'Videos must be uploaded alone without other attachments'
        );
    }

    // Validate file sizes
    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
    const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

    for (const file of files) {
        const isVideo = file.mimetype.startsWith('video/');
        const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;

        if (file.size > maxSize) {
            throw new Error(
                `File ${file.originalname} exceeds maximum size limit`
            );
        }
    }

    // Upload files to Cloudinary
    try {
        const uploadResults = await uploadMultipleImages(files);
        return uploadResults.map((result) => result.url);
    } catch (error) {
        console.error('Error in uploadPostAttachments:', error);
        throw new Error(`Failed to upload files: ${error.message}`);
    }
};

const createPostUtils = async (req, ownerType) => {
    const userId = req.user.id;

    let owner = null;
    if (ownerType === 'User') {
        owner = { id: userId, type: 'User' };
    } else if (ownerType === 'Company') {
        const companyId = req.params.companyId;
        owner = { id: companyId, type: 'Company' };
    }

    if (!owner) {
        throw new customError(
            'Invalid owner type. Must be either User or Company',
            400
        );
    }

    let { description, taggedUsers, whoCanSee, whoCanComment } = req.body;

    // Validate required fields
    if (!description || description.trim() === '') {
        throw new customError('Post description is required', 400);
    }

    const newPostData = {
        owner,
        description,
        attachments: [],
        taggedUsers: taggedUsers || [],
        whoCanSee: whoCanSee || 'anyone',
        whoCanComment: whoCanComment || 'anyone',
    };

    // Handle file uploads if present
    if (req.files && req.files.length > 0) {
        try {
            // Use the helper function to handle attachments
            newPostData.attachments = await uploadPostAttachments(req.files);
        } catch (uploadError) {
            throw new customError('Error uploading attachments', 500);
        }
    }
    let post = null;
    try {
        post = await postModel.create(newPostData);
    } catch (error) {
        console.log(error);
        throw new customError('Error creating post', 500);
    }
    return post;
};

const updatePostUtils = async (req, postId) => {
    const { description, taggedUsers } = req.body;
    const updateData = {};

    if (description !== undefined) {
        // Validate description if provided
        if (description.trim() === '') {
            throw new customError('Post description cannot be empty', 400);
        }
        updateData.description = description;
    }

    if (taggedUsers !== undefined) {
        updateData.taggedUsers = taggedUsers;
    }
    // Only perform update if there are changes
    if (Object.keys(updateData).length === 0) {
        throw new customError('No valid fields to update', 400);
    }

    const updatedPost = await postModel.findByIdAndUpdate(
        postId,
        { ...updateData, updatedAt: Date.now() },
        {
            new: true,
            runValidators: true,
        }
    );
    if (!updatedPost) {
        throw new customError('Post not found', 404);
    }
    return updatedPost;
};

const getPostOwnerUtils = async (post) => {
    let owner = {};
    if (post.owner.type === 'User') {
        const user = await userModel
            .findById(post.owner.id)
            .select('-password');
        if (!user) {
            throw new customError('User not found', 404);
        }
        owner = {
            id: user._id,
            name: user.firstName + ' ' + user.lastName,
            headline: user.headline,
            profilePicture: user.profilePicture,
        };
    } else if (post.owner.type === 'Company') {
        const company = await companyModel
            .findById(post.owner.id)
            .select('-password');
        if (!company) {
            throw new customError('Company not found', 404);
        }
        owner = {
            id: company._id,
            name: company.name,
            profilePicture: company.logo,
            headline: company.description,
        };
    }
    return owner;
};

module.exports = {
    uploadPostAttachments,
    createPostUtils,
    updatePostUtils,
    getPostOwnerUtils,
};
