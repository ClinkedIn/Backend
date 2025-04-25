const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    status: {
        type: String,
        enum: ['active', 'canceled', 'past_due', 'unpaid', 'incomplete'],
        required: true
    },
    planType: {
        type: String,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    cancelledAt: Date,
    cancelAtPeriodEnd: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
