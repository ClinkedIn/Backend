const userModel = require('../models/userModel');
const mongoose = require('mongoose');
const { uploadFile, uploadMultipleImages,deleteFileFromUrl } = require('../utils/cloudinaryUpload');

const sortWorkExperience = (workExperience) => {
    return workExperience.sort((a, b) => {
        // 1. Currently working experiences come first
        if (a.currentlyWorking && !b.currentlyWorking) return -1;
        if (!a.currentlyWorking && b.currentlyWorking) return 1;

        // 2. Compare toDate (if both have toDate)
        const toDateA = a.toDate ? new Date(a.toDate) : new Date(0);
        const toDateB = b.toDate ? new Date(b.toDate) : new Date(0);
        if (toDateA > toDateB) return -1;
        if (toDateA < toDateB) return 1;

        // 3. If toDate is the same or missing, compare fromDate
        const fromDateA = new Date(a.fromDate);
        const fromDateB = new Date(b.fromDate);
        if (fromDateA > fromDateB) return -1;
        if (fromDateA < fromDateB) return 1;
        
        return 0;
    });
};


const validateSkillName = (skillName) => {
    if (!skillName || typeof skillName !== 'string' || skillName.trim().length < 2 || skillName.trim().length > 50) {
        return { valid: false, message: 'Invalid skill name' };
    }
    return { valid: true };
};

// Helper function to validate endorsements
const validateEndorsements = async (endorsements, userId) => {
    if (!Array.isArray(endorsements)) {
        throw new Error('Endorsements must be an array');
    }

    if (endorsements.includes(userId)) {
        return { valid: false, message: 'Users cannot endorse themselves' };
    }

    // Check for duplicate endorsements
    const duplicates = endorsements.filter((id, index) => endorsements.indexOf(id) !== index);
    if (duplicates.length > 0) {
        return { valid: false, message: 'Duplicate endorsements are not allowed', duplicates };
    }

    const validObjectIds = endorsements.filter(id => mongoose.Types.ObjectId.isValid(id));

    //if (validObjectIds.length === 0) {
    //    return { valid: false, message: 'No valid MongoDB ObjectIds provided', endorsements };
    //}

    try {
        const existingUsers = await userModel.find({ _id: { $in: validObjectIds } }, '_id');

        if (!existingUsers || existingUsers.length === 0) {
            return { valid: false, message: 'No matching users found in database', endorsements };
        }

        const existingUserIds = existingUsers.map(user => user._id.toString());

        // Check for invalid user IDs
        const invalidUserIds = validObjectIds.filter(id => !existingUserIds.includes(id));
        if (invalidUserIds.length > 0) {
            return { valid: false, message: 'Some endorsement user IDs are invalid', invalidUserIds };
        }

        return { valid: true, endorsements: existingUserIds };
    } catch (error) {
        console.error('MongoDB Query Error:', error);
        throw new Error('Error fetching endorsements from MongoDB');
    }
};


  const formatExperienceDate = (date) => {
    return date instanceof Date ? date.toISOString().split('T')[0] : date;
  };
  
  const formatExperienceResponse = (experience) => {
    const expObj = experience.toObject ? experience.toObject() : experience;
    return {
      ...expObj,
      fromDate: formatExperienceDate(expObj.fromDate),
      toDate: formatExperienceDate(expObj.toDate)
    };
  };
  
  const validateExperienceData = (data) => {
    if (!data.jobTitle) {
      throw { status: 400, message: 'Job Title is required' };
    }
    if (!data.companyName) {
      throw { status: 400, message: 'Company Name is required' };
    }
    if (!data.fromDate) {
      throw { status: 400, message: 'Start Date is required' };
    }
    
    // Validate date formats
    const fromDate = new Date(data.fromDate);
    if (isNaN(fromDate.getTime())) {
      throw { status: 400, message: 'Invalid Start Date' };
    }
    
    if (!data.currentlyWorking && !data.toDate) {
      throw { status: 400, message: 'End Date is required' };
    }
    
    if (!data.currentlyWorking && data.toDate) {
      const toDate = new Date(data.toDate);
      if (isNaN(toDate.getTime())) {
        throw { status: 400, message: 'Invalid End Date' };
      }
    }
  };
  
  const updateSkillExperienceReferences = (user, experienceIndex, newSkills = [], oldSkills = []) => {
    // Remove experienceIndex from skills that are no longer associated
    for (const skillName of oldSkills) {
      if (!newSkills.includes(skillName)) {
        const skillIndex = user.skills.findIndex(s => s.skillName === skillName);
        if (skillIndex !== -1) {
          user.skills[skillIndex].experience = user.skills[skillIndex].experience.filter(i => i !== experienceIndex);
          
          // Remove skill if it's no longer referenced anywhere
          if (user.skills[skillIndex].experience.length === 0 && user.skills[skillIndex].education.length === 0) {
            user.skills.splice(skillIndex, 1);
          }
        }
      }
    }
  
    // Add experienceIndex to newly added skills
    for (const skillName of newSkills) {
      if (!oldSkills.includes(skillName)) {
        const skillIndex = user.skills.findIndex(s => s.skillName === skillName);
        if (skillIndex !== -1) {
          // If skill exists, add experience index if not already present
          if (!user.skills[skillIndex].experience.includes(experienceIndex)) {
            user.skills[skillIndex].experience.push(experienceIndex);
          }
        } else {
          // If skill does not exist, create a new entry
          user.skills.push({
            skillName,
            experience: [experienceIndex],
            education: [],
            endorsements: []
          });
        }
      }
    }
  };
  
  // Modified error handler to match test expectations
  const handleControllerError = (error, res, operation) => {
    console.error(`Error ${operation} experience:`, error);
    const status = error.status || 500;
    
    // Match the expected error messages in the tests
    if (status === 500) {
      if (operation === 'adding') {
        return res.status(status).json({
          error: 'Failed to add experience',
          details: error.message
        });
      } else {
        return res.status(status).json({
          message: 'Server error'
        });
      }
    } else {
      // For 4xx errors, maintain expected test format
      return res.status(status).json({
        error: error.message
      });
    }
  };

// PICTURE CONSTANTS
const ALLOWED_PICTURE_MIME_TYPES = Object.freeze([
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
    'image/heic', 'image/heif', 'image/bmp', 'image/tiff', 'image/svg+xml'
]);
const MAX_PICTURE_SIZE = 5 * 1024 * 1024; // 5MB
const INVALID_PICTURE_TYPE_MESSAGE = "Invalid file type. Only JPEG, PNG, GIF, WebP, HEIC, HEIF, BMP, TIFF, and SVG are allowed."


// Validation Functions
const validateFileType = async (ALLOWED_MIME_TYPES, mimeType, ERROR_MESSAGE) => {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new Error(ERROR_MESSAGE);
    }
};

const validateFileSize = async (maxSize, fileSize) => {
    if (fileSize > maxSize) {
        throw new Error('File size too large. Maximum allowed size is 5MB.');
    }
};

const validateFile = async (mimeType, fileSize) => {
    await Promise.all([
        validateFileType(ALLOWED_PICTURE_MIME_TYPES, mimeType, INVALID_PICTURE_TYPE_MESSAGE),
        validateFileSize(MAX_PICTURE_SIZE, fileSize)
    ]);
};

// File Upload Logic
const uploadPicture = async (fileBuffer, mimeType, fileSize) => {
    await validateFile(mimeType, fileSize);
    return await uploadFile(fileBuffer); // Assuming uploadFile() uploads and returns a file URL
};

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

            try {
                await validateFile(mimetype, size); // Validate before uploading
            } catch (validationError) {
                return res.status(400).json({ message: validationError.message });
            }

            const uploadResult = await uploadPicture(buffer, mimetype, size);
            updateData[fieldName] = uploadResult.url;
        }

        const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: `${fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ${isDelete ? 'deleted' : 'updated'} successfully`,
            ...(isDelete ? {} : { [fieldName]: updateData[fieldName] })
        });
    } catch (error) {
        console.error(`Error ${isDelete ? 'deleting' : 'uploading'} ${fieldName}:`, error);
        res.status(500).json({ 
            message: 'Internal server error', 
            error: error.message || 'Unexpected failure' 
        });
    }
};

module.exports = { sortWorkExperience, validateSkillName, validateEndorsements,  uploadPicture, handleUserPicture
};