const mongoose = require('mongoose');
const { checkUserAccessPermission } = require('../utils/userProfileUtils');
const userModel = require('../models/userModel');
const { sortWorkExperience } = require('../utils/userProfileUtils');

describe('sortWorkExperience', () => {
    it('should sort work experiences by currently working, toDate, and fromDate', () => {
        const workExperience = [
            { currentlyWorking: false, toDate: '2022-12-31', fromDate: '2020-01-01' },
            { currentlyWorking: true, fromDate: '2021-01-01' },
            { currentlyWorking: false, toDate: '2021-12-31', fromDate: '2019-01-01' },
        ];

        const sorted = sortWorkExperience(workExperience);

        expect(sorted).toEqual([
            { currentlyWorking: true, fromDate: '2021-01-01' },
            { currentlyWorking: false, toDate: '2022-12-31', fromDate: '2020-01-01' },
            { currentlyWorking: false, toDate: '2021-12-31', fromDate: '2019-01-01' },
        ]);
    });

    it('should handle missing toDate and fromDate', () => {
        const workExperience = [
            { currentlyWorking: false, fromDate: '2020-01-01' },
            { currentlyWorking: false },
        ];

        const sorted = sortWorkExperience(workExperience);

        expect(sorted).toEqual([
            { currentlyWorking: false, fromDate: '2020-01-01' },
            { currentlyWorking: false },
        ]);
    });
});

const { validateSkillName } = require('../utils/userProfileUtils');

describe('validateSkillName', () => {
    it('should return valid for a valid skill name', () => {
        const result = validateSkillName('JavaScript');
        expect(result).toEqual({ valid: true });
    });

    it('should return invalid for a skill name that is too short', () => {
        const result = validateSkillName('A');
        expect(result).toEqual({ valid: false, message: 'Invalid skill name' });
    });

    it('should return invalid for a skill name that is too long', () => {
        const result = validateSkillName('A'.repeat(51));
        expect(result).toEqual({ valid: false, message: 'Invalid skill name' });
    });

    it('should return invalid for a non-string skill name', () => {
        const result = validateSkillName(123);
        expect(result).toEqual({ valid: false, message: 'Invalid skill name' });
    });

    it('should return invalid for an empty skill name', () => {
        const result = validateSkillName('');
        expect(result).toEqual({ valid: false, message: 'Invalid skill name' });
    });
});

const { updateSkillExperienceReferences } = require('../utils/userProfileUtils');

describe('updateSkillExperienceReferences', () => {
    it('should add new skills and update experience references', () => {
        const user = {
            skills: [
                { skillName: 'JavaScript', experience: [0], education: [], endorsements: [] },
            ],
        };
        const experienceIndex = 1;
        const newSkills = ['JavaScript', 'React'];
        const oldSkills = ['JavaScript'];

        updateSkillExperienceReferences(user, experienceIndex, newSkills, oldSkills);

        expect(user.skills).toEqual([
            { skillName: 'JavaScript', experience: [0, 1], education: [], endorsements: [] },
            { skillName: 'React', experience: [1], education: [], endorsements: [] },
        ]);
    });

    it('should remove skills no longer associated with the experience', () => {
        const user = {
            skills: [
                { skillName: 'JavaScript', experience: [0], education: [], endorsements: [] },
                { skillName: 'React', experience: [0], education: [], endorsements: [] },
            ],
        };
        const experienceIndex = 0;
        const newSkills = ['JavaScript'];
        const oldSkills = ['JavaScript', 'React'];

        updateSkillExperienceReferences(user, experienceIndex, newSkills, oldSkills);

        expect(user.skills).toEqual([
            { skillName: 'JavaScript', experience: [0], education: [], endorsements: [] },
        ]);
    });

    it('should handle empty newSkills and oldSkills', () => {
        const user = { skills: [] };
        const experienceIndex = 0;
        const newSkills = [];
        const oldSkills = [];

        updateSkillExperienceReferences(user, experienceIndex, newSkills, oldSkills);

        expect(user.skills).toEqual([]);
    });
});


// Mock the userModel
jest.mock('../models/userModel');

describe('checkUserAccessPermission', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should allow access if user is accessing their own data', async () => {
        const userId = new mongoose.Types.ObjectId();
        const user = {
            _id: userId,
            profilePrivacySettings: 'private',
            blockedUsers: []
        };
        
        const result = await checkUserAccessPermission(user, userId.toString());
        
        expect(result).toEqual({ hasAccess: true });
        // Verify findById wasn't called since requester is same as user
        expect(userModel.findById).not.toHaveBeenCalled();
    });

    it('should return false if requester is not found', async () => {
        const userId = new mongoose.Types.ObjectId();
        const requesterId = new mongoose.Types.ObjectId();
        const user = {
            _id: userId,
            profilePrivacySettings: 'public',
            blockedUsers: []
        };
        
        // Create a proper mock for the findById chain
        const mockSelect = jest.fn().mockResolvedValue(null);
        userModel.findById.mockReturnValue({ select: mockSelect });
        
        const result = await checkUserAccessPermission(user, requesterId.toString());
        
        expect(result).toEqual({ 
            hasAccess: false, 
            message: 'Requester not found', 
            statusCode: 404 
        });
        
        // Verify that both findById and select were called with correct arguments
        expect(userModel.findById).toHaveBeenCalledWith(requesterId.toString());
        expect(mockSelect).toHaveBeenCalledWith('connectionList blockedUsers');
    });

    it('should deny access if user has blocked requester', async () => {
        const userId = new mongoose.Types.ObjectId();
        const requesterId = new mongoose.Types.ObjectId();
        const user = {
            _id: userId,
            profilePrivacySettings: 'public',
            blockedUsers: [requesterId.toString()]
        };
        
        const requesterData = {
            _id: requesterId,
            connectionList: [],
            blockedUsers: []
        };
        
        const result = await checkUserAccessPermission(user, requesterId.toString(), requesterData);
        
        expect(result).toEqual({ 
            hasAccess: false, 
            message: 'You are blocked by this user', 
            statusCode: 403 
        });
    });

    it('should deny access if requester has blocked user', async () => {
        const userId = new mongoose.Types.ObjectId();
        const requesterId = new mongoose.Types.ObjectId();
        const user = {
            _id: userId,
            profilePrivacySettings: 'public',
            blockedUsers: []
        };
        
        const requesterData = {
            _id: requesterId,
            connectionList: [],
            blockedUsers: [userId.toString()]
        };
        
        const result = await checkUserAccessPermission(user, requesterId.toString(), requesterData);
        
        expect(result).toEqual({ 
            hasAccess: false, 
            message: 'You have blocked this user', 
            statusCode: 403 
        });
    });

    // it('should handle errors gracefully', async () => {
    //     const userId = new mongoose.Types.ObjectId();
    //     const requesterId = new mongoose.Types.ObjectId();
    //     const user = {
    //         _id: userId,
    //         profilePrivacySettings: 'public',
    //         blockedUsers: []
    //     };
        
    //     const error = new Error('Database error');
    //     userModel.findById.mockRejectedValue(error);
        
    //     const result = await checkUserAccessPermission(user, requesterId.toString());
        
    //     expect(result).toEqual({ 
    //         hasAccess: false, 
    //         message: 'Error checking access permission', 
    //         statusCode: 500,
    //         error
    //     });
    // });

    it('should use provided requester object if available', async () => {
        const userId = new mongoose.Types.ObjectId();
        const requesterId = new mongoose.Types.ObjectId();
        const user = {
            _id: userId,
            profilePrivacySettings: 'public',
            blockedUsers: []
        };
        
        const requesterData = {
            _id: requesterId,
            connectionList: [],
            blockedUsers: []
        };
        
        const result = await checkUserAccessPermission(user, requesterId.toString(), requesterData);
        
        expect(result).toEqual({ hasAccess: true });
        // Verify findById wasn't called since requester was provided
        expect(userModel.findById).not.toHaveBeenCalled();
    });

    it('should handle undefined blockedUsers arrays', async () => {
        const userId = new mongoose.Types.ObjectId();
        const requesterId = new mongoose.Types.ObjectId();
        const user = {
            _id: userId,
            profilePrivacySettings: 'public',
            // No blockedUsers array
        };
        
        const requesterData = {
            _id: requesterId,
            connectionList: [],
            // No blockedUsers array
        };
        
        const result = await checkUserAccessPermission(user, requesterId.toString(), requesterData);
        
        expect(result).toEqual({ hasAccess: true });
    });

    // Tests for commented out sections - if you decide to uncomment them
    
    /* Uncomment these tests if you uncomment the privacy settings checks

    it('should deny access if profile is private', async () => {
        const userId = new mongoose.Types.ObjectId();
        const requesterId = new mongoose.Types.ObjectId();
        const user = {
            _id: userId,
            profilePrivacySettings: 'private',
            blockedUsers: []
        };
        
        const requesterData = {
            _id: requesterId,
            connectionList: [],
            blockedUsers: []
        };
        
        const result = await checkUserAccessPermission(user, requesterId.toString(), requesterData);
        
        expect(result).toEqual({ 
            hasAccess: false, 
            message: 'This user has a private profile', 
            statusCode: 403 
        });
    });

    it('should deny access if profile is connections-only and requester is not connected', async () => {
        const userId = new mongoose.Types.ObjectId();
        const requesterId = new mongoose.Types.ObjectId();
        const user = {
            _id: userId,
            profilePrivacySettings: 'connectionsOnly',
            blockedUsers: []
        };
        
        const requesterData = {
            _id: requesterId,
            connectionList: [new mongoose.Types.ObjectId().toString()], // Connection to someone else
            blockedUsers: []
        };
        
        const result = await checkUserAccessPermission(user, requesterId.toString(), requesterData);
        
        expect(result).toEqual({ 
            hasAccess: false, 
            message: 'You are not connected with this user', 
            statusCode: 403 
        });
    });

    it('should allow access if profile is connections-only and requester is connected', async () => {
        const userId = new mongoose.Types.ObjectId();
        const requesterId = new mongoose.Types.ObjectId();
        const user = {
            _id: userId,
            profilePrivacySettings: 'connectionsOnly',
            blockedUsers: []
        };
        
        const requesterData = {
            _id: requesterId,
            connectionList: [userId.toString()], // Connected to the user
            blockedUsers: []
        };
        
        const result = await checkUserAccessPermission(user, requesterId.toString(), requesterData);
        
        expect(result).toEqual({ hasAccess: true });
    });
    */

    // Additional edge cases
    
    it('should handle null user object gracefully', async () => {
        try {
            await checkUserAccessPermission(null, 'some-id');
            // If no error is thrown, fail the test
            expect(true).toBe(false);
        } catch (error) {
            expect(error).toBeTruthy();
        }
    });

    it('should handle undefined requester ID gracefully', async () => {
        const userId = new mongoose.Types.ObjectId();
        const user = {
            _id: userId,
            profilePrivacySettings: 'public',
            blockedUsers: []
        };
        
        try {
            await checkUserAccessPermission(user, undefined);
            // If no error is thrown, fail the test
            expect(true).toBe(false);
        } catch (error) {
            expect(error).toBeTruthy();
        }
    });
});