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

// Update user documents to link them with companies and sync followers/following
// Update user documents to link them with companies and sync followers/following
async function updateUserCompanyRelationships() {
    // Create maps for efficient lookups
    const companyCreatorMap = new Map();
    const companyAdminMap = new Map();
    const userFollowingMap = new Map();
    const userFollowedByMap = new Map();
    
    // Initialize maps for each user
    userIds.forEach(userId => {
        companyCreatorMap.set(userId.toString(), []);
        companyAdminMap.set(userId.toString(), []);
        userFollowingMap.set(userId.toString(), []);
        userFollowedByMap.set(userId.toString(), []);
    });
    
    // Fill maps with relationships from company data
    companies.forEach(company => {
        const companyId = company._id.toString();
        
        // Creator relationship
        companyCreatorMap.get(company.userId.toString()).push(company._id);
        
        // Admin relationships
        company.admins.forEach(adminId => {
            companyAdminMap.get(adminId.toString()).push(company._id);
        });
        
        // User follows company relationships
        company.followers.forEach(follower => {
            if (follower.entityType === 'User') {
                const userId = follower.entity.toString();
                
                // Add company to user's following list
                userFollowingMap.get(userId).push({
                    entity: company._id,
                    entityType: 'Company',
                    followedAt: follower.followedAt
                });
            }
        });
        
        // Company follows user relationships
        company.following.forEach(followed => {
            if (followed.entityType === 'User') {
                const userId = followed.entity.toString();
                
                // Add company to users's followers list
                userFollowedByMap.get(userId).push({
                    entity: company._id,
                    entityType: 'Company',
                    followedAt: followed.followedAt
                });
            }
        });
    });
    
    // Process all users and update their company relationships
    for (const userId of userIds) {
        const userIdStr = userId.toString();
        const userCompanies = companyCreatorMap.get(userIdStr);
        const adminCompanies = companyAdminMap.get(userIdStr);
        const companyFollowing = userFollowingMap.get(userIdStr);
        const companyFollowers = userFollowedByMap.get(userIdStr);
        
        // Get existing user data (to maintain other relationships like user-to-user following)
        const user = await UserModel.findById(userId);
        
        // Filter out company relationships from existing following/followers
        // and add the newly generated company relationships
        const updatedFollowing = [
            ...(user.following || []).filter(f => f.entityType !== 'Company'),
            ...companyFollowing
        ];
        
        const updatedFollowers = [
            ...(user.followers || []).filter(f => f.entityType !== 'Company'),
            ...companyFollowers
        ];
        
        await UserModel.findByIdAndUpdate(userId, {
            companies: userCompanies,            // Companies created by user
            adminInCompanies: adminCompanies,    // Companies where user is admin
            following: updatedFollowing,         // Both users and companies user follows
            followers: updatedFollowers          // Both users and companies following user
        });
    }
    
    console.log(`Updated company relationships for ${userIds.length} users`);
}

// Ensure bidirectional consistency in company-to-company follows
async function synchronizeCompanyFollowRelationships() {
    console.log('Synchronizing company-to-company relationships...');
    
    // Create a map to track all company following relationships for quick lookup
    const companyFollowsMap = new Map();
    
    // First pass: build the map of all company-to-company follows
    for (const company of companies) {
        const companyId = company._id.toString();
        
        // Extract companies this company follows
        const followingCompanies = company.following
            .filter(f => f.entityType === 'Company')
            .map(f => ({
                entityId: f.entity.toString(),
                followedAt: f.followedAt
            }));
            
        companyFollowsMap.set(companyId, followingCompanies);
    }
    
    // Second pass: ensure bidirectional consistency
    let relationshipsFixed = 0;
    
    for (const company of companies) {
        const companyId = company._id.toString();
        const followingCompanies = companyFollowsMap.get(companyId) || [];
        
        // For each company this company follows
        for (const following of followingCompanies) {
            const followedCompanyId = following.entityId;
            const followedCompany = companies.find(c => c._id.toString() === followedCompanyId);
            
            if (followedCompany) {
                // Check if the followed company has this company in its followers list
                const hasFollowerEntry = followedCompany.followers.some(
                    f => f.entityType === 'Company' && f.entity.toString() === companyId
                );
                
                if (!hasFollowerEntry) {
                    // Add missing follower entry
                    followedCompany.followers.push({
                        entity: company._id,
                        entityType: 'Company',
                        followedAt: following.followedAt
                    });
                    relationshipsFixed++;
                }
            }
        }
        
        // For each company following this company
        const followerCompanies = company.followers
            .filter(f => f.entityType === 'Company')
            .map(f => f.entity.toString());
            
        for (const followerCompanyId of followerCompanies) {
            const followerCompany = companies.find(c => c._id.toString() === followerCompanyId);
            
            if (followerCompany) {
                // Check if the follower company has this company in its following list
                const hasFollowingEntry = followerCompany.following.some(
                    f => f.entityType === 'Company' && f.entity.toString() === companyId
                );
                
                if (!hasFollowingEntry) {
                    // Add missing following entry
                    const followedAt = company.followers.find(
                        f => f.entityType === 'Company' && f.entity.toString() === followerCompanyId
                    ).followedAt;
                    
                    followerCompany.following.push({
                        entity: company._id,
                        entityType: 'Company',
                        followedAt: followedAt
                    });
                    relationshipsFixed++;
                }
            }
        }
    }
    
    console.log(`Fixed ${relationshipsFixed} inconsistent company relationships`);
}

async function companySeeder() {
    try {
        await createRandomCompanies();
        console.log(`Generated ${companies.length} companies`);
        
        // Fix company-to-company relationship inconsistencies before inserting
        await synchronizeCompanyFollowRelationships();

        const deleteResult = await CompanyModel.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} companies`);

        const insertResult = await CompanyModel.insertMany(companies);
        console.log(`Inserted ${insertResult.length} companies`);

        await updateUserCompanyRelationships();
        console.log('Updated user-company relationships');

        // Verify company-to-company following relationships
        await verifyCompanyToCompanyRelationships();

        // Verify a sample company
        const sampleCompany = await CompanyModel.findById(companyIds[0]);
        console.log('Sample company:', {
            name: sampleCompany.name,
            industry: sampleCompany.industry,
            followersCount: sampleCompany.followers.length,
            followingCount: sampleCompany.following.length,
            jobsCount: sampleCompany.jobs.length
        });
        
        // Verify a sample user's company relationships
        const sampleUser = await UserModel.findById(userIds[0]);
        console.log('Sample user company relationships:', {
            ownedCompanies: sampleUser.companies?.length || 0,
            adminInCompanies: sampleUser.adminInCompanies?.length || 0,
            companiesFollowing: sampleUser.following?.filter(f => f.entityType === 'Company').length || 0,
            followedByCompanies: sampleUser.followers?.filter(f => f.entityType === 'Company').length || 0
        });
    } catch (error) {
        console.error('Error seeding companies:', error);
    }
}

// Helper function to verify company-to-company relationships are properly set
async function verifyCompanyToCompanyRelationships() {
    // Check a few random companies to ensure their company-to-company follows are consistent
    const sampleSize = Math.min(5, companyIds.length);
    const sampleCompanyIds = faker.helpers.arrayElements(companyIds, sampleSize);
    
    let inconsistenciesFound = 0;
    
    for (const companyId of sampleCompanyIds) {
        const company = await CompanyModel.findById(companyId);
        
        // Check companies this company follows
        const followingCompanies = company.following.filter(f => f.entityType === 'Company');
        
        for (const followedCompany of followingCompanies) {
            const followed = await CompanyModel.findById(followedCompany.entity);
            
            // Check if the followed company has this company in its followers
            const isInFollowers = followed.followers.some(
                f => f.entityType === 'Company' && f.entity.toString() === companyId.toString()
            );
            
            if (!isInFollowers) {
                console.warn(`Inconsistency: ${company.name} follows ${followed.name}, but is not in its followers list`);
                inconsistenciesFound++;
            }
        }
        
        // Check companies following this company
        const followerCompanies = company.followers.filter(f => f.entityType === 'Company');
        
        for (const followerCompany of followerCompanies) {
            const follower = await CompanyModel.findById(followerCompany.entity);
            
            // Check if the follower company has this company in its following
            const isInFollowing = follower.following.some(
                f => f.entityType === 'Company' && f.entity.toString() === companyId.toString()
            );
            
            if (!isInFollowing) {
                console.warn(`Inconsistency: ${follower.name} is in ${company.name}'s followers, but doesn't follow it`);
                inconsistenciesFound++;
            }
        }
    }
    
    if (inconsistenciesFound > 0) {
        console.warn(`Found ${inconsistenciesFound} inconsistencies in company relationships`);
    } else {
        console.log(`Verified company relationships for ${sampleSize} sample companies - no inconsistencies found`);
    }
}

module.exports = companySeeder;