const userModel = require('../models/userModel');
const postModel = require('../models/postModel');
const commentModel = require('../models/commentModel');
const repostModel = require('../models/repostModel');
const impressionModel = require('../models/impressionModel');
const {
    sortWorkExperience,
    validateSkillName,
    checkUserAccessPermission,
    updateSkillExperienceReferences,
    validateConnectionStatus,
    handlePagination,
} = require('../utils/userProfileUtils');
const cloudinary = require('../utils/cloudinary');
const {
    uploadPicture,
    uploadVideo,
    uploadDocument,
} = require('../utils/filesHandler');
//import { ObjectId } from 'mongodb';
const mongoose = require('mongoose');
const {
    uploadFile,
    uploadMultipleImages,
    deleteFileFromUrl,
} = require('../utils/cloudinaryUpload');
const companyModel = require('../models/companyModel');
const { get } = require('mongoose');
const customError = require('../utils/customError');
const { canSendConnectionRequest } = require('../utils/privacyUtils');

const { sendNotification } = require('../utils/Notification');

const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find the user by ID
        const user = await userModel
            .findById(userId)
            .select(
                '-password -resetPasswordToken -resetPasswordTokenExpiry -verificationToken -refreshToken'
            );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check privacy settings
        const requesterId = req.user.id; // Current authenticated user
        const requester = await userModel
            .findById(requesterId)
            .select('connectionList blockedUsers profilePrivacySettings');
        //If not requesting own profile and profile is private
        if (
            userId !== requesterId &&
            user.profilePrivacySettings === 'private'
        ) {
            return res.status(403).json({ message: 'This profile is private' });
        }

        // If profile is set to connections only, check if they're connected
        if (
            userId !== requesterId &&
            user.profilePrivacySettings === 'connectionsOnly' &&
            !user.connectionList.includes(requesterId)
        ) {
            return res.status(403).json({
                message: 'This profile is only visible to connections',
            });
        }
        if (userId !== requesterId && user.blockedUsers.includes(requesterId)) {
            return res
                .status(403)
                .json({ message: 'This profile is not available' });
        }
        if (requester.blockedUsers.includes(userId)) {
            return res
                .status(403)
                .json({ message: 'This profile is not available' });
        }
        if (userId.isActive === false) {
            return res
                .status(403)
                .json({ message: 'This profile is not available' });
        }
        // const accessCheck = await checkUserAccessPermission(user, requesterId);
        // if (!accessCheck.hasAccess) {
        //     return res.status(accessCheck.statusCode || 403).json({ message: accessCheck.message });
        // }
        const isConnected = user.connectionList.includes(requesterId);
        // ADDED for privacy settings
        const canSendConnection =
            (await canSendConnectionRequest(userId, requesterId)) &&
            userId !== requesterId;
        res.status(200).json({
            message: 'User profile retrieved successfully',
            user,
            canSendConnectionRequest: canSendConnection,
            isConnected,
        });
    } catch (error) {
        console.error('Error retrieving user profile:', error);
        res.status(500).json({
            message: 'Failed to retrieve user profile',
            error: error.message,
        });
    }
};

const getMe = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find the user by ID
        const user = await userModel
            .findById(userId)
            .select(
                '-password -resetPasswordToken -resetPasswordTokenExpiry -verificationToken -refreshToken'
            );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: 'User profile retrieved successfully',
            user,
        });
    } catch (error) {
        console.error('Error retrieving user profile:', error);
        res.status(500).json({
            message: 'Failed to retrieve user profile',
            error: error.message,
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        // Extract query parameters for filtering
        const { name, location, industry, page = 1, limit = 10 } = req.query;

        // Build query filter
        const filter = {};

        if (name) {
            filter.$or = [
                { firstName: { $regex: name, $options: 'i' } },
                { lastName: { $regex: name, $options: 'i' } },
            ];
        }

        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }

        if (industry) {
            filter.industry = { $regex: industry, $options: 'i' };
        }

        // Only return public profiles and the current user's profile
        filter.$or = filter.$or || [];
        filter.$or.push(
            { profilePrivacySettings: 'public' },
            { _id: req.user.id }
        );

        // Pagination setup
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Find users with filtering and pagination
        const users = await userModel
            .find(filter)
            .select(
                'firstName lastName profilePicture location industry mainEducation bio profilePrivacySettings'
            )
            .skip(skip)
            .limit(parseInt(limit));

        // Count total matching documents for pagination info
        const total = await userModel.countDocuments(filter);

        res.status(200).json({
            message: 'Users retrieved successfully',
            users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({
            message: 'Failed to retrieve users',
            error: error.message,
        });
    }
};
/*
 ****************************************************
 ************ PROFILE AND COVER PICTURES ************
 ****************************************************
 */

// Unified User Picture Handling
const handleUserPicture = async (req, res, fieldName, isDelete = false) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        let updateData = {};
        if (isDelete) {
            updateData[fieldName] = null;
        } else {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const { buffer, mimetype, size } = req.file;
            /*
                        try {
                            await validateFile(mimetype, size); // Validate before uploading
                        } catch (validationError) {
                            return res.status(400).json({ message: validationError.message });
                        }
            */
            const uploadResult = await uploadPicture(buffer, mimetype, size);
            updateData[fieldName] = uploadResult.url;
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: `${fieldName
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())} ${
                isDelete ? 'deleted' : 'updated'
            } successfully`,
            ...(isDelete ? {} : { [fieldName]: updateData[fieldName] }),
        });
    } catch (err) {
        if (err instanceof customError) {
            res.status(err.statusCode).json({ message: err.message });
        } else {
            console.error('Error creating message:', err);
            res.status(500).json({
                message: 'Internal server error',
                error: err.message,
            });
        }
    }
};

// Upload Functions
const uploadProfilePicture = (req, res) =>
    handleUserPicture(req, res, 'profilePicture');
const uploadCoverPicture = (req, res) =>
    handleUserPicture(req, res, 'coverPicture');

// Delete Functions
const deleteProfilePicture = (req, res) =>
    handleUserPicture(req, res, 'profilePicture', true);
const deleteCoverPicture = (req, res) =>
    handleUserPicture(req, res, 'coverPicture', true);

const getUserPicture = async (req, res, fieldName) => {
    try {
        const userId = req.user.id;

        // Find the user and retrieve only the required field
        const user = await userModel.findById(userId).select(fieldName);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user[fieldName]) {
            return res.status(400).json({
                message: `${fieldName.replace(/([A-Z])/g, ' $1')} not set`,
            });
        }

        res.status(200).json({ [fieldName]: user[fieldName] });
    } catch (error) {
        console.error(`Error retrieving ${fieldName}:`, error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message,
        });
    }
};
// Get profile picture
const getProfilePicture = (req, res) =>
    getUserPicture(req, res, 'profilePicture');

// Get cover picture
const getCoverPicture = (req, res) => getUserPicture(req, res, 'coverPicture');

/*
 ************************************************
 *********** RESUME UPLOAD ************
 ************************************************
 */
const getResume = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find the user and retrieve only the resume field
        const user = await userModel.findById(userId).select('resume');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.resume) {
            return res.status(400).json({ message: 'Resume not uploaded' });
        }
        // Create a Google Docs viewer URL as fallback
        const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
            user.resume
        )}&embedded=true`;

        res.status(200).json({
            message: 'Resume retrieved successfully',
            resume: user.resume,
            googleDocsUrl: googleDocsUrl,
        });
    } catch (error) {
        console.error('Error retrieving resume:', error);
        res.status(500).json({
            message: 'Failed to retrieve resume',
            error: error.message,
        });
    }
};
const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = req.user.id;

        // Validate file type (allow PDF, DOC, DOCX)
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedMimeTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                message:
                    'Invalid file type. Only PDF, DOC, and DOCX are allowed.',
            });
        }

        // Validate file size (limit: 10MB)
        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        if (req.file.size > MAX_FILE_SIZE) {
            return res.status(400).json({
                message: 'File size too large. Maximum allowed size is 10MB.',
            });
        }

        console.log('Uploading file with mimetype:', 'pdf');

        // Use 'raw' resource type for documents instead of 'document'
        const uploadResult = await uploadFile(req.file.buffer, 'raw');

        if (!uploadResult || !uploadResult.url) {
            throw new Error('Failed to get upload URL from Cloudinary');
        }

        console.log('Cloudinary upload successful:', uploadResult);

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { resume: `https://docs.google.com/viewer?url=${encodeURIComponent(
                uploadResult.url
            )}&embedded=true` },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Resume uploaded successfully',
            resume: `https://docs.google.com/viewer?url=${encodeURIComponent(
                uploadResult.url
            )}&embedded=true`,
        });
    } catch (error) {
        console.error('Error uploading resume:', error);
        res.status(500).json({
            message: 'Failed to upload resume',
            error: error.message,
            details: error.http_code
                ? `HTTP Code: ${error.http_code}`
                : 'Unknown error',
        });
    }
};

const deleteResume = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find user and get current resume URL
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.resume) {
            return res.status(400).json({ message: 'No resume to delete' });
        }

        // Delete file from Cloudinary
        const deleteResult = await deleteFileFromUrl(user.resume);

        if (
            deleteResult.result !== 'ok' &&
            deleteResult.result !== 'no file to delete'
        ) {
            return res.status(500).json({
                message: 'Failed to delete resume from storage',
                details: deleteResult,
            });
        }

        // Update user in database
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { resume: null },
            { new: true }
        );

        res.status(200).json({
            message: 'Resume deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting resume:', error);
        res.status(500).json({
            message: 'Failed to delete resume',
            error: error.message,
        });
    }
};

/*
 ***************************************************
 ***************** WORK EXPERIENCE *****************
 ***************************************************
 */

// Helper function
const validateExperienceData = (data) => {
    if (!data.jobTitle || !data.companyName || !data.fromDate) {
        throw {
            status: 400,
            message: 'Job title, company name, and start date are required',
        };
    }

    const fromDate = new Date(data.fromDate);
    if (isNaN(fromDate.getTime())) {
        throw { status: 400, message: 'Invalid start date format' };
    }

    if (!data.currentlyWorking) {
        if (!data.toDate || isNaN(new Date(data.toDate).getTime())) {
            throw {
                status: 400,
                message:
                    'End date is required and must be a valid date if you are not currently working',
            };
        }
    }

    if (
        !data.employmentType ||
        (data.employmentType &&
            ![
                'Full Time',
                'Part Time',
                'Freelance',
                'Self Employed',
                'Contract',
                'Internship',
                'Apprenticeship',
                'Seasonal',
            ].includes(data.employmentType))
    ) {
        throw { status: 400, message: 'Invalid employment type' };
    }
};

const addExperience = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Extract experience data from request body
        const experienceData = {
            jobTitle: req.body.jobTitle,
            companyName: req.body.companyName,
            fromDate: req.body.fromDate ? new Date(req.body.fromDate) : null,
            toDate: req.body.currentlyWorking
                ? null
                : req.body.toDate
                ? new Date(req.body.toDate)
                : null,
            currentlyWorking: req.body.currentlyWorking,
            employmentType: req.body.employmentType,
            location: req.body.location,
            locationType: req.body.locationType,
            description: req.body.description,
            foundVia: req.body.foundVia,
            skills: req.body.skills || [], // Expecting an array of skills
            media: null,
        };

        validateExperienceData(experienceData);
        console.log('Current Working: ', experienceData.currentlyWorking);
        // Handle media upload if a file is provided
        if (req.file) {
            try {
                const fileBuffer = req.file.buffer;
                const mimeType = req.file.mimetype;
                const fileSize = req.file.size;
                console.log('File Buffer: ', fileBuffer);
                // Upload the file and get the URL
                const uploadData = await uploadPicture(
                    fileBuffer,
                    mimeType,
                    fileSize
                );
                console.log('Upload Data: ', uploadData);
                experienceData.media = uploadData.url;
                console.log('Media added Successfully: ', experienceData.media);
            } catch (error) {
                return res.status(400).json({
                    error: 'Failed to upload media: ' + error.message,
                });
            }
        }
        // Ensure workExperience is initialized as an array
        if (!user.workExperience) {
            user.workExperience = [];
            console.log('Work Experience Initialized');
        }

        // Add the new experience to the user's workExperience array
        user.workExperience.push(experienceData);
        console.log('Experience Added: ', user.workExperience);
        // Sort work experience
        user.workExperience = sortWorkExperience(user.workExperience);
        // Get the index of the newly added experience
        const experienceIndex = user.workExperience.findIndex(
            (exp) =>
                exp.jobTitle === experienceData.jobTitle &&
                exp.companyName === experienceData.companyName &&
                exp.fromDate.getTime() === experienceData.fromDate.getTime()
        );

        // Update skills references if experience is found
        if (experienceIndex !== -1 && experienceData.skills.length > 0) {
            updateSkillExperienceReferences(
                user,
                experienceIndex,
                experienceData.skills,
                []
            );
        }
        console.log('Updated Skills References: ', user.skills);

        // Save the updated user document
        await user.save();

        // Format response
        const responseExperience = {
            ...experienceData,
            fromDate: experienceData.fromDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
            toDate: experienceData.toDate
                ? experienceData.toDate.toISOString().split('T')[0]
                : null,
        };

        // Send response
        return res.status(200).json({
            message: 'Experience added successfully',
            experience: responseExperience,
            sortedWorkExperience: user.workExperience,
        });
    } catch (error) {
        console.error('Error adding experience:', error);
        if (error.status) {
            res.status(error.status).json({ error: error.message });
        } else {
            res.status(500).json({
                error: 'Internal server error',
                details: error.message,
            });
        }
    }
};

const getExperience = async (req, res) => {
    try {
        const userId = req.user.id;
        const experienceIndex = parseInt(req.params.index, 10);

        if (isNaN(experienceIndex) || experienceIndex < 0) {
            return res.status(400).json({ error: 'Invalid experience index' });
        }

        const user = await userModel.findById(userId).select('workExperience');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (experienceIndex >= user.workExperience.length) {
            return res
                .status(400)
                .json({ error: 'Experience index out of range' });
        }

        res.status(200).json({
            experience: user.workExperience[experienceIndex],
        });
    } catch (error) {
        console.error('Error fetching experience:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
        });
    }
};

const getAllExperiences = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ experiences: user.workExperience });
    } catch (error) {
        console.error('Error fetching experiences:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateExperience = async (req, res) => {
    try {
        const userId = req.user.id;
        const experienceIndex = parseInt(req.params.index, 10);
        const updates = req.body;

        // Validate dates if provided
        if (
            (updates.fromDate && isNaN(Date.parse(updates.fromDate))) ||
            (updates.toDate && isNaN(Date.parse(updates.toDate)))
        ) {
            return res.status(400).json({ error: 'Invalid Data' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (
            experienceIndex < 0 ||
            experienceIndex >= user.workExperience.length
        ) {
            return res.status(404).json({ message: 'Experience not found' });
        }

        if (req.file) {
            try {
                const fileBuffer = req.file.buffer;
                const mimeType = req.file.mimetype;
                const fileSize = req.file.size;

                // Upload the file and get the URL
                updates.media = (
                    await uploadPicture(fileBuffer, mimeType, fileSize)
                ).url;
                console.log('URL: ', updates.media);
            } catch (error) {
                return res.status(400).json({
                    error: 'Failed to upload media: ' + error.message,
                });
            }
        }

        const oldExperience = user.workExperience[experienceIndex];
        const oldSkills = oldExperience.skills || [];
        const newSkills = updates.skills || []; // Default to empty array if not provided

        // Update experience entry
        Object.keys(updates).forEach((key) => {
            if (
                updates[key] !== undefined &&
                updates[key] !== null &&
                updates[key] !== ''
            ) {
                oldExperience[key] = updates[key];
            }
        });

        user.workExperience[experienceIndex] = oldExperience;

        const experienceResult = oldExperience;
        console.log(experienceResult);
        // Update user.skills array if skills are modified
        if (updates.skills) {
            updateSkillExperienceReferences(
                user,
                experienceIndex,
                newSkills,
                oldSkills
            );
        }

        user.workExperience = sortWorkExperience(user.workExperience);

        await user.save();

        res.status(200).json({
            message: 'Experience updated successfully',
            experience: experienceResult,
            sortedWorkExperience: user.workExperience,
            //skills: user.skills
        });
    } catch (error) {
        console.error('Error updating experience:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteExperience = async (req, res) => {
    try {
        const userId = req.user.id;
        const experienceIndex = parseInt(req.params.index, 10);

        if (isNaN(experienceIndex) || experienceIndex < 0) {
            return res.status(400).json({ error: 'Invalid experience index' });
        }

        // Fetch user with workExperience and skills
        const user = await userModel
            .findById(userId)
            .select('workExperience skills');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (experienceIndex >= user.workExperience.length) {
            return res.status(400).json({ error: 'Invalid experience index' });
        }

        // Remove experience from user.workExperience
        const deletedExperience = user.workExperience.splice(
            experienceIndex,
            1
        )[0];

        // Remove experience index from user's skills
        user.skills = user.skills.map((skill) => {
            // Remove the experienceIndex from the experience array
            skill.experience = skill.experience.filter(
                (index) => index !== experienceIndex
            );

            // Shift down experience indices greater than the deleted index
            skill.experience = skill.experience.map((index) =>
                index > experienceIndex ? index - 1 : index
            );

            return skill;
        });

        // Save updated user
        await user.save();

        res.status(200).json({
            message: 'Experience deleted successfully',
            deletedExperience,
            updatedSkills: user.skills,
        });
    } catch (error) {
        console.error('Error deleting experience:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
        });
    }
};

/*
 ************************************************
 *********** SKILLS AND ENDORSEMENTS ************
 ************************************************
 */

const addSkill = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skillName, educationIndexes, experienceIndexes } = req.body;

        // Validate skill name
        const skillValidation = await validateSkillName(skillName);
        if (!skillValidation.valid) {
            return res.status(400).json({ error: 'Invalid skill name' });
        }

        // Check if skill already exists and fetch user
        const [skillExists, user] = await Promise.all([
            userModel.exists({
                _id: userId,
                'skills.skillName': {
                    $regex: new RegExp(`^${skillName}$`, 'i'),
                },
            }),
            userModel.findById(userId, 'education skills workExperience'), // Fetch necessary fields
        ]);

        if (skillExists) {
            return res.status(400).json({ error: 'Skill already exists' });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Validate and filter indexes
        const validIndexes = Array.isArray(educationIndexes)
            ? educationIndexes.filter(
                  (index) =>
                      Number.isInteger(index) &&
                      index >= 0 &&
                      index < user.education.length
              )
            : [];

        const validExperienceIndexes = Array.isArray(experienceIndexes)
            ? experienceIndexes.filter(
                  (index) =>
                      Number.isInteger(index) &&
                      index >= 0 &&
                      index < user.workExperience.length
              )
            : [];

        // Add skill to the user
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            {
                $push: {
                    skills: {
                        skillName,
                        endorsements: [],
                        education: validIndexes,
                        experience: validExperienceIndexes,
                    },
                },
            },
            { new: true, select: 'skills education workExperience', lean: true }
        );

        // Update corresponding education & work experience entries
        const updateEducationPromises = validIndexes.map((index) =>
            userModel.updateOne(
                { _id: userId },
                { $addToSet: { [`education.${index}.skills`]: skillName } }
            )
        );

        const updateWorkExperiencePromises = validExperienceIndexes.map(
            (index) =>
                userModel.updateOne(
                    { _id: userId },
                    {
                        $addToSet: {
                            [`workExperience.${index}.skills`]: skillName,
                        },
                    }
                )
        );

        await Promise.all([
            ...updateEducationPromises,
            ...updateWorkExperiencePromises,
        ]);

        // Get the correct skill entry
        const newSkill = updatedUser.skills.find(
            (s) => s.skillName.toLowerCase() === skillName.toLowerCase()
        );

        res.status(200).json({
            message: 'Skill added successfully',
            skill: newSkill,
        });
    } catch (error) {
        console.error('Error adding skill:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
        });
    }
};

// Get a specific user skill
const getSkill = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skillName } = req.params;

        // Use projection to get only the matching skill
        const user = await userModel
            .findById(userId, {
                skills: {
                    $elemMatch: {
                        skillName: new RegExp(`^${skillName}$`, 'i'),
                    },
                },
            })
            .lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.skills || user.skills.length === 0) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        res.status(200).json({ skill: user.skills[0] });
    } catch (error) {
        console.error('Error fetching skill:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
        });
    }
};

// Get all user skills
const getAllSkills = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId).select('skills');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ skills: user.skills });
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
        });
    }
};

const updateSkill = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skillName } = req.params;
        const { newSkillName, educationIndexes, experienceIndexes } = req.body;

        // Find the user with the relevant fields
        const user = await userModel.findById(
            userId,
            'skills education workExperience'
        );
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.skills || user.skills.length === 0) {
            return res
                .status(404)
                .json({ error: 'User has no skills to update' });
        }
        // validate skill index
        // Find the skill index
        const skillIndex = user.skills.findIndex(
            (skill) => skill.skillName.toLowerCase() === skillName.toLowerCase()
        );
        if (skillIndex === -1) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        let updates = {};

        // Validate and update skill name if provided
        if (newSkillName) {
            const skillValidation = validateSkillName(newSkillName);
            if (!skillValidation.valid) {
                return res.status(400).json({ error: skillValidation.message });
            }
            /*
            if (newSkillName.toLowerCase() === skillName.toLowerCase()) {
                return res.status(400).json({ error: 'Skill name is the same' });
            }
            */
            // check if the new skill name exists for another skill
            const duplicateExists = user.skills.some(
                (skill, index) =>
                    skill.skillName.toLowerCase() ===
                        newSkillName.toLowerCase() && index !== skillIndex
            );

            if (duplicateExists) {
                return res.status(400).json({ error: 'Skill already exists' });
            }

            updates[`skills.${skillIndex}.skillName`] = newSkillName;
        }

        // Validate and update education indexes if provided
        if (educationIndexes) {
            if (!Array.isArray(educationIndexes)) {
                return res
                    .status(400)
                    .json({ error: 'Invalid education indexes format' });
            }

            const validEducationIndexes = educationIndexes.filter(
                (index) =>
                    Number.isInteger(index) &&
                    index >= 0 &&
                    index < user.education.length
            );

            if (validEducationIndexes.length !== educationIndexes.length) {
                return res.status(400).json({
                    error: 'Some provided education indexes are invalid',
                });
            }

            updates[`skills.${skillIndex}.education`] = validEducationIndexes;
        }

        // Validate and update experience indexes if provided
        if (experienceIndexes) {
            if (!Array.isArray(experienceIndexes)) {
                return res
                    .status(400)
                    .json({ error: 'Invalid experience indexes format' });
            }

            const validExperienceIndexes = experienceIndexes.filter(
                (index) =>
                    Number.isInteger(index) &&
                    index >= 0 &&
                    index < user.workExperience.length
            );

            if (validExperienceIndexes.length !== experienceIndexes.length) {
                return res.status(400).json({
                    error: 'Some provided experience indexes are invalid',
                });
            }

            updates[`skills.${skillIndex}.experience`] = validExperienceIndexes;
        }

        // If no updates were provided, return an error
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No valid updates provided' });
        }

        // Apply skill updates
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, projection: { skills: 1 } }
        );

        // Update linked education and work experience skills
        const updateEducationPromises = educationIndexes
            ? educationIndexes.map((index) =>
                  userModel.updateOne(
                      { _id: userId },
                      {
                          $addToSet: {
                              [`education.${index}.skills`]: skillName,
                          },
                      }
                  )
              )
            : [];

        const updateWorkExperiencePromises = experienceIndexes
            ? experienceIndexes.map((index) =>
                  userModel.updateOne(
                      { _id: userId },
                      {
                          $addToSet: {
                              [`workExperience.${index}.skills`]: skillName,
                          },
                      }
                  )
              )
            : [];

        await Promise.all([
            ...updateEducationPromises,
            ...updateWorkExperiencePromises,
        ]);

        res.status(200).json({
            message: 'Skill updated successfully',
            skills: updatedUser.skills,
        });
    } catch (error) {
        console.error('Error updating skill:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
        });
    }
};

const deleteSkill = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skillName } = req.params;

        // Find the skill inside the user's skills array
        const user = await userModel
            .findOne(
                { _id: userId },
                {
                    skills: {
                        $elemMatch: {
                            skillName: new RegExp(`^${skillName}$`, 'i'),
                        },
                    },
                }
            )
            .lean();

        if (!user || !user.skills || user.skills.length === 0) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        // Use the plain skill name instead of the regex
        const skillToDelete = { skillName: user.skills[0].skillName };

        // Remove skill from the user's skills array
        const result = await userModel.findByIdAndUpdate(
            userId,
            {
                $pull: {
                    skills: {
                        skillName: {
                            $regex: new RegExp(`^${skillName}$`, 'i'),
                        },
                    },
                },
            },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove skill from all education and work experience entries
        await userModel.updateMany(
            { _id: userId },
            {
                $pull: {
                    'education.$[].skills': {
                        $regex: new RegExp(`^${skillName}$`, 'i'),
                    },
                    'workExperience.$[].skills': {
                        $regex: new RegExp(`^${skillName}$`, 'i'),
                    },
                },
            }
        );

        res.status(200).json({
            message: 'Skill deleted successfully',
            deletedSkill: skillToDelete,
        });
    } catch (error) {
        console.error('Error deleting skill:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
        });
    }
};

const addEndorsement = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skillOwnerId, skillName } = req.body;
        if (userId == skillOwnerId) {
            console.log('USER ID IS SAME AS OWNER ID');
            return res
                .status(400)
                .json({ message: 'User cannot endorse himself' });
        }

        let user = await userModel.findOne(
            {
                _id: skillOwnerId,
                'skills.skillName': new RegExp(`^${skillName}$`, 'i'),
            },
            { 'skills.$': 1 }
        );

        if (!user) {
            return res.status(404).json({ message: 'User or skill not found' });
        }

        const skill = user.skills[0];
        if (skill.endorsements.some((id) => id.toString() === userId)) {
            return res
                .status(400)
                .json({ message: 'You have already endorsed this skill once' });
        }

        user = await userModel.findOneAndUpdate(
            {
                _id: skillOwnerId,
                'skills.skillName': new RegExp(`^${skillName}$`, 'i'),
            },
            {
                $push: {
                    'skills.$.endorsements': new mongoose.Types.ObjectId(
                        userId
                    ),
                },
            },
            { new: true }
        );

        const updatedSkill = user.skills.find((skill) =>
            new RegExp(`^${skillName}$`, 'i').test(skill.skillName)
        );

        res.status(200).json({
            message: 'Skill endorsement created successfully',
            skill: updatedSkill,
        });
    } catch (error) {
        console.error('Error endorsing skill:', error);
        res.status(500).json({
            message: 'Internal server error',
            details: error.message,
        });
    }
};

const deleteEndorsement = async (req, res) => {
    try {
        const userId = req.user.id;

        let { skillOwnerId } = req.body;
        const skillName = req.params.skillName;
        skillOwnerId = new mongoose.Types.ObjectId(skillOwnerId);

        let user = await userModel.findOne(
            {
                _id: skillOwnerId,
                'skills.skillName': new RegExp(`^${skillName}$`, 'i'),
            },
            { 'skills.$': 1 }
        );
        if (!user) {
            return res.status(404).json({ error: 'User or skill not found' });
        }

        if (user.skills.length > 0) {
            const skill = user.skills[0];
            if (!skill.endorsements.includes(userId)) {
                return res.status(404).json({
                    error: 'No endorsement found from this user for this skill',
                });
            }
        } else {
            return res.status(404).json({
                error: 'No endorsement found from this user for this skill',
            });
        }

        user = await userModel.findOneAndUpdate(
            {
                _id: skillOwnerId,
                'skills.skillName': new RegExp(`^${skillName}$`, 'i'),
            },
            { $pull: { 'skills.$.endorsements': userId } },
            { new: true }
        );

        const updatedSkill = user.skills.find((skill) =>
            new RegExp(`^${skillName}$`, 'i').test(skill.skillName)
        );

        res.status(200).json({
            message: 'Skill endorsement deleted successfully',
            skill: updatedSkill,
        });
    } catch (error) {
        console.error('Error Removing Skill Endorsement:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
        });
    }
};

//------------------------------------------EDUCATION--------------------------
const updateSkillsReferences = async (
    user,
    educationIndex,
    newSkills = [],
    oldSkills = []
) => {
    // Remove education index from skills that are no longer associated
    for (const skill of oldSkills) {
        if (!newSkills.includes(skill)) {
            const skillEntry = user.skills.find(
                (s) => s.name.toLowerCase() === skill.toLowerCase()
            );
            if (skillEntry) {
                skillEntry.education = skillEntry.education.filter(
                    (index) => index !== educationIndex
                );
            }
        }
    }

    // Add education index to newly added skills
    for (const skill of newSkills) {
        const existingSkill = user.skills.find(
            (s) => s.name.toLowerCase() === skill.toLowerCase()
        );
        if (existingSkill) {
            if (!existingSkill.education.includes(educationIndex)) {
                existingSkill.education.push(educationIndex);
            }
        } else {
            user.skills.push({
                name: skill,
                education: [educationIndex],
                experience: [],
                endorsements: [],
            });
        }
    }

    await user.save();
};

const addEducation = async (req, res) => {
    try {
        const userId = req.user.id;
        const educationData = {
            school: req.body.school,
            degree: req.body.degree,
            fieldOfStudy: req.body.fieldOfStudy,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            grade: req.body.grade,
            activities: req.body.activities,
            description: req.body.description,
            skills: req.body.skills,
            media: req.body.media,
        };

        if (!educationData.school) {
            return res.status(400).json({ error: 'School name is required' });
        }

        if (req.file) {
            try {
                const fileBuffer = req.file.buffer;
                const mimeType = req.file.mimetype;
                const fileSize = req.file.size;

                // Upload the file and get the URL
                educationData.media = (
                    await uploadPicture(fileBuffer, mimeType, fileSize)
                ).url;
            } catch (error) {
                return res.status(400).json({
                    error: 'Failed to upload media: ' + error.message,
                });
            }
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $push: { education: educationData } },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const educationIndex = updatedUser.education.length - 1;

        if (educationData.skills.length > 0) {
            await updateSkillsReferences(
                updatedUser,
                educationIndex,
                educationData.skills,
                []
            );
        }

        res.status(200).json({
            message: 'Education added successfully',
            education: updatedUser.education[updatedUser.education.length - 1],
        });
    } catch (error) {
        console.error('Error adding education:', error);
        res.status(500).json({
            error: 'Failed to add education',
            details: error.message,
        });
    }
};
const editEducation = async (req, res) => {
    try {
        const userId = req.user.id;
        const educationIndex = parseInt(req.params.index);
        const updatedData = req.body;

        // Get existing user data
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate education index
        if (
            educationIndex < 0 ||
            educationIndex >= user.education.length ||
            isNaN(educationIndex)
        ) {
            return res.status(404).json({ message: 'Education not found' });
        }

        // Validate required field (school)
        if (!updatedData.school || updatedData.school.trim() === '') {
            return res.status(400).json({ error: 'School name is required' });
        }

        // Get the existing education entry
        const existingEducation = user.education[educationIndex];

        // Track the previous skills
        const oldSkills = existingEducation.skills || [];

        // Define the full structure with default values
        const defaultEducation = {
            school: null,
            degree: null,
            fieldOfStudy: null,
            startDate: null,
            endDate: null,
            grade: null,
            activities: null,
            description: null,
            skills: [],
            media: [],
        };

        // Ensure all keys are present and merge updated data
        const mergedEducation = Object.assign(
            {},
            defaultEducation,
            updatedData
        );

        // Update the education entry
        user.education[educationIndex] = mergedEducation;

        await updateSkillsReferences(
            user,
            educationIndex,
            mergedEducation.skills,
            oldSkills
        );

        res.status(200).json({
            message: 'Education updated successfully',
            education: user.education[educationIndex],
        });
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({
            error: 'Failed to update education',
            details: error.message,
        });
    }
};

const getEducation = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);
        const educationIndex = parseInt(req.params.index);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (
            isNaN(educationIndex) ||
            educationIndex < 0 ||
            educationIndex >= user.education.length
        ) {
            return res.status(400).json({ message: 'Invalid education index' });
        }
        res.status(200).json({
            message: 'Education updated successfully',
            education: user.education[educationIndex],
        });
    } catch (error) {
        console.error('Error fetching education:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
const getEducations = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: 'Education updated successfully',
            educations: user.education,
        });
    } catch (error) {
        console.error('Error fetching educations:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
const deleteEducation = async (req, res) => {
    try {
        const userId = req.user.id;
        const educationIndex = parseInt(req.params.index, 10);

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (
            isNaN(educationIndex) ||
            educationIndex < 0 ||
            educationIndex >= user.education.length
        ) {
            return res.status(400).json({ message: 'Invalid education index' });
        }

        // Get the skills linked to this education before deletion
        const deletedEducation = user.education[educationIndex];
        const skillsToUpdate = deletedEducation.skills || [];

        user.education.splice(educationIndex, 1);

        // Update the skills array
        for (const skill of skillsToUpdate) {
            const skillEntry = user.skills.find((s) => s.name === skill);
            if (skillEntry) {
                // Remove this education index from the skill
                skillEntry.education = skillEntry.education.filter(
                    (index) => index !== educationIndex
                );

                // Adjust indices for remaining education entries in this skill
                skillEntry.education = skillEntry.education.map((index) =>
                    index > educationIndex ? index - 1 : index
                );
            }
        }

        await user.save();

        res.status(200).json({
            message: 'Education deleted successfully',
            educations: user.education,
        });
    } catch (error) {
        console.error('Error deleting education:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/*
 ************************************************
 *********** Intro ************
 ************************************************
 */
const editIntro = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            firstName,
            lastName,
            additinalName,
            headLine,
            website,
            location,
            mainEducation,
            industry,
        } = req.body;

        // Validate required fields
        const requiredFields = [
            'firstName',
            'lastName',
            'location',
            'industry',
            'mainEducation',
            'headLine',
        ];
        const missingFields = requiredFields.filter(
            (field) => req.body[field] === undefined || req.body[field] === null
        );

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: 'Missing required fields',
                missingFields,
            });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            {
                $set: {
                    firstName,
                    lastName,
                    headline: headLine,
                    additinalName,
                    website,
                    location,
                    mainEducation,
                    industry,
                },
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Intro updated successfully',
            user: {
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                headLine: updatedUser.headline,
                additionalName: updatedUser.additionalName,
                website: updatedUser.website,
                location: updatedUser.location,
                industry: updatedUser.industry,
            },
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            error: 'Failed to update profile',
            details: error.message,
        });
    }
};
/*
 ************************************************
 *********** privacy settings ************
 ************************************************
 */
const updatePrivacySettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { profilePrivacySettings } = req.body;

        if (!profilePrivacySettings) {
            return res.status(400).json({
                error: 'profilePrivacySettings is required',
            });
        }

        // Validate that the value is one of the allowed enum values
        const allowedValues = ['public', 'private', 'connectionsOnly'];
        if (!allowedValues.includes(profilePrivacySettings)) {
            return res.status(400).json({
                error: `Invalid value for profilePrivacySettings. Must be one of: ${allowedValues.join(
                    ', '
                )}`,
            });
        }

        // Update the field directly, not as a nested property
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: { profilePrivacySettings: profilePrivacySettings } },
            { new: true, select: 'profilePrivacySettings' }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile privacy settings updated successfully',
            profilePrivacySettings: updatedUser.profilePrivacySettings,
        });
    } catch (error) {
        console.error('Error updating privacy settings:', error);
        res.status(500).json({
            error: 'Failed to update privacy settings',
            details: error.message,
        });
    }
};

/*
 ************************************************
 *********** follow/unfollow ************
 ************************************************
 */
const followEntity = async (req, res) => {
    try {
        const followerId = req.user.id; // Current authenticated user
        const targetId = req.params.userId; // Entity to follow
        const { entityType = 'User' } = req.body; // Default to User if not specified

        // Validate entity type
        const validEntityTypes = ['User', 'Company'];
        if (!validEntityTypes.includes(entityType)) {
            return res.status(400).json({
                message: `Invalid entity type. Must be one of: ${validEntityTypes.join(
                    ', '
                )}`,
            });
        }
        // Get follower user
        const followerUser = await userModel.findById(followerId);
        if (!followerUser) {
            return res
                .status(404)
                .json({ message: 'Your user account not found' });
        }

        // If following a user, prevent self-following
        if (entityType === 'User' && followerId === targetId) {
            return res
                .status(400)
                .json({ message: 'You cannot follow yourself' });
        }

        // Check if already following
        const alreadyFollowing = followerUser.following.some(
            (follow) =>
                follow.entity.toString() === targetId ||
                follow.entityType === entityType
        );
        // If following a user, prevent following again
        if (entityType === 'User' && followerId === targetId) {
            return res
                .status(400)
                .json({ message: 'You already followed the user' });
        }

        if (alreadyFollowing) {
            return res.status(400).json({
                message: `You are already following this ${entityType.toLowerCase()}`,
            });
        }

        // Get target entity
        let targetEntity;
        if (entityType === 'User') {
            targetEntity = await userModel.findById(targetId);
        } else if (entityType === 'Company') {
            targetEntity = await companyModel.findById(targetId);
        }

        if (!targetEntity) {
            return res.status(404).json({ message: `${entityType} not found` });
        }

        // Check if target user blocked the follower (only applicable for User entities)
        if (
            entityType === 'User' &&
            targetEntity.blockedUsers &&
            targetEntity.blockedUsers.includes(followerId)
        ) {
            return res.status(400).json({ message: 'Cannot follow this user' });
        }

        // Update follower's following list
        followerUser.following.push({
            entity: targetId,
            entityType: entityType,
            followedAt: new Date(),
        });

        // Update target entity's followers list
        if (entityType === 'User') {
            targetEntity.followers.push({
                entity: followerId,
                entityType: 'User',
                followedAt: new Date(),
            });
            await Promise.all([followerUser.save(), targetEntity.save()]);
        } else if (entityType === 'Company') {
            targetEntity.followers.push({
                entity: followerId,
                entityType: 'User',
                followedAt: new Date(),
            });
            await Promise.all([followerUser.save(), targetEntity.save()]);
        }

        res.status(200).json({
            message: `${entityType} followed successfully`,
        });
    } catch (error) {
        console.error('Error following entity:', error);
        res.status(500).json({
            message: 'Failed to follow entity',
            error: error.message,
        });
    }
};

const unfollowEntity = async (req, res) => {
    try {
        const followerId = req.user.id; // Current authenticated user
        const targetId = req.params.userId; // Entity to unfollow
        const { entityType = 'User' } = req.body; // Default to User if not specified

        // Validate entity type
        const validEntityTypes = ['User', 'Company'];
        if (!validEntityTypes.includes(entityType)) {
            return res.status(400).json({
                message: `Invalid entity type. Must be one of: ${validEntityTypes.join(
                    ', '
                )}`,
            });
        }

        // If unfollowing a user, prevent self-unfollowing
        if (entityType === 'User' && followerId === targetId) {
            return res
                .status(400)
                .json({ message: 'You cannot unfollow yourself' });
        }

        // Get follower user
        const followerUser = await userModel.findById(followerId);
        if (!followerUser) {
            return res
                .status(404)
                .json({ message: 'Your user account not found' });
        }

        // Get target entity
        let targetEntity;
        if (entityType === 'User') {
            targetEntity = await userModel.findById(targetId);
        } else if (entityType === 'Company') {
            targetEntity = await companyModel.findById(targetId);
        }

        if (!targetEntity) {
            return res.status(404).json({ message: `${entityType} not found` });
        }

        // Check if actually following
        const followingIndex = followerUser.following.findIndex(
            (follow) =>
                follow.entity.toString() === targetId &&
                follow.entityType === entityType
        );

        if (followingIndex === -1) {
            return res.status(400).json({
                message: `You are not following this ${entityType.toLowerCase()}`,
            });
        }

        // Remove from follower's following list
        followerUser.following.splice(followingIndex, 1);

        // Remove from target entity's followers list
        if (targetEntity.followers) {
            const followerIndex = targetEntity.followers.findIndex(
                (follow) =>
                    follow.entity.toString() === followerId &&
                    follow.entityType === 'User'
            );

            if (followerIndex !== -1) {
                targetEntity.followers.splice(followerIndex, 1);
            }
        }

        // Save both updates in parallel
        await Promise.all([followerUser.save(), targetEntity.save()]);

        res.status(200).json({
            message: `${entityType} unfollowed successfully`,
        });
    } catch (error) {
        console.error('Error unfollowing entity:', error);
        res.status(500).json({
            message: 'Failed to unfollow entity',
            error: error.message,
        });
    }
};
const editContactInfo = async (req, res) => {
    try {
        const userId = req.user.id;
        const { phone, phoneType, address, birthDay, website } = req.body;

        // Build the update object with only provided fields
        const updateFields = {};

        // Handle phone updates
        if (phone !== undefined) {
            updateFields['contactInfo.phone'] = phone;
        }

        // Handle phoneType updates with validation
        if (phoneType !== undefined) {
            const validPhoneTypes = ['Home', 'Work', 'Mobile'];
            if (phoneType && !validPhoneTypes.includes(phoneType)) {
                return res.status(400).json({
                    error: 'Invalid phoneType',
                    validValues: validPhoneTypes,
                });
            }
            updateFields['contactInfo.phoneType'] = phoneType;
        }

        // Handle address updates
        if (address !== undefined) {
            updateFields['contactInfo.address'] = address;
        }

        // Handle birthday updates with validation
        if (birthDay) {
            if (birthDay.day !== undefined) {
                if (
                    birthDay.day !== null &&
                    (birthDay.day < 1 || birthDay.day > 31)
                ) {
                    return res.status(400).json({
                        error: 'Invalid day value',
                        message: 'Day must be between 1 and 31',
                    });
                }
                updateFields['contactInfo.birthDay.day'] = birthDay.day;
            }

            if (birthDay.month !== undefined) {
                const validMonths = [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
                ];
                if (
                    birthDay.month !== null &&
                    !validMonths.includes(birthDay.month)
                ) {
                    return res.status(400).json({
                        error: 'Invalid month value',
                        validValues: validMonths,
                    });
                }
                updateFields['contactInfo.birthDay.month'] = birthDay.month;
            }
        }

        // Handle website updates with validation
        if (website) {
            if (website.url !== undefined) {
                updateFields['contactInfo.website.url'] = website.url;
            }

            if (website.type !== undefined) {
                const validWebsiteTypes = [
                    'Personal',
                    'Company',
                    'Blog',
                    'RSS Feed',
                    'Portfolio',
                    'Other',
                ];
                if (
                    website.type !== null &&
                    !validWebsiteTypes.includes(website.type)
                ) {
                    return res.status(400).json({
                        error: 'Invalid website type',
                        validValues: validWebsiteTypes,
                    });
                }
                updateFields['contactInfo.website.type'] = website.type;
            }
        }

        // If no fields were provided for update, return an error
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                error: 'No fields provided for update',
                message:
                    'Please provide at least one contact information field to update',
            });
        }

        // Find user and update contact information
        const updatedUser = await userModel
            .findByIdAndUpdate(
                userId,
                { $set: updateFields },
                { new: true, runValidators: true }
            )
            .select('contactInfo');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Contact information updated successfully',
            contactInfo: updatedUser.contactInfo,
        });
    } catch (error) {
        console.error('Error updating contact information:', error);
        res.status(500).json({
            error: 'Failed to update contact information',
            details: error.message,
        });
    }
};
const editAbout = async (req, res) => {
    try {
        const userId = req.user.id;
        const { about } = req.body;

        if (!about) {
            return res.status(400).json({ error: 'About section is required' });
        }

        // Validate skills array length
        if (
            about.skills &&
            Array.isArray(about.skills) &&
            about.skills.length > 5
        ) {
            return res.status(400).json({
                error: 'Skills array cannot contain more than 5 items',
            });
        }

        // First find the user to check existing skills
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found ' });
        }

        // Create a set of existing skill names for quick lookup
        const existingSkillNames = new Set(
            user.skills.map((skill) => skill.skillName)
        );
        const skillsToAdd = [];

        // Check if there are new skills in the about section to add to the main skills array
        if (about.skills && Array.isArray(about.skills)) {
            about.skills.forEach((skill) => {
                if (skill && !existingSkillNames.has(skill)) {
                    skillsToAdd.push({
                        skillName: skill,
                        endorsements: [],
                        education: [],
                    });
                    existingSkillNames.add(skill);
                }
            });
        }

        // Update operations
        const updateOps = {
            about: about,
        };

        // If there are skills to add, update the skills array
        if (skillsToAdd.length > 0) {
            updateOps.skills = [...user.skills, ...skillsToAdd];
        }

        // Update the user document
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: updateOps },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: 'About section updated successfully',
            about: updatedUser.about,
            skillsAdded: skillsToAdd.length > 0 ? skillsToAdd : undefined,
        });
    } catch (error) {
        console.error('Error updating about section:', error);
        res.status(500).json({
            error: 'Failed to update about section',
            details: error.message,
        });
    }
};

const getSavedPosts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get user with saved posts
        const user = await userModel
            .findById(userId)
            .select('savedPosts')
            .lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get total count of saved posts
        const totalPosts = user.savedPosts?.length || 0;

        if (totalPosts === 0) {
            return res.status(200).json({
                posts: [],
                pagination: {
                    total: 0,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: 0,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            });
        }

        // Get paginated saved posts
        const paginatedPostIds = user.savedPosts.slice(
            skip,
            skip + parseInt(limit)
        );

        // Fetch full post details with population
        const posts = await postModel
            .find({
                _id: { $in: paginatedPostIds },
                isActive: true,
            })
            .populate('userId', 'firstName lastName headline profilePicture')
            .populate(
                'companyId',
                'name logo tagLine address industry organizationSize organizationType'
            )
            .lean();

        // Check user's like status for each post
        const likePromises = posts.map((post) => {
            return impressionModel
                .findOne({
                    targetId: post._id,
                    userId,
                })
                .lean();
        });

        const likeResults = await Promise.all(likePromises);

        // Format posts for response
        const formattedPosts = await Promise.all(
            posts.map(async (post, index) => {
                const commentCount = await commentModel.countDocuments({
                    postId: post._id,
                });

                // Check if post is a repost
                const repost = await repostModel
                    .findOne({
                        postId: post._id,
                        isActive: true,
                    })
                    .populate(
                        'userId',
                        'firstName lastName profilePicture headline'
                    )
                    .lean();

                return {
                    postId: post._id,
                    userId: post.userId ? post.userId._id : null,
                    companyId: post.companyId ? post.companyId : null,
                    firstName: post.userId ? post.userId.firstName : null,
                    lastName: post.userId ? post.userId.lastName : null,
                    headline: post.userId ? post.userId.headline : '',
                    profilePicture: post.userId
                        ? post.userId.profilePicture
                        : null,
                    postDescription: post.description,
                    attachments: post.attachments,
                    impressionCounts: post.impressionCounts,
                    commentCount: commentCount || 0,
                    repostCount: post.repostCount || 0,
                    createdAt: post.createdAt,
                    taggedUsers: post.taggedUsers,
                    whoCanSee: post.whoCanSee || 'anyone',
                    whoCanComment: post.whoCanComment || 'anyone',
                    isRepost: !!repost,
                    isSaved: true, // Always true for saved posts
                    isLiked: !!likeResults[index],
                    isMine:
                        (post.userId &&
                            post.userId._id.toString() === userId) ||
                        false,

                    // Include repost details if this post is a repost
                    ...(repost && {
                        repostId: repost._id,
                        reposterId: repost.userId._id,
                        reposterFirstName: repost.userId.firstName,
                        reposterLastName: repost.userId.lastName,
                        reposterProfilePicture: repost.userId.profilePicture,
                        reposterHeadline: repost.userId.headline || '',
                        repostDescription: repost.description,
                        repostDate: repost.createdAt,
                    }),
                };
            })
        );

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalPosts / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPrevPage = parseInt(page) > 1;

        res.status(200).json({
            posts: formattedPosts,
            pagination: {
                total: totalPosts,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: totalPages,
                hasNextPage,
                hasPrevPage,
            },
        });
    } catch (error) {
        console.error('Error fetching saved posts:', error);
        res.status(500).json({
            message: 'Failed to fetch saved posts',
            error: error.message,
        });
    }
};

const getUserActivity = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;
        const { filter = 'all', page = 1, limit = 10 } = req.query;
        const requesterId = req.user.id;
        // Validate input
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Validate filter
        const validFilters = ['all', 'posts', 'reposts', 'comments'];
        if (!validFilters.includes(filter)) {
            return res.status(400).json({
                message: 'Invalid filter',
                validFilters,
            });
        }
        // Check if user blocked the requester
        // Check if user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const requester = await userModel
            .findById(requesterId)
            .select('connectionList blockedUsers');
        if (!requester) {
            return res.status(404).json({ message: 'Requester not found' });
        }
        const accessCheck = await checkUserAccessPermission(
            user,
            currentUserId,
            requester
        );
        if (!accessCheck.hasAccess) {
            return res
                .status(accessCheck.statusCode || 403)
                .json({ message: accessCheck.message });
        }

        // Parse pagination parameters
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skipIndex = (pageNum - 1) * limitNum;

        // Arrays to store activity data and post IDs
        let activities = [];
        let postIds = new Set();

        // 1. Get user's posts if needed
        if (filter === 'all' || filter === 'posts') {
            const userPosts = await postModel
                .find({
                    userId,
                    isActive: true,
                })
                .select('_id createdAt updatedAt')
                .lean();

            userPosts.forEach((post) => {
                activities.push({
                    postId: post._id,
                    activityType: 'post',
                    activityDate: post.createdAt,
                    updatedAt: post.updatedAt,
                });
                postIds.add(post._id.toString());
            });
        }

        // 2. Get user's reposts if needed
        if (filter === 'all' || filter === 'reposts') {
            const userReposts = await repostModel
                .find({
                    userId,
                    isActive: true,
                })
                .select('_id postId description createdAt')
                .lean();

            userReposts.forEach((repost) => {
                activities.push({
                    postId: repost.postId,
                    repostId: repost._id,
                    repostDescription: repost.description || '',
                    activityType: 'repost',
                    activityDate: repost.createdAt,
                });
                postIds.add(repost.postId.toString());
            });
        }

        // 3. Get user's comments if needed
        if (filter === 'all' || filter === 'comments') {
            const userComments = await commentModel
                .find({
                    userId,
                    isActive: true,
                })
                .select('_id postId text createdAt')
                .lean();

            userComments.forEach((comment) => {
                activities.push({
                    postId: comment.postId,
                    commentId: comment._id,
                    commentText: comment.text,
                    activityType: 'comment',
                    activityDate: comment.createdAt,
                });
                postIds.add(comment.postId.toString());
            });
        }

        // Sort activities by date (newest first)
        activities.sort(
            (a, b) => new Date(b.activityDate) - new Date(a.activityDate)
        );

        // Count total activities for pagination
        const totalActivities = activities.length;

        // Apply pagination to activities array
        const paginatedActivities = activities.slice(
            skipIndex,
            skipIndex + limitNum
        );

        // Get the post IDs for this page
        const paginatedPostIds = paginatedActivities.map(
            (activity) => new mongoose.Types.ObjectId(activity.postId)
        );

        // Fetch all post details for the current page
        const posts = await postModel
            .find({
                _id: { $in: paginatedPostIds },
                isActive: true,
            })
            .populate('userId', 'firstName lastName headline profilePicture')
            .populate(
                'companyId',
                'name logo tagLine address industry organizationSize organizationType'
            )
            .lean();

        // Create a map for quick lookup
        const postMap = {};
        posts.forEach((post) => {
            postMap[post._id.toString()] = post;
        });

        // Check if current user has saved these posts
        const currentUser = await userModel
            .findById(currentUserId)
            .select('savedPosts');
        const savedPostsSet = new Set(
            (currentUser.savedPosts || []).map((id) => id.toString())
        );
        const likePromises = paginatedActivities.map((activity) => {
            const postId = activity.postId;
            if (!postId) return Promise.resolve(false);

            return impressionModel
                .findOne({
                    targetId: postId,
                    userId: currentUserId,
                })
                .lean() // Add lean() to convert to plain object
                .then((result) => ({
                    postId: postId.toString(),
                    isLiked: result, // This now contains the full impression document or null
                }));
        });

        // Wait for all like status checks to complete
        const likeResults = await Promise.all(likePromises);

        // Create a lookup map for quick access
        const likeStatusMap = {};
        likeResults.forEach((item) => {
            if (item) likeStatusMap[item.postId] = item.isLiked;
        });
        // Format final response with all details
        const formattedPosts = paginatedActivities
            .map((activity) => {
                const post = postMap[activity.postId.toString()];
                if (!post) return null; // Skip if post no longer exists or is inactive

                let isRepost = false;
                let repost = null;

                // If this is a repost activity by the user we're looking at
                if (activity.activityType === 'repost') {
                    isRepost = true;
                    repost = {
                        _id: activity.repostId,
                        description: activity.repostDescription,
                        createdAt: activity.activityDate,
                        userId: {
                            _id: userId,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            headline: user.headline || '',
                            profilePicture: user.profilePicture,
                        },
                    };
                }
                // Format post response exactly like in getPost function
                const postResponse = {
                    postId: post._id,
                    postId: post._id,
                    userId: post.userId ? post.userId._id : null,
                    companyId: post.companyId ? post.companyId : null,
                    firstName: post.userId ? post.userId.firstName : null,
                    lastName: post.userId ? post.userId.lastName : null,
                    headline: post.userId ? post.userId.headline : '',
                    profilePicture: post.userId
                        ? post.userId.profilePicture
                        : null,
                    postDescription: post.description,
                    attachments: post.attachments,
                    impressionCounts: post.impressionCounts,
                    commentCount: post.commentCount || 0,
                    repostCount: post.repostCount || 0,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt || post.createdAt,
                    taggedUsers: post.taggedUsers,
                    whoCanSee: post.whoCanSee || 'anyone', // Include privacy setting
                    whoCanComment: post.whoCanComment || 'anyone', // Include comment setting
                    isRepost,
                    isLiked: likeStatusMap[post._id.toString()] || false,
                    isMine: post.userId._id.toString() === currentUserId,
                    isSaved: savedPostsSet.has(post._id.toString()),
                    activityType: activity.activityType,
                    activityDate: activity.activityDate,
                };

                // Include repost details if applicable (exactly like in getPost function)
                if (isRepost && repost) {
                    postResponse.repostId = repost._id;
                    postResponse.reposterId = repost.userId._id;
                    postResponse.reposterFirstName = repost.userId.firstName;
                    postResponse.reposterLastName = repost.userId.lastName;
                    postResponse.reposterProfilePicture =
                        repost.userId.profilePicture;
                    postResponse.reposterHeadline =
                        repost.userId.headline || '';
                    postResponse.repostDescription = repost.description;
                    postResponse.repostDate = repost.createdAt;
                }

                // Add comment details if this activity is a comment (similar structure to repost)
                if (activity.activityType === 'comment') {
                    postResponse.commentId = activity.commentId;
                    postResponse.commentText = activity.commentText;
                    postResponse.commentDate = activity.activityDate;
                    postResponse.commenterId = userId;
                    postResponse.commenterFirstName = user.firstName;
                    postResponse.commenterLastName = user.lastName;
                    postResponse.commenterProfilePicture = user.profilePicture;
                    postResponse.commenterHeadline = user.headline || '';
                }

                return postResponse;
            })
            .filter(Boolean); // Remove any null entries

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalActivities / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;

        // Return response
        res.status(200).json({
            posts: formattedPosts,
            pagination: {
                total: totalActivities,
                page: pageNum,
                limit: limitNum,
                pages: totalPages,
                hasNextPage,
                hasPrevPage,
            },
        });
    } catch (error) {
        console.error('Error getting user activity:', error);
        res.status(500).json({
            message: 'Failed to get user activity',
            error: error.message,
        });
    }
};

// Search Controllers
const searchUsers = async (req, res) => {
    try {
        const { query, company, industry, page = 1, limit = 10 } = req.query;
        const { skip, limit: limitNum } = handlePagination(page, limit);

        const searchQuery = {};
        if (query) {
            searchQuery.$or = [
                { firstName: { $regex: query, $options: 'i' } },
                { lastName: { $regex: query, $options: 'i' } },
            ];
        }
        if (company) searchQuery.company = { $regex: company, $options: 'i' };
        if (industry)
            searchQuery.industry = { $regex: industry, $options: 'i' };

        const users = await userModel
            .find(searchQuery)
            .select('firstName lastName company industry profilePicture')
            .skip(skip)
            .limit(limitNum);

        const total = await userModel.countDocuments(searchQuery);

        res.status(200).json({
            users,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const searchUsersByName = async (req, res) => {
    try {
        const { name, page = 1, limit = 10 } = req.query;
        const { skip, limit: limitNum } = handlePagination(page, limit);

        const searchQuery = {
            $or: [
                { firstName: { $regex: name, $options: 'i' } },
                { lastName: { $regex: name, $options: 'i' } },
            ],
        };

        const users = await userModel
            .find(searchQuery)
            .select('firstName lastName profilePicture')
            .skip(skip)
            .limit(limitNum);

        const total = await userModel.countDocuments(searchQuery);

        res.status(200).json({
            users,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Connection Controllers
const sendConnectionRequest = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const userId = req.user.id;

        const validationResult = await validateConnectionStatus(
            userId,
            targetUserId,
            userModel
        );
        if (!validationResult.isValid) {
            return res
                .status(validationResult.statusCode)
                .json({ message: validationResult.message });
        }

        const { user, targetUser } = validationResult;

        if (!targetUser || !user) {
            return res
                .status(404)
                .json({ message: 'User or Target User not found' });
        }

        // Check receiver privacy settings
        // ADDED
        const canSendRequest = await canSendConnectionRequest(
            targetUserId,
            userId
        );
        if (!canSendRequest) {
            return res.status(403).json({
                message:
                    'Cannot send connection request due to other user privacy settings',
            });
        }

        // Check if request already pending
        const [userWithSentRequest, targetUserWithReceivedRequest] =
            await Promise.all([
                userModel.exists({
                    _id: userId,
                    sentConnectionRequests: targetUserId,
                }),
                userModel.exists({
                    _id: targetUserId,
                    receivedConnectionRequests: userId,
                }),
            ]);

        if (userWithSentRequest && targetUserWithReceivedRequest) {
            return res
                .status(400)
                .json({ message: 'Connection request already sent' });
        }

        // Update both users in parallel
        await Promise.all([
            userModel.findByIdAndUpdate(targetUserId, {
                $addToSet: { receivedConnectionRequests: userId },
            }),
            userModel.findByIdAndUpdate(userId, {
                $addToSet: { sentConnectionRequests: targetUserId },
            }),
        ]);

        const sendingUser = await userModel.findById(userId);
        const recievingUser = await userModel.findById(targetUserId);

        await sendNotification(
            sendingUser,
            recievingUser,
            'connection request',
            sendingUser
        );

        res.status(200).json({
            message: 'Connection request sent successfully',
        });
    } catch (error) {
        console.error('Error sending connection request:', error);
        res.status(500).json({ message: error.message });
    }
};
const getPendingRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await userModel
            .findById(userId)
            .populate({
                path: 'receivedConnectionRequests',
                select: 'firstName lastName profilePicture', // Populate fields you want to return
            })
            .select('receivedConnectionRequests');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            pendingRequests: user.receivedConnectionRequests,
        });
    } catch (error) {
        console.error('Error getting pending requests:', error);
        res.status(500).json({ message: error.message });
    }
};

const handleConnectionRequest = async (req, res) => {
    try {
        const { senderId } = req.params;
        const { action } = req.body;
        const userId = req.user.id;

        if (!['accept', 'decline'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }

        const user = await userModel.findById(userId);
        if (!user || !user.receivedConnectionRequests.includes(senderId)) {
            return res
                .status(404)
                .json({ message: 'Connection request not found' });
        }

        // Remove the senderId from receivedConnectionRequests regardless of accept or decline
        await userModel.findByIdAndUpdate(userId, {
            $pull: { receivedConnectionRequests: senderId },
        });
        // await userModel.findByIdAndUpdate(userId, {
        //     $pull: { sentConnectionRequests: senderId }
        // });

        // Remove the userId from sentConnectionRequests of the sender regardless of accept or decline
        // await userModel.findByIdAndUpdate(senderId, {
        //     $pull: { receivedConnectionRequests: userId }
        // });
        await userModel.findByIdAndUpdate(senderId, {
            $pull: { sentConnectionRequests: userId },
        });

        if (action === 'accept') {
            await Promise.all([
                userModel.findByIdAndUpdate(userId, {
                    $addToSet: { connectionList: senderId },
                }),
                userModel.findByIdAndUpdate(senderId, {
                    $addToSet: { connectionList: userId },
                }),
            ]);
        }

        res.status(200).json({
            message: `Connection request ${action}ed successfully`,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getConnectionsList = async (req, res) => {
    try {
        const { page = 1, limit = 100 } = req.query;
        const userId = req.user.id;
        const { skip, limit: limitNum } = handlePagination(page, limit);

        const user = await userModel.findById(userId).populate({
            path: 'connectionList',
            select: 'firstName lastName profilePicture lastJobTitle',
            options: { skip, limit: limitNum },
        });

        const total = user.connectionList.length;

        res.status(200).json({
            connections: user.connectionList,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const removeConnection = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const userId = req.user.id;

        await Promise.all([
            userModel.findByIdAndUpdate(userId, {
                $pull: { connectionList: connectionId },
            }),
            userModel.findByIdAndUpdate(connectionId, {
                $pull: { connectionList: userId },
            }),
        ]);

        res.status(200).json({ message: 'Connection removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Blocking Controllers
const blockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const blockerId = req.user.id;

        await Promise.all([
            // Remove from connections if connected
            userModel.findByIdAndUpdate(blockerId, {
                $pull: { connectionList: userId },
                $addToSet: { blockedUsers: userId },
            }),
            userModel.findByIdAndUpdate(userId, {
                $pull: { connectionList: blockerId },
            }),
        ]);

        res.status(200).json({ message: 'User blocked successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const unblockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const blockerId = req.user.id;

        await userModel.findByIdAndUpdate(blockerId, {
            $pull: { blockedUsers: userId },
        });

        res.status(200).json({ message: 'User unblocked successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBlockedUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user.id;
        const { skip, limit: limitNum } = handlePagination(page, limit);

        const user = await userModel.findById(userId).populate({
            path: 'blockedUsers',
            select: 'firstName lastName profilePicture',
            options: { skip, limit: limitNum },
        });

        const total = user.blockedUsers.length;

        res.status(200).json({
            blockedUsers: user.blockedUsers,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Message Request Controllers
const sendMessageRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user.id;

        const validationResult = await validateConnectionStatus(
            userId,
            requestId,
            userModel
        );
        if (!validationResult.isValid) {
            return res
                .status(validationResult.statusCode)
                .json({ message: validationResult.message });
        }

        await userModel.findByIdAndUpdate(requestId, {
            $addToSet: { messageRequests: userId },
        });

        res.status(200).json({ message: 'Message request sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMessageRequests = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user.id;
        const { skip, limit: limitNum } = handlePagination(page, limit);

        const user = await userModel.findById(userId).populate({
            path: 'messageRequests',
            select: 'firstName lastName profilePicture',
            options: { skip, limit: limitNum },
        });

        const total = user.messageRequests.length;

        res.status(200).json({
            messageRequests: user.messageRequests,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const handleMessageRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { action } = req.body;
        const userId = req.user.id;

        if (!['accept', 'decline'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await userModel.findByIdAndUpdate(userId, {
            $pull: { messageRequests: requestId },
        });

        if (action === 'accept') {
            // Add logic here for enabling messaging between users
            // This might involve updating a separate messages collection or permissions
        }

        res.status(200).json({
            message: `Message request ${action}ed successfully`,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRelatedUsers = async (req, res) => {
    try {
        const { page = 1, limit = 30 } = req.query;
        const userId = req.user.id;
        const { skip, limit: limitNum } = handlePagination(page, limit);

        // Get current user's details
        const currentUser = await userModel
            .findById(userId)
            .select('connectionList education lastJobTitle industry location');

        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Build query conditions
        const matchConditions = [];

        // Base condition to exclude current user and inactive users
        const baseCondition = {
            _id: { $ne: new mongoose.Types.ObjectId(userId) }, // Convert userId to ObjectId
            isActive: true,
        };

        // Rest of the conditions
        if (currentUser.industry) {
            matchConditions.push({ industry: currentUser.industry });
        }

        if (currentUser.lastJobTitle) {
            matchConditions.push({ lastJobTitle: currentUser.lastJobTitle });
        }

        if (currentUser.education && currentUser.education.length > 0) {
            matchConditions.push({
                'education.school': currentUser.education[0].school,
            });
        }

        if (
            currentUser.connectionList &&
            currentUser.connectionList.length > 0
        ) {
            matchConditions.push({
                connectionList: {
                    $in: currentUser.connectionList,
                },
            });
        }

        const query = {
            ...baseCondition,
            ...(matchConditions.length > 0 ? { $or: matchConditions } : {}),
        };

        // Aggregate pipeline with explicit user exclusion
        const relatedUsers = await userModel.aggregate([
            {
                $match: {
                    $and: [
                        { _id: { $ne: new mongoose.Types.ObjectId(userId) } }, // Explicit exclusion
                        query,
                    ],
                },
            },
            // ... rest of the aggregation pipeline remains the same ...
            {
                $addFields: {
                    commonConnectionsCount: {
                        $size: {
                            $setIntersection: [
                                '$connectionList',
                                currentUser.connectionList,
                            ],
                        },
                    },
                },
            },
            {
                $addFields: {
                    matchScore: {
                        $sum: [
                            {
                                $cond: [
                                    {
                                        $eq: [
                                            '$industry',
                                            currentUser.industry,
                                        ],
                                    },
                                    2,
                                    0,
                                ],
                            },
                            {
                                $cond: [
                                    {
                                        $eq: [
                                            '$lastJobTitle',
                                            currentUser.lastJobTitle,
                                        ],
                                    },
                                    2,
                                    0,
                                ],
                            },
                            {
                                $cond: [
                                    {
                                        $eq: [
                                            '$education.0.school',
                                            currentUser.education?.[0]?.school,
                                        ],
                                    },
                                    2,
                                    0,
                                ],
                            },
                            {
                                $multiply: [
                                    {
                                        $divide: [
                                            '$commonConnectionsCount',
                                            20,
                                        ],
                                    },
                                    2,
                                ],
                            },
                        ],
                    },
                },
            },
            { $sort: { matchScore: -1, commonConnectionsCount: -1 } },
            { $skip: skip },
            { $limit: limitNum },
            {
                $project: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    profilePicture: 1,
                    lastJobTitle: 1,
                    industry: 1,
                    commonConnectionsCount: 1,
                    matchScore: 1,
                },
            },
        ]);

        // Get total count excluding current user
        const total = await userModel.countDocuments(query);

        res.status(200).json({
            message: 'Related users retrieved successfully',
            relatedUsers,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Error getting related users:', error);
        res.status(500).json({
            message: 'Failed to get related users',
            error: error.message,
        });
    }
};

const setDefaultMode = async (req, res) => {
    try {
        const userId = req.user.id;
        const { mode } = req.body;

        // Validate mode value
        if (!mode || !['light', 'dark'].includes(mode)) {
            return res.status(400).json({
                error: 'Invalid mode value',
                message: 'Mode must be either "light" or "dark"',
            });
        }

        // Update user's default mode
        const updatedUser = await userModel
            .findByIdAndUpdate(
                userId,
                { defaultMode: mode },
                { new: true, runValidators: true }
            )
            .select('defaultMode');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Display mode updated successfully',
            mode: updatedUser.defaultMode,
        });
    } catch (error) {
        console.error('Error updating display mode:', error);
        res.status(500).json({
            error: 'Failed to update display mode',
            details: error.message,
        });
    }
};

const getDefaultMode = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await userModel.findById(userId).select('defaultMode');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            mode: user.defaultMode,
        });
    } catch (error) {
        console.error('Error fetching display mode:', error);
        res.status(500).json({
            error: 'Failed to fetch display mode',
            details: error.message,
        });
    }
};

module.exports = {
    getAllUsers,
    getMe,
    getUserProfile,
    addEducation,
    editEducation,
    getEducation,
    getEducations,
    deleteEducation,
    editIntro,
    addExperience,
    getAllExperiences,
    updateExperience,
    sortWorkExperience,
    addSkill,
    getAllSkills,
    updateSkill,
    uploadProfilePicture,
    uploadCoverPicture,
    getResume,
    uploadResume,
    deleteResume,
    deleteSkill,
    deleteExperience,
    deleteProfilePicture,
    deleteCoverPicture,
    getSkill,
    getExperience,
    getProfilePicture,
    getCoverPicture,
    addEndorsement,
    deleteEndorsement,
    updatePrivacySettings,
    followEntity,
    unfollowEntity,
    editContactInfo,
    editAbout,
    uploadPicture,
    getUserActivity,
    searchUsers,
    searchUsersByName,
    sendConnectionRequest,
    handleConnectionRequest,
    getConnectionsList,
    getPendingRequests,
    removeConnection,
    blockUser,
    unblockUser,
    getBlockedUsers,
    sendMessageRequest,
    getMessageRequests,
    handleMessageRequest,
    getRelatedUsers,
    getSavedPosts,
    setDefaultMode,
    getDefaultMode,
};
