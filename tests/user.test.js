const request = require('supertest');
const express = require('express');
const { addEducation } = require('../controllers/userProfileController');
const userModel = require('../models/userModel');
// Mock userModel
jest.mock('../models/userModel');

// Create Express app for testing
const app = express();
app.use(express.json());

// Mock middleware
const mockUser = {
    id: '65e8a3b624d5b294519c3e24',
    email: 'test@example.com'
};

app.use((req, res, next) => {
    req.user = mockUser;
    next();
});

// Add route
app.patch('/user/education', addEducation);

describe('Education Endpoint Tests', () => {
    beforeEach(() => {
        // Clear mock data before each test
        jest.clearAllMocks();
    });

    test('Should add education successfully', async () => {
        const educationData = {
            school: 'Test University',
            degree: 'Bachelor',
            fieldOfStudy: 'Computer Science',
            startDate: '2020-09-01',
            endDate: '2024-06-30'
        };

        // Mock the findByIdAndUpdate response
        userModel.findByIdAndUpdate.mockResolvedValue({
            education: [educationData]
        });

        const response = await request(app)
            .patch('/user/education')
            .send(educationData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Education added successfully');
        expect(response.body.education).toEqual(educationData);
    });

    test('Should return 400 if school is missing', async () => {
        const response = await request(app)
            .patch('/user/education')
            .send({
                degree: 'Bachelor',
                fieldOfStudy: 'Computer Science'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('School name is required');
    });

    test('Should return 404 if user not found', async () => {
        userModel.findByIdAndUpdate.mockResolvedValue(null);

        const response = await request(app)
            .patch('/user/education')
            .send({
                school: 'Test University'
            });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });

    test('Should handle server errors', async () => {
        userModel.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .patch('/user/education')
            .send({
                school: 'Test University'
            });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to add education');
    });
});