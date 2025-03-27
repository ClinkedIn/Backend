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
/*
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
*/
  
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
      let skill = user.skills.find(s => s.skillName === skillName);
      
      if (skill) {
          // If skill exists, ensure experience index is present
          if (!skill.experience.includes(experienceIndex)) {
              skill.experience.push(experienceIndex);
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
  };



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

const checkUserAccessPermission = async (user, requesterId, requester = null, accessType = 'view') => {
  try {
      // If user is accessing their own data, always allow
      if (user._id.toString() === requesterId) {
          return { hasAccess: true };
      }
      
      // If requester object wasn't provided, fetch it
      if (!requester) {
          requester = await userModel.findById(requesterId).select('connectionList blockedUsers');
          if (!requester) {
              return { hasAccess: false, message: 'Requester not found', statusCode: 404 };
          }
      }
      
      // Check if either user has blocked the other
      if (user.blockedUsers && user.blockedUsers.includes(requesterId)) {
          return { hasAccess: false, message: 'You are blocked by this user', statusCode: 403 };
      }
      
      if (requester.blockedUsers && requester.blockedUsers.includes(user._id.toString())) {
          return { hasAccess: false, message: 'You have blocked this user', statusCode: 403 };
      }
      
      //Check privacy settings
      if (user.profilePrivacySettings === 'private') {
          return { hasAccess: false, message: 'This user has a private profile', statusCode: 403 };
      }
      
      if (user.profilePrivacySettings === 'connectionsOnly') {
          // Check if requester is in user's connections
          const isConnected = requester.connectionList && 
                             requester.connectionList.some(conn => 
                               conn.toString() === user._id.toString());
          
          if (!isConnected) {
              return { hasAccess: false, message: 'You are not connected with this user', statusCode: 403 };
          }
      }
      
      // If we get here, access is allowed
      return { hasAccess: true };
      
  } catch (error) {
      console.error('Error checking user access permission:', error);
      return { 
          hasAccess: false, 
          message: 'Error checking access permission', 
          statusCode: 500,
          error 
      };
  }
};

module.exports = { checkUserAccessPermission,sortWorkExperience, validateSkillName,  uploadPicture, handleUserPicture,updateSkillExperienceReferences
};
