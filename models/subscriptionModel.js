const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true }, // Link to the User
    planType: { type: String, enum: ["free", "premium"], default: "free" }, // Plan Type
    startDate: { type: Date, default: Date.now }, // Subscription Start Date
    endDate: { type: Date }, // Subscription End Date
    isAutoRenew: { type: Boolean, default: false }, // Auto-renewal status
    status: { type: String, enum: ["active", "expired", "cancelled"], default: "active" } // Subscription Status
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
