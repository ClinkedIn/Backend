const userModel = require('../models/userModel');

const addExpperience = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const experienceData = {
            jobTitle: req.body.jobTitle,
            companyName: req.body.companyName,
            fromDate: req.body.fromDate,
            toDate: req.body.toDate,
            currentlyWorking: req.body.currentlyWorking,
            employmentType: req.body.employmentType,
            location: req.body.location,
            locationType: req.body.locationType,
            description: req.body.description,
            foundVia: req.body.foundVia,
            skills: req.body.skills,
            media: req.body.media
        };

        if (!experienceData.jobTitle) {
            return res.status(400).json({ error: 'Job Title is required' });
        }
        if (!experienceData.companyName) {
            return res.status(400).json({error: 'Company Name is required'})
        }
        if (!experienceData.startDate) {
            return res.status(400).json({error: 'Start Date is required'})
        }
        if (!experienceData.endDate && !experienceData.currentlyWorking) {
            return res.status(400).json({error: 'End Date is required'}) 
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $push: { workExperience: experienceData } },
            { new: true, runValidators: true }
        )

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Experience added successfully',
            education: updatedUser.education[updatedUser.education.length - 1]
        });

    } catch (error) {
        console.error('Error adding Experience:', error);
        res.status(500).json({ 
            error: 'Failed to add education',
            details: error.message 
        });
    }
}

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
    addExpperience
};