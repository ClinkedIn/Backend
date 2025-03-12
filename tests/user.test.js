const request = require('supertest');
const express = require('express');
const userModel = require('../models/userModel');
const { addEducation, editIntro, addExperience, updateExperience, addSkill, getUserSkills, updateSkill } = require('../controllers/userProfileController');

jest.mock('../utilities/userProfileUtils', () => ({
    validateSkillName: jest.requireActual('../utilities/userProfileUtils').validateSkillName,
    validateEndorsements: jest.requireActual('../utilities/userProfileUtils').validateEndorsements,
    sortWorkExperience: jest.requireActual('../utilities/userProfileUtils').sortWorkExperience
  }));

jest.mock('../models/userModel');

const app = express();
app.use(express.json());

const mockVerifyToken = (req, res, next) => {
    req.user = { id: 'cc81c18d6b9fc1b83e2bebe3' };
    next();
};

app.patch('/education', mockVerifyToken, addEducation);

describe('PATCH /education', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully add education', async () => {
        const mockEducationData = {
            school: 'Harvard University',
            degree: 'B.Sc. Computer Science',
            fieldOfStudy: 'Computer Science',
            startDate: '2018-09-01',
            endDate: '2022-06-01',
            grade: '3.9',
            activities: 'Coding Club',
            description: 'Focused on AI research',
            skills: ['JavaScript', 'Python'],
            media: ['link-to-certificate']
        };

        const mockUpdatedUser = {
            _id: 'a0a20b073ac7c8facebfaa11',
            education: [mockEducationData]
        };

        userModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

        const response = await request(app)
            .patch('/education')
            .send(mockEducationData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Education added successfully');
        expect(response.body.education).toEqual(mockEducationData);
    });

    test('should return 400 if school name is missing', async () => {
        const response = await request(app)
            .patch('/education')
            .send({ degree: 'B.Sc. Computer Science' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('School name is required');
    });

    test('should return 404 if user is not found', async () => {
        userModel.findByIdAndUpdate.mockResolvedValue(null);

        const response = await request(app)
            .patch('/education')
            .send({ school: 'Harvard University' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    test('should return 500 on server error', async () => {
        userModel.findByIdAndUpdate.mockRejectedValue(new Error('Database failure'));

        const response = await request(app)
            .patch('/education')
            .send({ school: 'Harvard University' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to add education');
        expect(response.body.details).toBe('Database failure');
    });
});

// Setup route
app.patch('/profile', mockVerifyToken, editIntro);

describe('PATCH /profile', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully update user intro', async () => {
        const mockIntroData = {
            firstName: 'John',
            lastName: 'Doe',
            bio: 'Software Engineer',
            location: 'New York',
            industry: 'Technology',
            mainEducation: 1
        };

        const mockUpdatedUser = {
            ...mockIntroData,
            _id: 'f446a2fdbe47f4e4b820d6ce'
        };

        userModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

        const response = await request(app)
            .patch('/profile')
            .send(mockIntroData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Intro updated successfully');
        expect(response.body.user).toMatchObject({
            firstName: mockIntroData.firstName,
            lastName: mockIntroData.lastName,
            bio: mockIntroData.bio,
            location: mockIntroData.location,
            industry: mockIntroData.industry
        });
    });

    test('should return 400 if required fields are missing', async () => {
        const incompleteData = {
            firstName: 'John',
            lastName: 'Doe'
            // Missing other required fields
        };

        const response = await request(app)
            .patch('/profile')
            .send(incompleteData);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Missing required fields');
        expect(response.body.missingFields).toContain('bio');
        expect(response.body.missingFields).toContain('location');
        expect(response.body.missingFields).toContain('industry');
        expect(response.body.missingFields).toContain('mainEducation');
    });

    test('should return 404 if user not found', async () => {
        const mockIntroData = {
            firstName: 'John',
            lastName: 'Doe',
            bio: 'Software Engineer',
            location: 'New York',
            industry: 'Technology',
            mainEducation: 1
        };

        userModel.findByIdAndUpdate.mockResolvedValue(null);

        const response = await request(app)
            .patch('/profile')
            .send(mockIntroData);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    test('should return 500 on server error', async () => {
        const mockIntroData = {
            firstName: 'John',
            lastName: 'Doe',
            bio: 'Software Engineer',
            location: 'New York',
            industry: 'Technology',
            mainEducation: 1
        };

        userModel.findByIdAndUpdate.mockRejectedValue(new Error('Database failure'));

        const response = await request(app)
            .patch('/profile')
            .send(mockIntroData);

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to update profile');
        expect(response.body.details).toBe('Database failure');
    });
});


app.post('/experience', mockVerifyToken, addExperience);
app.put('/experience/:index', mockVerifyToken, updateExperience);

describe('POST /experience', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully add experience', async () => {
        const mockExperienceData = {
            jobTitle: 'SWE',
            companyName: 'Microsoft',
            fromDate: '2018-09-01',
            toDate: '2023-09-01',
            currentlyWorking: false,
            employmentType: 'Full Time',
            location: 'Egypt',
            locationType: 'Onsite',
            description: 'Senior SWE',
            foundVia: 'LinkedIn',
            skills: ['Problem Solving'],
            media: 'media'
        };

        const mockUser = {
            _id: '0b3169152ee6c171d25e6860',
            workExperience: [],
            save: jest.fn().mockResolvedValue(true), // Ensure save is mocked
        };

        const mockSortedExperience = [mockExperienceData];

        userModel.findById = jest.fn().mockResolvedValue(mockUser);
        userModel.prototype.save = jest.fn().mockResolvedValue(mockUser);
        
        // Mock sorting function if needed
        //global.sortWorkExperience = jest.fn((exp) => exp);

        const response = await request(app)
            .post('/experience')
            .send(mockExperienceData);

        //console.log('Response:', response.body); // Check actual response

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Experience added successfully');
        expect(response.body.experience).toEqual(mockExperienceData);
        expect(response.body.sortedWorkExperience).toEqual(mockSortedExperience);
    });

    test('should sort work experience in reverse chronological order', async () => {

        const firstExperience = {
            jobTitle: 'Junior Developer',
            companyName: 'Small Company',
            fromDate: '2015-01-01',
            toDate: '2017-12-31',
            currentlyWorking: false,
            employmentType: 'Full Time',
            location: 'Remote',
            locationType: 'Remote',
            description: 'Junior role',
            foundVia: 'Referral',
            skills: ['HTML', 'CSS'],
            media: ''
        };
    
        const latestExperience = {
            jobTitle: 'SWE',
            companyName: 'Microsoft',
            fromDate: '2023-01-01',
            toDate: '2023-09-01',
            currentlyWorking: false,
            employmentType: 'Full Time',
            location: 'Egypt',
            locationType: 'Onsite',
            description: 'Senior SWE',
            foundVia: 'LinkedIn',
            skills: ['Problem Solving'],
            media: 'media'
        };
    
        const middleExperience = {
            jobTitle: 'Senior SWE',
            companyName: 'Google',
            fromDate: '2022-10-01',
            toDate: '2022-12-01',
            currentlyWorking: false,
            employmentType: 'Full Time',
            location: 'USA',
            locationType: 'Hybrid',
            description: 'Leading projects',
            foundVia: 'Direct',
            skills: ['System Design', 'Leadership'],
            media: ''
        };
    
        // Mock user with existing experiences
        const mockUser = {
            _id: '0b3169152ee6c171d25e6860',
            workExperience: [firstExperience], // Start with one experience
            save: jest.fn().mockResolvedValue(true),
        };
    
        // Define expected order after all experiences are added
        // Most recent first (currentExperience → recentExperience → oldExperience)
        const expectedOrder = [
            expect.objectContaining({ companyName: 'Microsoft' }),
            expect.objectContaining({ companyName: 'Google' }),
            expect.objectContaining({ companyName: 'Small Company' })
        ];
    
        // Setup the mocks
        userModel.findById = jest.fn()
            .mockResolvedValueOnce(mockUser) // First call returns user with oldExperience
            .mockResolvedValueOnce({ // Second call returns user with old + recent
                ...mockUser,
                workExperience: [...mockUser.workExperience, latestExperience],
                save: jest.fn().mockResolvedValue(true)
            });
    
        await request(app)
            .post('/experience')
            .send(latestExperience);
    
        const response = await request(app)
            .post('/experience')
            .send(middleExperience);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Experience added successfully');
    
        expect(response.body.sortedWorkExperience).toHaveLength(3);
        //console.log(response.body.sortedWorkExperience)

        const companyOrder = response.body.sortedWorkExperience.map(exp => exp.companyName);
        expect(companyOrder).toEqual(['Microsoft', 'Google', 'Small Company']);
        
        // Alternatively, use objectContaining to match the pattern
        expect(response.body.sortedWorkExperience).toEqual(expectedOrder);
        
    });
});

describe('PUT /experience/:index', () => {
    afterEach(() => {
        jest.restoreAllMocks(); // Reset mocks after each test
    });

    test('should update experience and sort it correctly', async () => {
        const mockUser = {
            _id: '0b3169152ee6c171d25e6860',
            workExperience: [
                {
                    jobTitle: 'Junior Developer',
                    companyName: 'Small Company',
                    fromDate: '2015-01-01',
                    toDate: '2023-11-31',
                    currentlyWorking: false
                },
                {
                    jobTitle: 'Senior SWE',
                    companyName: 'Google',
                    fromDate: '2022-10-01',
                    toDate: '2022-12-01',
                    currentlyWorking: false
                }
            ],
            save: jest.fn().mockResolvedValue(true)
        };

        userModel.findById = jest.fn().mockResolvedValue(mockUser);

        const updatedExperience = {
            jobTitle: 'Tech Lead',
            //companyName: 'Small Company',
            fromDate: '2023-05-01', // Newer date to test sorting
            toDate: '2024-01-01',
            currentlyWorking: false
        };

        const response = await request(app)
            .put('/experience/1') // Update second experience (Google)
            .send(updatedExperience);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Experience updated successfully');

        // Ensure experience was updated
        expect(mockUser.workExperience[0].jobTitle).toBe('Tech Lead');

        // Ensure sorting is correct (newest first)
        const sortedCompanyNames = response.body.experience.map(exp => exp.companyName);
        expect(sortedCompanyNames).toEqual(['Google', 'Small Company']); // Google is now the latest

        expect(mockUser.save).toHaveBeenCalled(); // Ensure save() was called
    });

    test('should return 404 if user is not found', async () => {
        userModel.findById = jest.fn().mockResolvedValue(null); // User not found

        const response = await request(app)
            .put('/experience/0')
            .send({ jobTitle: 'Updated Title' });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

    test('should return 404 if experience index is invalid', async () => {
        userModel.findById = jest.fn().mockResolvedValue({
            _id: 'user123',
            workExperience: [{ jobTitle: 'Old Job' }],
            save: jest.fn()
        });

        const response = await request(app)
            .put('/experience/5') // Invalid index
            .send({ jobTitle: 'Updated Title' });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Experience not found');
    });
});


/*
Skills Section Tests
*/ 

app.post('/skills', mockVerifyToken, addSkill);
app.put('/skills/:index', mockVerifyToken, updateSkill);

describe('POST /skills', () => {
    const { validateSkillName, validateEndorsements } = require('../utilities/userProfileUtils');
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully add a skill', async () => {
        const mockSkillData = {
            skillName: 'Problem Solving',
            endorsements: ['d29ccbd4ac1b1cb9faefb867', 'fcec43117bcfec7dedf7cd55'],
        };
        
        const userId = '0b3169152ee6c171d25e6860';

        userModel.find.mockResolvedValue([
            { _id: 'd29ccbd4ac1b1cb9faefb867' },
            { _id: 'fcec43117bcfec7dedf7cd55' }
        ]);
        
        userModel.findByIdAndUpdate.mockResolvedValue({
            _id: userId,
            skills: [mockSkillData],
        });
        
        const response = await request(app)
            .post('/skills')
            .send(mockSkillData);
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Skill added successfully');
        expect(response.body.skill).toEqual(mockSkillData);
    });

    test('should return 400 if skill name is invalid', async () => {
        const mockSkillData = {
            skillName: '',  // Invalid skill name
            endorsements: ['d29ccbd4ac1b1cb9faefb867'],
        };

        const response = await request(app)
            .post('/skills')
            .send(mockSkillData);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Skill name must be a valid string');
    });

    test('should return 400 if endorsements contain invalid user IDs', async () => {
        const mockSkillData = {
            skillName: 'Communication',
            endorsements: ['invalid_user_id'],
        };

        userModel.find.mockResolvedValue(undefined);

        const response = await request(app)
            .post('/skills')
            .send(mockSkillData);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('No valid MongoDB ObjectIds provided');
    });

    test('should return 400 if no user (any one of endorsements) is not found', async () => {
        const mockSkillData = {
            skillName: 'Leadership',
            endorsements: ['d29ccbd4ac1b1cb9faefb867'],
        };

        userModel.find.mockResolvedValue([]); // Simulate user not found

        const response = await request(app)
            .post('/skills')
            .send(mockSkillData);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('No matching users found in database');
    });

    test('should return 400 if a user (any one of endorsements) is not found', async () => {
        const mockSkillData = {
            skillName: 'Leadership',
            endorsements: ['d29ccbd4ac1b1cb9faefb867', 'd29cchhbd4ac1b1cb9faefb867'],
        };

        userModel.find.mockResolvedValue([
            { _id: 'd29ccbd4ac1b1cb9faefb867' }
        ]);

        const response = await request(app)
            .post('/skills')
            .send(mockSkillData);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Some endorsement user IDs are invalid');
    });


    test('should return 500 if database update fails', async () => {
        const mockSkillData = {
            skillName: 'Critical Thinking',
            endorsements: ['d29ccbd4ac1b1cb9faefb867'],
        };

        userModel.find.mockResolvedValue([
            { _id: 'd29ccbd4ac1b1cb9faefb867' }
        ]);

        userModel.findByIdAndUpdate.mockRejectedValue(new Error('Database error')); // Simulate DB failure

        const response = await request(app)
            .post('/skills')
            .send(mockSkillData);

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
    });
});
