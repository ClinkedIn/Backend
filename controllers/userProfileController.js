const userModel = require('../models/userModel');
const { sortWorkExperience, validateSkillName, validateEndorsements} = require('../utils/userProfileUtils') 
const cloudinary = require('../utils/cloudinary');
const { uploadFile, uploadMultipleImages } = require('../utils/cloudinaryUpload');
//import { ObjectId } from 'mongodb';
const mongoose = require('mongoose')
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
        const { skillName } = req.body;

        // Run validation and existence check in parallel
        const [skillValidation, skillExists] = await Promise.all([
            validateSkillName(skillName),
            userModel.exists({ 
                _id: userId, 
                "skills.skillName": { $regex: new RegExp(`^${skillName}$`, "i") }
            })
        ]);

        if (!skillValidation.valid) {
            return res.status(400).json({ error: skillValidation.message });
        }

        if (skillExists) {
            console.log('skill exists')
            return res.status(400).json({ error: 'Skill already exists' });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $push: { skills: { skillName, endorsements: [] } } },
            { new: true, select: 'skills', lean: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

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

// Update skill by index
const updateSkill = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skillName } = req.params;
        const { newSkillName } = req.body;

        if (!newSkillName) {
            return res.status(400).json({ error: 'No updates provided' });
        }

        const skillExists = await userModel.exists({ 
            _id: userId, 
            "skills.skillName": { $regex: new RegExp(`^${skillName}$`, "i") }
        });
        
        if (!skillExists) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        let updates = {};
       // let validEndorsements;

        if (newSkillName) {
            const skillValidation = validateSkillName(newSkillName);
            if (!skillValidation.valid) {
                return res.status(400).json({ error: skillValidation.message });
            }
            if (newSkillName.toLowerCase() == skillName.toLowerCase()) {
                return res.status(400).json({ error: 'Skill already exists' });
            }
            const duplicateExists = await userModel.exists({ 
                 _id: userId, 
                "skills.skillName": { $regex: new RegExp(`^${newSkillName}$`, "i") }
             });
            console.log('Duplicate Exists: ', duplicateExists )
            if (duplicateExists) {
                console.log(duplicateExists)
                return res.status(400).json({ error: 'Skill already exists' });
            }
            
            updates["skills.$.skillName"] = newSkillName;
        }

        /*
        if (endorsements) {
            const endorsementsValidation = await validateEndorsements(endorsements, userId);
            if (!endorsementsValidation.valid) {
                return res.status(400).json({ error: endorsementsValidation.message, invalidUserIds: endorsementsValidation.invalidUserIds });
        }
        validEndorsements = endorsementsValidation.endorsements;
        updates["skills.$.endorsements"] = validEndorsements;
        }
        */

        const updatedUser = await userModel.findOneAndUpdate(
            { 
                _id: userId, 
                "skills.skillName": { $regex: new RegExp(`^${skillName}$`, "i") } 
            },
            { $set: updates },
            { 
                new: true,
                projection: { 
                    skills: { 
                        $elemMatch: { 
                            skillName: newSkillName ? 
                                new RegExp(`^${newSkillName}$`, "i") : 
                                new RegExp(`^${skillName}$`, "i") 
                        } 
                    } 
                }
            }
        );

        if (!updatedUser || !updatedUser.skills || updatedUser.skills.length === 0) {
            return res.status(404).json({ error: 'Failed to update skill' });
        }

        res.status(200).json({ 
            message: 'Skill updated successfully', 
            skill: updatedUser.skills[0] 
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
const editIntro = async(req, res) => {
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


module.exports = { 
    addEducation,
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
    deleteSkill,
    deleteExperience,
    deleteProfilePicture,
    deleteCoverPicture,
    getSkill,
    getExperience,
    getProfilePicture,
    getCoverPicture,
    addEndorsement,
    deleteEndorsement
};