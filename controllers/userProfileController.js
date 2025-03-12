const userModel = require('../models/userModel');
const { sortWorkExperience, validateSkillName, validateEndorsements} = require('../utilities/userProfileUtils') 

const addExperience = async (req, res) => {
    try {
        const userId = req.user.id;

        const experienceData = {
            jobTitle: req.body.jobTitle,
            companyName: req.body.companyName,
            fromDate: new Date(req.body.fromDate), 
            toDate: req.body.currentlyWorking ? null : new Date(req.body.toDate), 
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
        if (!experienceData.currentlyWorking && !experienceData.toDate) {
            return res.status(400).json({ error: 'End Date is required' });
        }

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

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (experienceIndex < 0 || experienceIndex >= user.workExperience.length) {
            return res.status(404).json({ message: 'Experience not found' });
        }
        //console.log(user.workExperience);
        user.workExperience[experienceIndex] = { 
            ...user.workExperience[experienceIndex], 
            ...updatedData 
        };
        
        user.workExperience = sortWorkExperience(user.workExperience);
        //console.log(user.workExperience);

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
        console.log('Request Body:', req.body);
        // Validate skill name
        const skillValidation = validateSkillName(skillName);
        if (!skillValidation.valid) {
            return res.status(400).json({ error: skillValidation.message });
        }

        // Validate endorsements
        const endorsementsValidation = await validateEndorsements(endorsements);
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
    getUserExperiences,
    updateExperience,
    sortWorkExperience,
    addSkill,
    getUserSkills,
    updateSkill
};