const userModel = require('../models/userModel');
const { sortWorkExperience, validateSkillName, validateEndorsements} = require('../utils/userProfileUtils') 
const cloudinary = require('../utils/cloudinary');
//import { ObjectId } from 'mongodb';
const mongoose = require('mongoose')
const { uploadFile, uploadMultipleImages,deleteFileFromUrl } = require('../utils/cloudinaryUpload');
const companyModel = require('../models/companyModel');
const { get } = require('mongoose');


const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Find the user by ID
        const user = await userModel.findById(userId).select('-password -resetPasswordToken -resetPasswordTokenExpiry -verificationToken -refreshToken');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check privacy settings
        const requesterId = req.user.id; // Current authenticated user
        
        // If not requesting own profile and profile is private
        if (userId !== requesterId && user.profilePrivacySettings === 'private') {
            return res.status(403).json({ message: 'This profile is private' });
        }
        
        // If profile is set to connections only, check if they're connected
        if (userId !== requesterId && 
            user.profilePrivacySettings === 'connectionsOnly' &&
            !user.connectionList.includes(requesterId)) {
            return res.status(403).json({ message: 'This profile is only visible to connections' });
        }
        if (userId !== requesterId && user.blockedUsers.includes(requesterId)) {
            return res.status(403).json({ message: 'This profile is not available' });
        }
        res.status(200).json({ 
            message: 'User profile retrieved successfully',
            user
        });
    } catch (error) {
        console.error('Error retrieving user profile:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve user profile',
            error: error.message 
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
                { lastName: { $regex: name, $options: 'i' } }
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
        const users = await userModel.find(filter)
            .select('firstName lastName profilePicture location industry mainEducation bio profilePrivacySettings')
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
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve users',
            error: error.message 
        });
    }
};
/*
****************************************************
************ PROFILE AND COVER PICTURES ************
****************************************************
*/

const uploadUserPicture = async (req, res, fieldName) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const userId = req.user.id;
        // Validate file type (allow only JPEG, PNG)
        console.log(req.file.mimetype)
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/heic',
            'image/heif',
            'image/bmp',
            'image/tiff',
            'image/svg+xml'
          ];
          
          if (!allowedMimeTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ 
              message: 'Invalid file type. Only JPEG, PNG, GIF, WebP, HEIC, HEIF, BMP, TIFF, and SVG are allowed.' 
            });
          }
        // Validate file size (limit: 5MB)
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (req.file.size > MAX_FILE_SIZE) {
            return res.status(400).json({ message: 'File size too large. Maximum allowed size is 5MB.' });
        }

        const uploadResult = await uploadFile(req.file.buffer);

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { [fieldName]: uploadResult.url },  // Dynamically updating field (profilePicture or coverPicture)
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: `${fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())} updated successfully`,
            [fieldName]: uploadResult.url,
        });
    } catch (error) {
        console.error(`Error uploading ${fieldName}:`, error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Upload profile picture
const uploadProfilePicture = (req, res) => uploadUserPicture(req, res, 'profilePicture');

// Upload cover picture
const uploadCoverPicture = (req, res) => uploadUserPicture(req, res, 'coverPicture');


const deleteUserPicture = async (req, res, fieldName) => {
    try {
        const userId = req.user.id;

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { [fieldName]: null },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: `${fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())} deleted successfully`
        });
    } catch (error) {
        console.error(`Error deleting ${fieldName}:`, error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Delete profile picture
const deleteProfilePicture = (req, res) => deleteUserPicture(req, res, 'profilePicture');

// Delete cover picture
const deleteCoverPicture = (req, res) => deleteUserPicture(req, res, 'coverPicture');


const getUserPicture = async (req, res, fieldName) => {
    try {
        const userId = req.user.id;

        // Find the user and retrieve only the required field
        const user = await userModel.findById(userId).select(fieldName);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user[fieldName]) {
            return res.status(400).json({ message: `${fieldName.replace(/([A-Z])/g, ' $1')} not set` });
        }

        res.status(200).json({ [fieldName]: user[fieldName] });
    } catch (error) {
        console.error(`Error retrieving ${fieldName}:`, error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get profile picture
const getProfilePicture = (req, res) => getUserPicture(req, res, 'profilePicture');

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
        const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(user.resume)}&embedded=true`;

        res.status(200).json({ 
            message: 'Resume retrieved successfully',
            resume: user.resume,
            googleDocsUrl: googleDocsUrl
        });
    } catch (error) {
        console.error('Error retrieving resume:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve resume',
            error: error.message 
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
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
          
        if (!allowedMimeTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ 
                message: 'Invalid file type. Only PDF, DOC, and DOCX are allowed.' 
            });
        }
        
        // Validate file size (limit: 10MB)
        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        if (req.file.size > MAX_FILE_SIZE) {
            return res.status(400).json({ 
                message: 'File size too large. Maximum allowed size is 10MB.' 
            });
        }

        console.log('Uploading file with mimetype:', req.file.mimetype);

        // Use 'raw' resource type for documents instead of 'document'
        const uploadResult = await uploadFile(req.file.buffer, 'raw');

        if (!uploadResult || !uploadResult.url) {
            throw new Error('Failed to get upload URL from Cloudinary');
        }

        console.log('Cloudinary upload successful:', uploadResult);

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { resume: uploadResult.url },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Resume uploaded successfully',
            resume: uploadResult.url
        });
    } catch (error) {
        console.error('Error uploading resume:', error);
        res.status(500).json({ 
            message: 'Failed to upload resume',
            error: error.message,
            details: error.http_code ? `HTTP Code: ${error.http_code}` : 'Unknown error'
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
      
      if (deleteResult.result !== 'ok' && deleteResult.result !== 'no file to delete') {
        return res.status(500).json({ 
          message: 'Failed to delete resume from storage',
          details: deleteResult
        });
      }
      
      // Update user in database
      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { resume: null },
        { new: true }
      );
      
      res.status(200).json({
        message: 'Resume deleted successfully'
      });
      
    } catch (error) {
      console.error('Error deleting resume:', error);
      res.status(500).json({ 
        message: 'Failed to delete resume',
        error: error.message 
      });
    }
  };

/*
***************************************************
***************** WORK EXPERIENCE *****************
***************************************************
*/

const addExperience = async (req, res) => {
    try {
        const userId = req.user.id;

        const experienceData = {
            jobTitle: req.body.jobTitle,
            companyName: req.body.companyName,
            fromDate: req.body.fromDate ? new Date(req.body.fromDate) : null,
            toDate: req.body.currentlyWorking ? null : (req.body.toDate ? new Date(req.body.toDate) : null),
            currentlyWorking: req.body.currentlyWorking,
            employmentType: req.body.employmentType,
            location: req.body.location,
            locationType: req.body.locationType,
            description: req.body.description,
            foundVia: req.body.foundVia,
            skills: req.body.skills,
            media: req.body.media
        };

        if (!experienceData.jobTitle) return res.status(400).json({ error: 'Job Title is required' });
        if (!experienceData.companyName) return res.status(400).json({ error: 'Company Name is required' });
        if (!experienceData.fromDate) return res.status(400).json({ error: 'Start Date is required' });
        if (isNaN(experienceData.fromDate.getTime())) return res.status(400).json({ error: 'Invalid Start Date' });
        if (!experienceData.currentlyWorking && !experienceData.toDate) return res.status(400).json({ error: 'End Date is required' });
        if (!req.body.currentlyWorking && isNaN(experienceData.toDate.getTime())) return res.status(400).json({ error: 'Invalid End Date' });

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.workExperience.push(experienceData);

        user.workExperience = sortWorkExperience(user.workExperience);
        // console.log(user.workExperience)

        await user.save();

        const responseExperience = {
            ...experienceData,
            fromDate: experienceData.fromDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
            toDate: experienceData.toDate ? experienceData.toDate.toISOString().split('T')[0] : null
        };

        const formattedWorkExperience = user.workExperience.map(exp => {
            const expObj = exp.toObject ? exp.toObject() : exp;
            return {
                ...expObj,
                fromDate: expObj.fromDate instanceof Date ?
                    expObj.fromDate.toISOString().split('T')[0] : expObj.fromDate,
                toDate: expObj.toDate instanceof Date ?
                    expObj.toDate.toISOString().split('T')[0] : expObj.toDate
            };
        });

        res.status(200).json({
            message: 'Experience added successfully',
            experience: responseExperience,
            sortedWorkExperience: formattedWorkExperience
        });

    } catch (error) {
        console.error('Error adding Experience:', error);
        res.status(500).json({
            error: 'Failed to add experience',
            details: error.message
        });
    }
};


/**
 * @route GET /api/experience/:index
 * @description Get a specific experience by index
 * @access Private
 * @param {number} req.params.index - Index of the experience to retrieve
 * @returns {Object} Experience object at the specified index
 */
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
            return res.status(400).json({ error: 'Experience index out of range' });
        }

        res.status(200).json({ experience: user.workExperience[experienceIndex] });

    } catch (error) {
        console.error('Error fetching experience:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};


const getAllExperiences = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ experiences: user.experience });
    } catch (error) {
        console.error('Error fetching experiences:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateExperience = async (req, res) => {
    try {
        const userId = req.user.id;
        const experienceIndex = parseInt(req.params.index, 10);
        const updatedData = req.body;

        // Validate dates if provided
        if (updatedData.fromDate && isNaN(Date.parse(updatedData.fromDate))) {
            return res.status(400).json({ error: 'Invalid Start Date' });
        }

        if (updatedData.toDate && isNaN(Date.parse(updatedData.toDate))) {
            return res.status(400).json({ error: 'Invalid End Date' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (experienceIndex < 0 || experienceIndex >= user.workExperience.length) {
            return res.status(404).json({ message: 'Experience not found' });
        }

        user.workExperience[experienceIndex] = {
            ...user.workExperience[experienceIndex],
            ...updatedData
        };

        user.workExperience = sortWorkExperience(user.workExperience);

        await user.save();

        res.status(200).json({
            message: 'Experience updated successfully',
            experience: user.workExperience
        });

    } catch (error) {
        console.error('Error updating experience:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteExperience = async (req, res) => {
    try {
        const userId = req.user.id;
        const experiencelIndex = parseInt(req.params.index, 10);

        if (isNaN(experiencelIndex) || experiencelIndex < 0) {
            return res.status(400).json({ error: 'Invalid experience index' });
        }

        const user = await userModel.findById(userId).select('workExperience');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (experiencelIndex >= user.workExperience.length) {
            return res.status(400).json({ error: 'Invalid experience index' });
        }

        const deletedSkill = user.skills[experiencelIndex];

        await userModel.findByIdAndUpdate(userId, {
            $pull: { workExperience: { $eq: user.workExperience[experiencelIndex] } }
        });

        res.status(200).json({
            message: 'Experience deleted successfully',
            deletedSkill
        });

    } catch (error) {
        console.error('Error deleting experience:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
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
        const { skillName, educationIndexes } = req.body;

        // Validate skill name and check for duplicates
        const [skillValidation, skillExists, user] = await Promise.all([
            validateSkillName(skillName),
            userModel.exists({ 
                _id: userId, 
                "skills.skillName": { $regex: new RegExp(`^${skillName}$`, "i") }
            }),
            userModel.findById(userId, "education skills") // Fetch user education and skills
        ]);

        if (!skillValidation.valid) {
            return res.status(400).json({ error: skillValidation.message });
        }

        if (skillExists) {
            return res.status(400).json({ error: 'Skill already exists' });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Validate education indexes
        if (!Array.isArray(educationIndexes)) {
            return res.status(400).json({ error: "Education indexes must be an array" });
        }

        const validIndexes = educationIndexes.filter(index => 
            Number.isInteger(index) && index >= 0 && index < user.education.length
        );

        if (validIndexes.length !== educationIndexes.length) {
            return res.status(400).json({ error: "Some provided education indexes are invalid" });
        }

        // Add the skill with associated education indexes
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $push: { skills: { skillName, endorsements: [], education: validIndexes } } },
            { new: true, select: 'skills', lean: true }
        );

        res.status(200).json({ 
            message: 'Skill added successfully', 
            skill: updatedUser.skills.at(-1) 
        });

    } catch (error) {
        console.error('Error adding skill:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};


// Get a specific user skill
const getSkill = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skillName } = req.params;
        
        // Use projection to get only the matching skill
        const user = await userModel.findById(userId, {
            skills: { $elemMatch: { skillName: new RegExp(`^${skillName}$`, "i") } }
        }).lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.skills || user.skills.length === 0) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        res.status(200).json({ skill: user.skills[0] });
    } catch (error) {
        console.error('Error fetching skill:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
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
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

const updateSkill = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skillName } = req.params;
        const { newSkillName, educationIndexes } = req.body;

        if (!newSkillName && !Array.isArray(educationIndexes)) {
            return res.status(400).json({ error: 'No updates provided' });
        }

        // Fetch user details
        const user = await userModel.findById(userId, "skills education");
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find the skill index
        const skillIndex = user.skills.findIndex(skill => 
            skill.skillName.toLowerCase() === skillName.toLowerCase()
        );

        if (skillIndex === -1) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        let updates = {};
        
        // Validate and update skill name
        if (newSkillName) {
            const skillValidation = validateSkillName(newSkillName);
            if (!skillValidation.valid) {
                return res.status(400).json({ error: skillValidation.message });
            }

            if (newSkillName.toLowerCase() === skillName.toLowerCase()) {
                return res.status(400).json({ error: 'Skill name is the same' });
            }

            const duplicateExists = user.skills.some(skill => 
                skill.skillName.toLowerCase() === newSkillName.toLowerCase()
            );

            if (duplicateExists) {
                return res.status(400).json({ error: 'Skill already exists' });
            }

            updates[`skills.${skillIndex}.skillName`] = newSkillName;
        }

        // Validate and update education indexes
        if (Array.isArray(educationIndexes)) {
            const validIndexes = educationIndexes.filter(index => 
                Number.isInteger(index) && index >= 0 && index < user.education.length
            );

            if (validIndexes.length !== educationIndexes.length) {
                return res.status(400).json({ error: "Some provided education indexes are invalid" });
            }

            updates[`skills.${skillIndex}.education`] = validIndexes;
        }

        // Apply updates
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, projection: { skills: 1 } }
        );

        res.status(200).json({ 
            message: 'Skill updated successfully', 
            skill: updatedUser.skills[skillIndex] 
        });

    } catch (error) {
        console.error('Error updating skill:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

// Delete skill by skill name
const deleteSkill = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skillName } = req.params;

        const user = await userModel.findOne(
            { _id: userId },
            { skills: { $elemMatch: { skillName: new RegExp(`^${skillName}$`, "i") } } }
        ).lean();

        if (!user || !user.skills || user.skills.length === 0) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        const skillToDelete = user.skills[0];

        const result = await userModel.findByIdAndUpdate(
            userId,
            { $pull: { skills: { skillName: { $regex: new RegExp(`^${skillName}$`, "i") } } } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ 
            message: 'Skill deleted successfully', 
            deletedSkill: skillToDelete 
        });
    } catch (error) {
        console.error('Error deleting skill:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};


const addEndorsement = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("User ID: ", userId);
        
        const { skillOwnerId, skillName } = req.body;
        
        if (userId == skillOwnerId) {
            return res.status(400).json({ error: "User cannot endorse himself" });
        }

        let user = await userModel.findOne(
            { _id: skillOwnerId, "skills.skillName": new RegExp(`^${skillName}$`, "i") },
            { "skills.$": 1 }
        );

        if (!user) {
            return res.status(404).json({ error: "User or skill not found" });
        }

        const skill = user.skills[0];
        if (skill.endorsements.some(id => id.toString() === userId)) {
            return res.status(400).json({ error: "You have already endorsed this skill once" });
        }

        user = await userModel.findOneAndUpdate(
            { _id: skillOwnerId, "skills.skillName": new RegExp(`^${skillName}$`, "i") },
            { $push: { "skills.$.endorsements": new mongoose.Types.ObjectId(userId) } },
            { new: true }
        );

        const updatedSkill = user.skills.find(skill => 
            new RegExp(`^${skillName}$`, "i").test(skill.skillName)
        );

        res.status(200).json({
            message: "Skill endorsement created successfully",
            skill: updatedSkill
        });

    } catch (error) {
        console.error("Error endorsing skill:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

const deleteEndorsement = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("User ID:", userId);
        
        let { skillOwnerId } = req.body;
        const skillName = req.params.skillName;
        skillOwnerId = new mongoose.Types.ObjectId(skillOwnerId);
        console.log("Skill Owner ID:", skillOwnerId);
        console.log("Skill Name:", skillName);

        let user = await userModel.findOne(
            { _id: skillOwnerId, "skills.skillName": new RegExp(`^${skillName}$`, "i") },
            { "skills.$": 1 }
        );
        if (!user) {
            return res.status(404).json({ error: "User or skill not found" });
        }

        const skill = user.skills[0];
        if (!skill.endorsements.includes(userId)) {
            return res.status(404).json({ error: "No endorsement found from this user for this skill" });
        }

        user = await userModel.findOneAndUpdate(
            { _id: skillOwnerId, "skills.skillName": new RegExp(`^${skillName}$`, "i") },
            { $pull: { "skills.$.endorsements": userId } },
            { new: true }
        );

        const updatedSkill = user.skills.find(skill =>
            new RegExp(`^${skillName}$`, "i").test(skill.skillName)
        );

        res.status(200).json({
            message: "Skill endorsement deleted successfully",
            skill: updatedSkill
        });

    } catch (error) {
        console.error("Error Removing Skill Endorsement:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};


//------------------------------------------EDUCATION--------------------------
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
            media: req.body.media
        };

        if (!educationData.school) {
            return res.status(400).json({ error: 'School name is required' });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $push: { education: educationData } },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Education added successfully',
            education: updatedUser.education[updatedUser.education.length - 1]
        });

    } catch (error) {
        console.error('Error adding education:', error);
        res.status(500).json({
            error: 'Failed to add education',
            details: error.message
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
        if (educationIndex < 0 || educationIndex >= user.education.length || isNaN(educationIndex)) {
            return res.status(404).json({ message: 'Education not found' });
        }

        // Validate required field (school)
        if (!updatedData.school || updatedData.school.trim() === '') {
            return res.status(400).json({ error: 'School name is required' });
        }

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
            media: []
        };

        // Ensure all keys are present and merge updated data
        const mergedEducation = Object.assign({}, defaultEducation, updatedData);

        // Update the education entry
        user.education[educationIndex] = mergedEducation;
        await user.save();

        res.status(200).json({
            message: 'Education updated successfully',
            education: user.education[educationIndex]
        });

    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({
            error: 'Failed to update education',
            details: error.message
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
        if (isNaN(educationIndex) || educationIndex < 0 || educationIndex >= user.education.length) {
            return res.status(400).json({ message: 'Invalid education index' });
        }
        res.status(200).json({
            message: 'Education updated successfully',
            education: user.education[educationIndex]
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
            educations: user.education
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

        if (isNaN(educationIndex) || educationIndex < 0 || educationIndex >= user.education.length) {
            return res.status(400).json({ message: 'Invalid education index' });
        }

        user.education.splice(educationIndex, 1);
        await user.save();

        res.status(200).json({
            message: 'Education deleted successfully',
            educations: user.education
        });

    } catch (error) {
        console.error('Error deleting education:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

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
            bio,
            location,
            mainEducation,
            industry
        } = req.body;

        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'bio', 'location', 'industry', 'mainEducation'];
        const missingFields = requiredFields.filter(field => req.body[field] === undefined || req.body[field] === null);

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: 'Missing required fields',
                missingFields
            });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            {
                $set: {
                    firstName,
                    lastName,
                    bio,
                    location,
                    mainEducation,
                    industry
                }
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
                bio: updatedUser.bio,
                location: updatedUser.location,
                industry: updatedUser.industry
            }
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            error: 'Failed to update profile',
            details: error.message
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
                error: 'profilePrivacySettings is required' 
            });
        }
        
        // Validate that the value is one of the allowed enum values
        const allowedValues = ["public", "private", "connectionsOnly"];
        if (!allowedValues.includes(profilePrivacySettings)) {
            return res.status(400).json({
                error: `Invalid value for profilePrivacySettings. Must be one of: ${allowedValues.join(', ')}`
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
            profilePrivacySettings: updatedUser.profilePrivacySettings
        });

    } catch (error) {
        console.error('Error updating privacy settings:', error);
        res.status(500).json({
            error: 'Failed to update privacy settings',
            details: error.message
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
                message: `Invalid entity type. Must be one of: ${validEntityTypes.join(', ')}` 
            });
        }

        // If following a user, prevent self-following
        if (entityType === 'User' && followerId === targetId) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        // Get follower user
        const followerUser = await userModel.findById(followerId);
        if (!followerUser) {
            return res.status(404).json({ message: 'Your user account not found' });
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
        if (entityType === 'User' && 
            targetEntity.blockedUsers && 
            targetEntity.blockedUsers.includes(followerId)) {
            return res.status(400).json({ message: 'Cannot follow this user' });
        }

        // Check if already following
        const alreadyFollowing = followerUser.following.some(
            follow => follow.entity.toString() === targetId && follow.entityType === entityType
        );

        if (alreadyFollowing) {
            return res.status(400).json({ message: `You are already following this ${entityType.toLowerCase()}` });
        }

        // Update follower's following list
        followerUser.following.push({
            entity: targetId,
            entityType: entityType,
            followedAt: new Date()
        });

        // Update target entity's followers list
        if (entityType === 'User') {
            targetEntity.followers.push({
                entity: followerId,
                entityType: 'User',
                followedAt: new Date()
            });
            await Promise.all([followerUser.save(), targetEntity.save()]);
        } else if (entityType === 'Company') {
            targetEntity.followers.push({
                entity: followerId,
                entityType: 'User',
                followedAt: new Date()
            });
            await Promise.all([followerUser.save(), targetEntity.save()]);
        }

        res.status(200).json({ message: `${entityType} followed successfully` });
    } catch (error) {
        console.error('Error following entity:', error);
        res.status(500).json({ 
            message: 'Failed to follow entity',
            error: error.message 
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
                message: `Invalid entity type. Must be one of: ${validEntityTypes.join(', ')}` 
            });
        }

        // If unfollowing a user, prevent self-unfollowing
        if (entityType === 'User' && followerId === targetId) {
            return res.status(400).json({ message: 'You cannot unfollow yourself' });
        }

        // Get follower user
        const followerUser = await userModel.findById(followerId);
        if (!followerUser) {
            return res.status(404).json({ message: 'Your user account not found' });
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
            follow => follow.entity.toString() === targetId && follow.entityType === entityType
        );

        if (followingIndex === -1) {
            return res.status(400).json({ message: `You are not following this ${entityType.toLowerCase()}` });
        }

        // Remove from follower's following list
        followerUser.following.splice(followingIndex, 1);

        // Remove from target entity's followers list
        if (targetEntity.followers) {
            const followerIndex = targetEntity.followers.findIndex(
                follow => follow.entity.toString() === followerId && follow.entityType === 'User'
            );
            
            if (followerIndex !== -1) {
                targetEntity.followers.splice(followerIndex, 1);
            }
        }

        // Save both updates in parallel
        await Promise.all([
            followerUser.save(),
            targetEntity.save()
        ]);

        res.status(200).json({ message: `${entityType} unfollowed successfully` });
    } catch (error) {
        console.error('Error unfollowing entity:', error);
        res.status(500).json({ 
            message: 'Failed to unfollow entity',
            error: error.message 
        });
    }
};

module.exports = {
    getAllUsers,
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
    unfollowEntity
};