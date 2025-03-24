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


module.exports = { sortWorkExperience, validateSkillName, updateSkillExperienceReferences };