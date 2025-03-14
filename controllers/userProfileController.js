const userModel = require('../models/userModel');
const { sortWorkExperience, validateSkillName, validateEndorsements } = require('../utilities/userProfileUtils')
const cloudinary = require('../utils/cloudinary');
const { uploadFile, uploadMultipleImages } = require('../utils/cloudinaryUpload');

const uploadUserPicture = async (req, res, fieldName) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Validate file type (allow only JPEG, PNG)
        const allowedMimeTypes = ['image/jpeg', 'image/png'];
        if (!allowedMimeTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ message: 'Invalid file type. Only JPEG and PNG are allowed.' });
        }

        // Validate file size (limit: 5MB)
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (req.file.size > MAX_FILE_SIZE) {
            return res.status(400).json({ message: 'File size too large. Maximum allowed size is 5MB.' });
        }

        const uploadResult = await uploadFile(req.file.buffer);

        const updatedUser = await userModel.findByIdAndUpdate(
            req.user.id,
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

// Controller functions
const uploadProfilePicture = (req, res) => uploadUserPicture(req, res, 'profilePicture');
const uploadCoverPicture = (req, res) => uploadUserPicture(req, res, 'coverPicture');


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


const getUserExperiences = async (req, res) => {
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


const addSkill = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skillName, endorsements } = req.body;
        //console.log('Request Body:', req.body);
        // Validate skill name
        const skillValidation = validateSkillName(skillName);
        if (!skillValidation.valid) {
            return res.status(400).json({ error: skillValidation.message });
        }

        // Validate endorsements
        const endorsementsValidation = await validateEndorsements(endorsements, userId);
        if (!endorsementsValidation.valid) {
            return res.status(400).json({ error: endorsementsValidation.message, invalidUserIds: endorsementsValidation.invalidUserIds });
        }

        const skillData = {
            skillName,
            endorsements: endorsementsValidation.endorsements,
        };

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $push: { skills: skillData } },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Skill added successfully',
            skill: updatedUser.skills[updatedUser.skills.length - 1]
        });

    } catch (error) {
        console.error('Error adding skill:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

// Get all user skills
const getUserSkills = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ skills: user.skills });
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateSkill = async (req, res) => {
    try {
        const userId = req.user.id;
        const skillIndex = parseInt(req.params.index, 10);
        const { skillName, endorsements } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate skill index
        if (isNaN(skillIndex) || skillIndex < 0 || skillIndex >= user.skills.length) {
            return res.status(400).json({ message: 'Invalid skill index' });
        }

        // Validate skill name
        if (skillName) {
            const skillValidation = validateSkillName(skillName);
            if (!skillValidation.valid) {
                return res.status(400).json({ message: skillValidation.message });
            }
        }

        let validEndorsements = user.skills[skillIndex].endorsements; // Default to existing endorsements

        // Validate endorsements if provided
        if (endorsements) {
            const endorsementsValidation = await validateEndorsements(endorsements);
            if (!endorsementsValidation.valid) {
                return res.status(400).json({ message: endorsementsValidation.message, invalidUserIds: endorsementsValidation.invalidUserIds });
            }
            validEndorsements = endorsementsValidation.endorsements;
        }

        // Update the skill
        user.skills[skillIndex] = {
            ...user.skills[skillIndex],
            ...(skillName && { skillName }),
            endorsements: validEndorsements
        };

        await user.save();

        res.status(200).json({
            message: 'Skill updated successfully',
            skill: user.skills[skillIndex]
        });

    } catch (error) {
        console.error('Error updating skill:', error);
        res.status(500).json({ message: 'Server error', details: error.message });
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

//======================INTRO=====================
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


module.exports = {
    addEducation,
    editEducation,
    getEducation,
    getEducations,
    deleteEducation,
    editIntro,
    addExperience,
    getUserExperiences,
    updateExperience,
    sortWorkExperience,
    addSkill,
    getUserSkills,
    updateSkill,
    uploadProfilePicture,
    uploadCoverPicture
};