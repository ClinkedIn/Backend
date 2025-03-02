const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // User who made the payment
    subscriptionId: { type: Schema.Types.ObjectId, ref: "Subscription" }, // Related subscription
    transactionId: { type: String, required: true, unique: true }, // Stripe Transaction ID
    amount: { type: Number, required: true }, // Payment Amount
    currency: { type: String, default: "USD" }, // Payment Currency
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" }, // Transaction Status
    createdAt: { type: Date, default: Date.now } // Transaction Date
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
