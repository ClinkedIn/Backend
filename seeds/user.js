const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const { 
    userIds, postIds, commentIds, repostIds, companyIds, 
    impressionIds, notificationIds, subscriptionIds, transactionIds, jobIds 
} = require('./init');

const users = [];
const userRelationships = [];

async function createWorkExperience() {
    return Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => {
        const toDate = faker.datatype.boolean() ? faker.date.recent({ days: 200 }) : null;
        return {
            jobTitle: faker.person.jobTitle(),
            companyName: faker.company.name(),
            fromDate: faker.date.past({ years: faker.number.int({ min: 1, max: 10 }) }),
            toDate,
            // if toDate is null make currentlyWorking true, else make it false
            currentlyWorking: toDate === null,
            employmentType: faker.helpers.arrayElement([
                "Full Time", "Part Time", "Freelance", "Self Employed", 
                "Contract", "Internship", "Apprenticeship", "Seasonal"
            ]),
            location: faker.location.city(),
            locationType: faker.helpers.arrayElement(["Onsite", "Hybrid", "Remote"]),
            description: faker.lorem.sentence(),
            foundVia: faker.helpers.arrayElement([
                "Indeed", "LinkedIn", "Company Website", "Other job sites", 
                "Referral", "Contracted by Recruiter", "Staffing Agency", "Other"
            ]),
            skills: faker.helpers.arrayElements(
                ["JavaScript", "Python", "SQL", "AWS", "Docker"], 
                faker.number.int({ min: 1, max: 4 })
            ),
            media: faker.image.url(),
        };
    });
}

async function createEducation() {
    return Array.from({ length: faker.number.int({ min: 0, max: 2 }) }, () => ({
        school: faker.company.name(),
        degree: faker.helpers.arrayElement(["BSc", "MSc", "PhD", "Diploma"]),
        fieldOfStudy: faker.helpers.arrayElement([
            "Computer Science", "Business", "Marketing", "Engineering"
        ]),
        startDate: faker.date.past({ years: faker.number.int({ min: 4, max: 10 }) }),
        endDate: faker.datatype.boolean() 
            ? faker.date.past({ years: faker.number.int({ min: 1, max: 3 }) }) 
            : null,
        grade: faker.helpers.arrayElement(["A", "B", "C", "Pass"]),
        activities: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        skills: faker.helpers.arrayElements(
            ["Machine Learning", "Networking", "Finance", "Cybersecurity"], 
            faker.number.int({ min: 1, max: 3 })
        ),
        media: faker.image.url(),
    }));
}

async function createSkills(userId) {
    return Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
        skillName: faker.helpers.arrayElement([
            "React", "Node.js", "MongoDB", "Kubernetes", "UI/UX Design"
        ]),
        endorsements: faker.helpers.arrayElements(
            userIds.filter(id => id !== userId), 
            faker.number.int({ min: 0, max: 3 })
        )
    }));
}

async function createRandomUsers() {
    for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i];
        const hashedPassword = await bcrypt.hash('password123', 10);

        const workExperience = await createWorkExperience();
        const education = await createEducation();
        const skills = await createSkills(userId);

        // Store base user data
        users.push({
            _id: userId,
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: hashedPassword,
            headLine: faker.lorem.sentence(),
            profilePicture: faker.image.avatar(),
            coverPicture: faker.image.url(),
            resume: faker.datatype.boolean() ? faker.internet.url() : null,
            about: {
                description: faker.lorem.paragraph(),
                skills: []
            },
            location: faker.location.city(),
            lastJobTitle: faker.person.jobTitle(),
            workExperience,
            education,
            skills,
            transactions: [],
            subscription: null,
            isPremium: faker.datatype.boolean(),
            companies: [],
            adminInCompanies: [],
            isSuperAdmin: faker.datatype.boolean(),
            profilePrivacySettings: faker.helpers.arrayElement([
                "public", "private", "connectionsOnly"
            ]),
            connectionRequestPrivacySetting: faker.helpers.arrayElement([
                "everyone", "connectionsOnly"
            ]),
            defaultMode: faker.helpers.arrayElement(["light", "dark"]),
            googleId: faker.datatype.boolean() ? faker.string.uuid() : null,
            fcmToken: faker.string.uuid(),
            emailVerificationToken: faker.datatype.boolean() ? faker.string.uuid() : null,
            emailVerificationExpiresAt: faker.datatype.boolean() ? faker.date.future() : null,
            passwordResetToken: faker.datatype.boolean() ? faker.string.uuid() : null,
            passwordResetExpiresAt: faker.datatype.boolean() ? faker.date.future() : null,
            certificates: faker.image.url(),
            isActive: faker.datatype.boolean(),
            createdAt: faker.date.past({ years: 2 }),
            updatedAt: faker.date.recent(),
        });

        // Store relationship data separately
        userRelationships.push({
            userId,
            following: [
                // Following users
                ...faker.helpers.arrayElements(
                    userIds.filter(id => id !== userId),
                    faker.number.int({ min: 0, max: 8 })
                ).map(id => ({
                    entity: id,
                    entityType: 'User',
                    followedAt: faker.date.past({ years: 1 })
                })),
                // Following companies
                ...faker.helpers.arrayElements(
                    companyIds,
                    faker.number.int({ min: 0, max: 5 })
                ).map(id => ({
                    entity: id,
                    entityType: 'Company',
                    followedAt: faker.date.past({ years: 1 })
                }))
            ],
            connectionList: faker.helpers.arrayElements(
                userIds.filter(id => id !== userId), 
                faker.number.int({ min: 0, max: 8 })
            ),
            blockedUsers: faker.helpers.arrayElements(
                userIds.filter(id => id !== userId), 
                faker.number.int({ min: 0, max: 2 })
            ),
            reportedUsers: faker.helpers.arrayElements(
                userIds.filter(id => id !== userId), 
                faker.number.int({ min: 0, max: 2 })
            ),
            profileViews: faker.helpers.arrayElements(
                userIds.filter(id => id !== userId), 
                faker.number.int({ min: 0, max: 5 })
            ),
            savedPosts: faker.helpers.arrayElements(
                postIds, 
                faker.number.int({ min: 0, max: 4 })
            ),
            savedJobs: faker.helpers.arrayElements(
                jobIds, 
                faker.number.int({ min: 0, max: 3 })
            ),
            sentConnectionRequests: faker.helpers.arrayElements(
                userIds.filter(id => id !== userId), 
                faker.number.int({ min: 0, max: 3 })
            ),
            messageRequests: faker.helpers.arrayElements(
                userIds.filter(id => id !== userId), 
                faker.number.int({ min: 0, max: 2 })
            )
        });
    }
}

async function updateUserRelationships() {
    // First, create a set of all bidirectional connections
    const bidirectionalConnections = new Map();

    // Process each user's connection list
    for (const relationship of userRelationships) {
        const userId = relationship.userId;
        
        relationship.connectionList.forEach(connectionId => {
            // Skip if trying to connect to self
            if (userId === connectionId) return;
            
            const connectionKey = [userId, connectionId].sort().join('-');
            bidirectionalConnections.set(connectionKey, {
                user1: userId,
                user2: connectionId
            });
        });
    }

    // Update each user's relationships
    for (const relationship of userRelationships) {
        // Calculate followers based on who's following this user
        const followers = userRelationships
            .filter(r => r.following.some(f => 
                f.entity.toString() === relationship.userId.toString() && 
                f.entityType === 'User'
            ))
            .map(r => ({
                entity: r.userId,
                entityType: 'User',
                followedAt: faker.date.past({ years: 1 })
            }));

        // Calculate received connection requests
        const receivedConnectionRequests = userRelationships
            .filter(r => r.sentConnectionRequests.includes(relationship.userId))
            .map(r => r.userId);

        // Calculate final connection list based on bidirectional connections
        const finalConnectionList = Array.from(bidirectionalConnections.values())
            .filter(conn => conn.user1 === relationship.userId || conn.user2 === relationship.userId)
            .map(conn => conn.user1 === relationship.userId ? conn.user2 : conn.user1);

        await UserModel.findByIdAndUpdate(relationship.userId, {
            following: relationship.following,
            followers,
            connectionList: finalConnectionList,
            blockedUsers: relationship.blockedUsers,
            reportedUsers: relationship.reportedUsers,
            profileViews: relationship.profileViews,
            savedPosts: relationship.savedPosts,
            savedJobs: relationship.savedJobs,
            appliedJobs: relationship.appliedJobs,
            sentConnectionRequests: relationship.sentConnectionRequests,
            receivedConnectionRequests,
            messageRequests: relationship.messageRequests
        });
    }
}

async function userSeeder() {
    try {
        await createRandomUsers();
        console.log(`Generated ${users.length} users`);

        const deleteResult = await UserModel.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} users`);

        const insertResult = await UserModel.insertMany(users);
        console.log(`Inserted ${insertResult.length} users`);

        await updateUserRelationships();
        console.log('Updated user relationships');

        // Verify a sample user
        const sampleUser = await UserModel.findById(userIds[0]);
        console.log('Sample user relationships:', {
            followersCount: sampleUser.followers.length,
            followingCount: sampleUser.following.length,
            connectionListCount: sampleUser.connectionList.length
        });
    } catch (error) {
        console.error('Error seeding users:', error);
    }
}

module.exports = userSeeder;