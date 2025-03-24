const { faker } = require('@faker-js/faker');
const ImpressionModel = require('../models/impressionModel');
const PostModel = require('../models/postModel');
const CommentModel = require('../models/commentModel');
const { userIds, postIds, commentIds, impressionIds } = require('./init');

const impressions = [];

async function createRandomImpressions() {
    // First clear existing impressions from the database
    await ImpressionModel.deleteMany({});
    
    // Get actual posts and comments from the database
    const posts = await PostModel.find({}, '_id');
    const comments = await CommentModel.find({}, '_id');
    
    const postIdsFromDB = posts.map(post => post._id.toString());
    const commentIdsFromDB = comments.map(comment => comment._id.toString());
    
    // Determine how many impressions to create for each type
    const postImpressionCount = Math.floor(impressionIds.length * 0.7); // 70% for posts
    const commentImpressionCount = impressionIds.length - postImpressionCount; // 30% for comments
    
    // Create impressions for posts
    for (let i = 0; i < postImpressionCount; i++) {
        const targetId = faker.helpers.arrayElement(postIdsFromDB.length > 0 ? postIdsFromDB : postIds);
        const userId = faker.helpers.arrayElement(userIds);
        
        // Weighted impression types to make some types more common than others
        const impressionTypeWeights = [
            { type: 'like', weight: 0.5 },     // 50% chance of like
            { type: 'love', weight: 0.2 },     // 20% chance of love
            { type: 'celebrate', weight: 0.1 }, // 10% chance of celebrate
            { type: 'support', weight: 0.1 },   // 10% chance of support
            { type: 'insightful', weight: 0.07 }, // 7% chance of insightful
            { type: 'funny', weight: 0.03 }     // 3% chance of funny
        ];
        
        // Select an impression type based on weights
        const randomValue = Math.random();
        let cumulativeWeight = 0;
        let selectedType = 'like'; // Default
        
        for (const option of impressionTypeWeights) {
            cumulativeWeight += option.weight;
            if (randomValue <= cumulativeWeight) {
                selectedType = option.type;
                break;
            }
        }
        
        impressions.push({
            _id: impressionIds[i],
            userId: userId,
            targetId: targetId,
            targetType: 'Post',
            type: selectedType,
            createdAt: faker.date.recent({ days: 60 })
        });
    }
    
    // Create impressions for comments
    for (let i = postImpressionCount; i < impressionIds.length; i++) {
        const targetId = faker.helpers.arrayElement(commentIdsFromDB.length > 0 ? commentIdsFromDB : commentIds);
        const userId = faker.helpers.arrayElement(userIds);
        
        impressions.push({
            _id: impressionIds[i],
            userId: userId,
            targetId: targetId,
            targetType: 'Comment',
            type: faker.helpers.arrayElement(['like', 'support', 'celebrate', 'love', 'insightful', 'funny']),
            createdAt: faker.date.recent({ days: 60 })
        });
    }
}

async function syncImpressionCounts() {
    console.log('Syncing impression counts with actual impressions...');
    
    // Create a map to store impression counts by target
    const targetCounts = {};
    
    // Process all impressions to calculate counts
    for (const impression of impressions) {
        const { targetId, targetType, type } = impression;
        const targetKey = `${targetType}:${targetId}`;
        
        if (!targetCounts[targetKey]) {
            targetCounts[targetKey] = {
                targetId,
                targetType,
                impressionIds: [],
                counts: {
                    like: 0,
                    support: 0,
                    celebrate: 0,
                    love: 0,
                    insightful: 0,
                    funny: 0,
                    total: 0
                }
            };
        }
        
        // Add this impression ID to the target's impressions array
        targetCounts[targetKey].impressionIds.push(impression._id);
        
        // Increment the specific type count
        targetCounts[targetKey].counts[type]++;
        
        // Increment the total count
        targetCounts[targetKey].counts.total++;
    }
    
    // Update all posts and comments with accurate impression counts
    for (const [targetKey, targetData] of Object.entries(targetCounts)) {
        const { targetId, targetType, impressionIds, counts } = targetData;
        
        if (targetType === 'Post') {
            await PostModel.findByIdAndUpdate(
                targetId,
                { 
                    $set: { 
                        impressions: impressionIds,
                        impressionCounts: counts
                    } 
                }
            );
        } else if (targetType === 'Comment') {
            await CommentModel.findByIdAndUpdate(
                targetId,
                { 
                    $set: { 
                        impressions: impressionIds,
                        impressionCounts: counts
                    } 
                }
            );
        }
    }
    
    console.log(`Updated impression counts for ${Object.keys(targetCounts).length} targets`);
}

// Create a utility function to reset all impression counts if needed
async function resetAllImpressionCounts() {
    const defaultCounts = {
        like: 0,
        support: 0,
        celebrate: 0,
        love: 0,
        insightful: 0,
        funny: 0,
        total: 0
    };
    
    await PostModel.updateMany(
        {},
        { $set: { impressionCounts: defaultCounts, impressions: [] } }
    );
    
    await CommentModel.updateMany(
        {},
        { $set: { impressionCounts: defaultCounts, impressions: [] } }
    );
    
    console.log('Reset all impression counts to zero');
}

async function impressionSeeder() {
    try {
        // Optional: Reset counts first to ensure clean slate
        await resetAllImpressionCounts();
        
        await createRandomImpressions();
        console.log("Generated impressions:", impressions.length);
        
        // Insert the impressions into the database
        const insertResult = await ImpressionModel.insertMany(impressions);
        console.log(`Inserted ${insertResult.length} impressions into the database`);
        
        // Update all posts and comments with accurate impression counts
        await syncImpressionCounts();
        
        // Verify some sample data
        const verifyPostImpressions = await verifyImpressionCounts('Post');
        const verifyCommentImpressions = await verifyImpressionCounts('Comment');
        
        console.log('Impression seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding impressions:', error);
    }
}

// Utility function to verify impression counts for a sample target
async function verifyImpressionCounts(targetType) {
    const targetImpressions = impressions.filter(imp => imp.targetType === targetType);
    if (targetImpressions.length === 0) return;
    
    // Pick a random target to verify
    const randomIndex = Math.floor(Math.random() * targetImpressions.length);
    const sampleTargetId = targetImpressions[randomIndex].targetId;
    
    // Count impressions for this target manually
    const impressionsForTarget = impressions.filter(imp => 
        imp.targetType === targetType && 
        imp.targetId.toString() === sampleTargetId.toString()
    );
    
    const manualCounts = {
        like: impressionsForTarget.filter(imp => imp.type === 'like').length,
        support: impressionsForTarget.filter(imp => imp.type === 'support').length,
        celebrate: impressionsForTarget.filter(imp => imp.type === 'celebrate').length,
        love: impressionsForTarget.filter(imp => imp.type === 'love').length,
        insightful: impressionsForTarget.filter(imp => imp.type === 'insightful').length,
        funny: impressionsForTarget.filter(imp => imp.type === 'funny').length,
        total: impressionsForTarget.length
    };
    
    // Get the stored counts from database
    let targetModel, storedTarget;
    if (targetType === 'Post') {
        targetModel = PostModel;
    } else if (targetType === 'Comment') {
        targetModel = CommentModel;
    }
    
    storedTarget = await targetModel.findById(sampleTargetId);
    
    console.log(`\nVerification for sample ${targetType} (ID: ${sampleTargetId}):`);
    console.log('Manual count:', manualCounts);
    console.log('Stored count:', storedTarget.impressionCounts);
    console.log('Impression IDs count:', storedTarget.impressions.length);
    console.log('Match:', 
        manualCounts.total === storedTarget.impressionCounts.total && 
        storedTarget.impressions.length === manualCounts.total ? 
        'YES ✓' : 'NO ✗'
    );
    
    return {
        match: manualCounts.total === storedTarget.impressionCounts.total,
        manualCounts,
        storedCounts: storedTarget.impressionCounts
    };
}

module.exports = impressionSeeder;