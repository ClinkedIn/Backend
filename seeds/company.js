const { faker } = require('@faker-js/faker');
const CompanyModel = require('../models/companyModel');
const UserModel = require('../models/userModel');
const { 
    userIds, postIds, companyIds, jobIds 
} = require('./init');

const companies = [];

async function createRandomCompanies() {
    // Industries list for more realistic data
    const industries = [
        'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
        'Retail', 'Media & Entertainment', 'Hospitality', 'Construction',
        'Transportation', 'Agriculture', 'Energy', 'Professional Services',
        'Real Estate', 'Telecommunications', 'Aerospace', 'Automotive',
        'Biotechnology', 'Consumer Goods', 'Defense'
    ];

    for (let i = 0; i < companyIds.length; i++) {
        const companyId = companyIds[i];
        
        // For each company, select a random user as creator
        const creatorUserId = faker.helpers.arrayElement(userIds);
        
        // Select random users as admins (1-3 admins per company)
        const adminCount = faker.number.int({ min: 1, max: 3 });
        const admins = faker.helpers.arrayElements(
            userIds.filter(id => id !== creatorUserId),
            adminCount
        );
        
        // Include creator in admins list
        admins.push(creatorUserId);
        
        // Generate followers (5-20 followers per company)
        const followerCount = faker.number.int({ min: 5, max: 20 });
        const followers = faker.helpers.arrayElements(userIds, followerCount)
            .map(userId => ({
                entity: userId,
                entityType: 'User',
                followedAt: faker.date.past({ years: 1 })
            }));
        
        // Some companies might also follow other companies (0-5)
        const followingCompanyCount = faker.number.int({ min: 0, max: 5 });
        const followingCompanies = faker.helpers.arrayElements(
            companyIds.filter(id => id !== companyId),
            followingCompanyCount
        ).map(compId => ({
            entity: compId,
            entityType: 'Company',
            followedAt: faker.date.past({ months: 6 })
        }));
        
        // Some companies might follow users (0-10 users)
        const followingUserCount = faker.number.int({ min: 0, max: 10 });
        const followingUsers = faker.helpers.arrayElements(
            userIds,
            followingUserCount
        ).map(userId => ({
            entity: userId,
            entityType: 'User',
            followedAt: faker.date.past({ months: 9 })
        }));
        
        // Combine following arrays
        const following = [...followingCompanies, ...followingUsers];
        
        // Get random posts for this company (0-10 posts)
        const companyPosts = faker.helpers.arrayElements(
            postIds,
            faker.number.int({ min: 0, max: 10 })
        );
        
        // Get random jobs for this company (0-5 jobs)
        const companyJobs = faker.helpers.arrayElements(
            jobIds,
            faker.number.int({ min: 0, max: 5 })
        );
        
        // Store visitors (10-30 visitors)
        const visitorCount = faker.number.int({ min: 10, max: 30 });
        const visitors = faker.helpers.arrayElements(userIds, visitorCount);

        // Generate company address (like linkedin.com/company/company-name)
        const companyName = faker.company.name();
        const formattedName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const address = `linkedin.com/company/${formattedName}`;
        
        companies.push({
            _id: companyId,
            userId: creatorUserId,
            admins,
            followers,
            following,
            name: companyName,
            address,
            website: faker.internet.url(),
            industry: faker.helpers.arrayElement(industries),
            organizationSize: faker.helpers.arrayElement([
                "1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5000+"
            ]),
            organizationType: faker.helpers.arrayElement([
                "Public", "Private", "Nonprofit", "Government", "Educational", "Self-employed"
            ]),
            logo: faker.image.urlLoremFlickr({ category: 'business' }),
            tagLine: faker.company.catchPhrase(),
            visitors,
            isActive: faker.datatype.boolean(0.9), // 90% active
            posts: companyPosts,
            jobs: companyJobs,
            createdAt: faker.date.past({ years: 3 }),
            updatedAt: faker.date.recent(),
        });
    }
}

// Update user documents to link them with companies
async function updateUserCompanyRelationships() {
    // Create maps for efficient lookups
    const companyCreatorMap = new Map();
    const companyAdminMap = new Map();
    
    // Fill maps with relationships
    companies.forEach(company => {
        // Creator relationship
        if (!companyCreatorMap.has(company.userId.toString())) {
            companyCreatorMap.set(company.userId.toString(), []);
        }
        companyCreatorMap.get(company.userId.toString()).push(company._id);
        
        // Admin relationships
        company.admins.forEach(adminId => {
            if (!companyAdminMap.has(adminId.toString())) {
                companyAdminMap.set(adminId.toString(), []);
            }
            companyAdminMap.get(adminId.toString()).push(company._id);
        });
    });
    
    // Process all users and update their company relationships
    for (const userId of userIds) {
        const userCompanies = companyCreatorMap.get(userId.toString()) || [];
        const adminCompanies = companyAdminMap.get(userId.toString()) || [];
        
        await UserModel.findByIdAndUpdate(userId, {
            companies: userCompanies,
            adminInCompanies: adminCompanies
        });
    }
}

async function companySeeder() {
    try {
        await createRandomCompanies();
        console.log(`Generated ${companies.length} companies`);

        const deleteResult = await CompanyModel.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} companies`);

        const insertResult = await CompanyModel.insertMany(companies);
        console.log(`Inserted ${insertResult.length} companies`);

        await updateUserCompanyRelationships();
        console.log('Updated user-company relationships');

        // Verify a sample company
        const sampleCompany = await CompanyModel.findById(companyIds[0]);
        console.log('Sample company:', {
            name: sampleCompany.name,
            industry: sampleCompany.industry,
            followersCount: sampleCompany.followers.length,
            jobsCount: sampleCompany.jobs.length
        });
        
        // Verify a sample user's company relationships
        const sampleUser = await UserModel.findById(userIds[0]);
        console.log('Sample user company relationships:', {
            ownedCompanies: sampleUser.companies.length,
            adminInCompanies: sampleUser.adminInCompanies.length
        });
    } catch (error) {
        console.error('Error seeding companies:', error);
    }
}

module.exports = companySeeder;