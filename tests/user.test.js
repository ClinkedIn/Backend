const request = require('supertest');
const express = require('express');
const userModel = require('../models/userModel');
const { addEducation, editIntro, addExperience, getUserExperiences, updateExperience, sortWorkExperience, addSkill, getUserSkills, updateSkill, uploadProfilePicture, uploadCoverPicture } = require('../controllers/userProfileController');
const { uploadFile, uploadMultipleImages } = require('../utils/cloudinaryUpload');
const uploadMiddleware  = require('../middlewares/multer');

jest.mock('../utilities/userProfileUtils', () => ({
    validateSkillName: jest.requireActual('../utilities/userProfileUtils').validateSkillName,
    validateEndorsements: jest.requireActual('../utilities/userProfileUtils').validateEndorsements,
    sortWorkExperience: jest.requireActual('../utilities/userProfileUtils').sortWorkExperience
  }));

jest.mock('../models/userModel');
jest.mock('../utils/cloudinaryUpload', () => ({
    uploadFile: jest.fn(), // Mock upload function
}));

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
app.get('/experience', mockVerifyToken, getUserExperiences)

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
            save: jest.fn().mockResolvedValue(true),
        };

        userModel.findById = jest.fn().mockResolvedValue(mockUser);

        const response = await request(app)
            .post('/experience')
            .send(mockExperienceData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Experience added successfully');
        expect(response.body.experience).toEqual(expect.objectContaining(mockExperienceData));
        expect(response.body.sortedWorkExperience).toHaveLength(1);
    });

    test('should sort work experience in reverse chronological order', async () => {
        const experiences = [
            {
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
            },
            {
                jobTitle: 'Senior SWE',
                companyName: 'Google',
                fromDate: '2022-10-01',
                toDate: '2025-12-01',
                currentlyWorking: false,
                employmentType: 'Full Time',
                location: 'USA',
                locationType: 'Hybrid',
                description: 'Leading projects',
                foundVia: 'Direct',
                skills: ['System Design', 'Leadership'],
                media: ''
            },
            {
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
            }
        ];

        const mockUser = {
            _id: '0b3169152ee6c171d25e6860',
            workExperience: [experiences[0]],
            save: jest.fn().mockResolvedValue(true),
        };

        userModel.findById = jest.fn()
            .mockResolvedValueOnce(mockUser) // First call (adding second experience)
            .mockResolvedValueOnce({ ...mockUser, workExperience: [...mockUser.workExperience, experiences[1]] }) // Second call (adding third experience)
            .mockResolvedValueOnce({ ...mockUser, workExperience: [...mockUser.workExperience, experiences[1], experiences[2]] });

        await request(app).post('/experience').send(experiences[1]);
        const response = await request(app).post('/experience').send(experiences[2]);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Experience added successfully');

        const sortedExperience = response.body.sortedWorkExperience.map(exp => exp.companyName);
        expect(sortedExperience).toEqual(['Google', 'Microsoft', 'Small Company']);
    });

    test('should return 400 if required fields are missing', async () => {
        const incompleteExperience = {
            jobTitle: 'Software Engineer',
            companyName: '',
            fromDate: '2020-01-01'
        };

        const response = await request(app)
            .post('/experience')
            .send(incompleteExperience);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Company Name is required');
    });

    test('should return 400 if end date is missing and currentlyWorking is false', async () => {
        const experienceWithNoEndDate = {
            jobTitle: 'Software Engineer',
            companyName: 'Amazon',
            fromDate: '2020-01-01',
            currentlyWorking: false,
            employmentType: 'Full Time',
            location: 'USA',
            locationType: 'Hybrid',
            description: 'Working at Amazon',
            foundVia: 'LinkedIn',
            skills: ['AWS', 'Java'],
            media: ''
        };

        const response = await request(app)
            .post('/experience')
            .send(experienceWithNoEndDate);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('End Date is required');
    });

    test('should return 404 if user is not found', async () => {
        userModel.findById = jest.fn().mockResolvedValue(null);

        const experience = {
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

        const response = await request(app)
            .post('/experience')
            .send(experience);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    test('should return 500 if database error occurs', async () => {
        userModel.findById = jest.fn().mockRejectedValue(new Error('Database error'));

        const experience = {
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

        const response = await request(app)
            .post('/experience')
            .send(experience);

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to add experience');
    });
});


describe('GET /experience - Get User Experiences', () => {
    const userId = 'cc81c18d6b9fc1b83e2bebe3';

   // beforeEach(() => {
        //userId = new mongoose.Types.ObjectId();
   // });

    it('should return 404 if user is not found', async () => {
        userModel.findById.mockResolvedValue(null); // Simulate user not found

        const response = await request(app)
            .get('/experience')

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

    it('should return 200 and user experiences if user exists', async () => {
        const mockUser = {
            _id: userId,
            experience: [
                { title: 'Software Engineer', company: 'Tech Corp', fromDate: '2023-01-01', currentlyWorking: true }
            ]
        };

        userModel.findById.mockResolvedValue(mockUser); // Simulate found user

        const response = await request(app)
            .get('/experience')

        expect(response.status).toBe(200);
        expect(response.body.experiences).toEqual(mockUser.experience);
    });

    it('should return 500 if there is a server error', async () => {
        userModel.findById.mockRejectedValue(new Error('Database error')); // Simulate DB error

        const response = await request(app)
            .get('/experience')

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Server error');
    });
});

describe('PUT /experience/:index - Update Work Experience', () => {
    const userId = 'cc81c18d6b9fc1b83e2bebe3';
    let mockUser;

    beforeEach(() => {
        mockUser = {
            _id: userId,
            workExperience: [
                {
                    jobTitle: 'Junior Developer',
                    companyName: 'Small Company',
                    fromDate: '2015-01-01',
                    toDate: '2023-11-30',
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
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Reset mocks after each test
    });

    test('should update experience and sort it correctly', async () => {
        userModel.findById.mockResolvedValue(mockUser);

        const updatedExperience = {
            jobTitle: 'Tech Lead',
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
        const sortedJobTitles = response.body.experience.map(exp => exp.jobTitle);
        expect(sortedJobTitles).toEqual(['Tech Lead', 'Junior Developer']);

        expect(mockUser.save).toHaveBeenCalled(); // Ensure save() was called
    });

    test('should return 404 if user is not found', async () => {
        userModel.findById.mockResolvedValue(null); // Simulate user not found

        const response = await request(app)
            .put('/experience/0')
            .send({ jobTitle: 'Updated Title' });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });

    test('should return 404 if experience index is out of range', async () => {
        userModel.findById.mockResolvedValue(mockUser);

        const response = await request(app)
            .put('/experience/5') // Invalid index
            .send({ jobTitle: 'Updated Title' });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Experience not found');
    });

    test('should return 404 if experience index is negative', async () => {
        userModel.findById.mockResolvedValue(mockUser);

        const response = await request(app)
            .put('/experience/-1') // Invalid index
            .send({ jobTitle: 'Updated Title' });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Experience not found');
    });

    test('should return 400 if fromDate is invalid', async () => {
        userModel.findById.mockResolvedValue(mockUser);

        const response = await request(app)
            .put('/experience/0')
            .send({ fromDate: 'invalid-date' }); // Invalid date

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid Start Date');
    });

    test('should return 400 if toDate is invalid', async () => {
        userModel.findById.mockResolvedValue(mockUser);

        const response = await request(app)
            .put('/experience/0')
            .send({ toDate: 'invalid-date' }); // Invalid date

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid End Date');
    });

    test('should return 500 if there is a server error', async () => {
        userModel.findById.mockRejectedValue(new Error('Database error')); // Simulate DB error

        const response = await request(app)
            .put('/experience/0')
            .send({ jobTitle: 'Updated Title' });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Server error');
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
        const response = await request(app)
            .post('/skills')
            .send({ skillName: '', endorsements: ['d29ccbd4ac1b1cb9faefb867'] });
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Skill name must be a valid string');
    });

    test('should return 400 if user tries to endorse themselves', async () => {
        const response = await request(app)
            .post('/skills')
            .send({ 
                skillName: 'Leadership', 
                endorsements: ['cc81c18d6b9fc1b83e2bebe3'] // Self-endorsement attempt
            });
    
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Users cannot endorse themselves');
    });
    

    test('should return 400 if endorsements contain invalid user IDs', async () => {
        const response = await request(app)
            .post('/skills')
            .send({ skillName: 'Communication', endorsements: ['invalid_user_id'] });
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('No valid MongoDB ObjectIds provided');
    });

    test('should return 400 if endorsements array is empty', async () => {
        const response = await request(app)
            .post('/skills')
            .send({ skillName: 'Teamwork', endorsements: [] });
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('No valid MongoDB ObjectIds provided');
    });

    test('should return 400 if endorsements contain duplicate user IDs', async () => {
        const mockSkillData = {
            skillName: 'Leadership',
            endorsements: ['d29ccbd4ac1b1cb9faefb867', 'd29ccbd4ac1b1cb9faefb867'],
        };

        const response = await request(app)
            .post('/skills')
            .send(mockSkillData);
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Duplicate endorsements are not allowed');
    });

    test('should return 400 if one or more endorsement user IDs are not found', async () => {
        userModel.find.mockResolvedValue([{ _id: 'd29ccbd4ac1b1cb9faefb867' }]);
        
        const response = await request(app)
            .post('/skills')
            .send({ skillName: 'Leadership', endorsements: ['d29ccbd4ac1b1cb9faefb867', 'fcec43117bcfec7dedf7cd55'] });
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Some endorsement user IDs are invalid');
    });

    test('should return 404 if user is not found', async () => {
        userModel.findByIdAndUpdate.mockResolvedValue(null);

        const response = await request(app)
            .post('/skills')
            .send({ skillName: 'Critical Thinking', endorsements: ['d29ccbd4ac1b1cb9faefb867'] });
        
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    test('should return 500 if database update fails', async () => {
        userModel.find.mockResolvedValue([{ _id: 'd29ccbd4ac1b1cb9faefb867' }]);
        userModel.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/skills')
            .send({ skillName: 'Critical Thinking', endorsements: ['d29ccbd4ac1b1cb9faefb867'] });
        
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal server error');
    });
});



/*
Profile and Cover Pictures Tests
*/

app.post('/add-profile-picture', mockVerifyToken, uploadMiddleware.single('file'), uploadProfilePicture);
app.post('/add-cover-picture', mockVerifyToken, uploadMiddleware.single('file'), uploadCoverPicture);

describe('POST /add-profile-picture', () => {
    const userId = 'cc81c18d6b9fc1b83e2bebe3';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully upload a profile picture', async () => {
        const mockImageBuffer = Buffer.from([0xff, 0xd8, 0xff]); // Simulated valid image buffer
        const mockUploadResult = { url: 'https://cloudinary.com/mock-image-url' };
    
        uploadFile.mockResolvedValue(mockUploadResult);
    
        userModel.findByIdAndUpdate.mockResolvedValue({
            _id: userId,
            profilePicture: mockUploadResult.url,
        });
    
        const response = await request(app)
            .post('/add-profile-picture')
            .set('Content-Type', 'multipart/form-data')
            .attach('file', mockImageBuffer, { filename: 'profile.jpg', contentType: 'image/jpeg' });
    
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Profile Picture updated successfully');
        expect(response.body.profilePicture).toBe(mockUploadResult.url);
    
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
            userId,
            { profilePicture: mockUploadResult.url },
            { new: true }
        );
    });


    test('should return 400 if no file is uploaded', async () => {
        const response = await request(app)
            .post('/add-profile-picture')
            .send();

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('No file uploaded');
    });


    test('should return 400 for invalid file type', async () => {
        const mockTextBuffer = Buffer.from('This is a text file');
    
        const response = await request(app)
            .post('/add-profile-picture')
            .attach('file', mockTextBuffer, { filename: 'test.txt', contentType: 'text/plain' });
    
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid file type. Only JPEG and PNG are allowed.');
    });


    test('should return 400 if file size exceeds limit', async () => {
        const largeBuffer = Buffer.alloc(10 * 1024 * 1024, 0); // 10MB file
    
        const response = await request(app)
            .post('/add-profile-picture')
            .attach('file', largeBuffer, { filename: 'large.jpg', contentType: 'image/jpeg' });
    
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('File size too large. Maximum allowed size is 5MB.');
    });


    test('should return 500 if database update fails', async () => {
        const mockImageBuffer = Buffer.from([0xff, 0xd8, 0xff]);
        const mockUploadResult = { url: 'https://cloudinary.com/mock-image-url' };
    
        uploadFile.mockResolvedValue(mockUploadResult);
        userModel.findByIdAndUpdate.mockRejectedValue(new Error('Database update failed'));
    
        const response = await request(app)
            .post('/add-profile-picture')
            .attach('file', mockImageBuffer, { filename: 'profile.jpg', contentType: 'image/jpeg' });
    
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal server error');
    });


    test('should return 404 if user is not found', async () => {
        uploadFile.mockResolvedValue({ url: 'https://cloudinary.com/mock-image-url' });
        userModel.findByIdAndUpdate.mockResolvedValue(null);
    
        const response = await request(app)
            .post('/add-profile-picture')
            .attach('file', Buffer.from([0xff, 0xd8, 0xff]), { filename: 'profile.jpg', contentType: 'image/jpeg' });
    
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });    

    
    test('should return 500 if Cloudinary upload fails', async () => {
        uploadFile.mockRejectedValue(new Error('Cloudinary upload failed'));

        const mockImageBuffer = Buffer.from('mockImageData');

        const response = await request(app)
            .post('/add-profile-picture')
            .attach('file', mockImageBuffer, { filename: 'profile.jpg', contentType: 'image/jpeg' });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal server error');
        expect(response.body.error).toBeDefined();
    });
    
});


describe('POST /add-cover-picture', () => {
    const userId = 'cc81c18d6b9fc1b83e2bebe3';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully upload a cover picture', async () => {
        const mockImageBuffer = Buffer.from([0xff, 0xd8, 0xff]); // Simulated valid image buffer
        const mockUploadResult = { url: 'https://cloudinary.com/mock-cover-url' };
    
        uploadFile.mockResolvedValue(mockUploadResult);
    
        userModel.findByIdAndUpdate.mockResolvedValue({
            _id: userId,
            coverPicture: mockUploadResult.url,
        });
    
        const response = await request(app)
            .post('/add-cover-picture')
            .set('Content-Type', 'multipart/form-data')
            .attach('file', mockImageBuffer, { filename: 'cover.jpg', contentType: 'image/jpeg' });
    
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Cover Picture updated successfully');
        expect(response.body.coverPicture).toBe(mockUploadResult.url);
    
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
            userId,
            { coverPicture: mockUploadResult.url },
            { new: true }
        );
    });

    test('should return 400 if no file is uploaded', async () => {
        const response = await request(app)
            .post('/add-cover-picture')
            .send();

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('No file uploaded');
    });

    test('should return 400 for invalid file type', async () => {
        const mockTextBuffer = Buffer.from('This is a text file');
    
        const response = await request(app)
            .post('/add-cover-picture')
            .attach('file', mockTextBuffer, { filename: 'test.txt', contentType: 'text/plain' });
    
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid file type. Only JPEG and PNG are allowed.');
    });

    test('should return 400 if file size exceeds limit', async () => {
        const largeBuffer = Buffer.alloc(10 * 1024 * 1024, 0); // 10MB file
    
        const response = await request(app)
            .post('/add-cover-picture')
            .attach('file', largeBuffer, { filename: 'large.jpg', contentType: 'image/jpeg' });
    
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('File size too large. Maximum allowed size is 5MB.');
    });

    test('should return 500 if database update fails', async () => {
        const mockImageBuffer = Buffer.from([0xff, 0xd8, 0xff]);
        const mockUploadResult = { url: 'https://cloudinary.com/mock-cover-url' };
    
        uploadFile.mockResolvedValue(mockUploadResult);
        userModel.findByIdAndUpdate.mockRejectedValue(new Error('Database update failed'));
    
        const response = await request(app)
            .post('/add-cover-picture')
            .attach('file', mockImageBuffer, { filename: 'cover.jpg', contentType: 'image/jpeg' });
    
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal server error');
    });

    test('should return 404 if user is not found', async () => {
        uploadFile.mockResolvedValue({ url: 'https://cloudinary.com/mock-cover-url' });
        userModel.findByIdAndUpdate.mockResolvedValue(null);
    
        const response = await request(app)
            .post('/add-cover-picture')
            .attach('file', Buffer.from([0xff, 0xd8, 0xff]), { filename: 'cover.jpg', contentType: 'image/jpeg' });
    
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User not found');
    });    

    test('should return 500 if Cloudinary upload fails', async () => {
        uploadFile.mockRejectedValue(new Error('Cloudinary upload failed'));

        const mockImageBuffer = Buffer.from('mockImageData');

        const response = await request(app)
            .post('/add-cover-picture')
            .attach('file', mockImageBuffer, { filename: 'cover.jpg', contentType: 'image/jpeg' });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal server error');
        expect(response.body.error).toBeDefined();
    });
});
