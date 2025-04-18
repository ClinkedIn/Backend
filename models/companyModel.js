const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }, // Company creator
        admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Company admins
        followers: [
            {
                entity: {
                    type: mongoose.Schema.Types.ObjectId,
                    refPath: 'followers.entityType',
                },
                entityType: { type: String, enum: ['User', 'Company'] },
                followedAt: { type: Date, default: Date.now },
            },
        ],
        following: [
            {
                entity: {
                    type: mongoose.Schema.Types.ObjectId,
                    refPath: 'following.entityType',
                },
                entityType: { type: String, enum: ['User', 'Company'] },
                followedAt: { type: Date, default: Date.now },
            },
        ],
        name: { type: String, required: true },
        address: { type: String, required: true, unique: true }, // Unique LinkedIn-style URL
        website: { type: String },
        industry: { type: String, required: true }, // Industry of the company
        organizationSize: {
            type: String,
            enum: [
                '1-10',
                '11-50',
                '51-200',
                '201-500',
                '501-1000',
                '1001-5000',
                '5000+',
            ],
            required: true,
        }, // Predefined company sizes
        organizationType: {
            type: String,
            enum: [
                'Public',
                'Private',
                'Nonprofit',
                'Government',
                'Educational',
                'Self-employed',
            ],
            required: true,
        }, // Company type
        logo: { type: String }, // URL to company logo
        tagLine: { type: String }, // Short company description
        visitors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who visited the profile
        isDeleted: { type: Boolean, default: false },
        posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // Company posts
        jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }], // Company job listings
        location: { type: String, default: null }, // Company location
    },
    { timestamps: true }
); // Adds createdAt & updatedAt timestamps

companySchema.pre(/^find/, function (next) {
    if (this.getOptions().skipDeletedFilter) {
        return next();
    }
    /*
    const company = await companyModel.findById(companyId).setOptions({ skipDeletedFilter: true });
    const deletedCompany = await companyModel
    .findOne({ _id: companyId })
    .setOptions({ skipDeletedFilter: true });

    */

    this.find({ isDeleted: false });
    console.log('Pre-hook for find* called');
    next();
});

module.exports = mongoose.model('Company', companySchema);
