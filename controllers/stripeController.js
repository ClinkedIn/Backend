const mongoose = require("mongoose");
const subscriptionModel = require("../models/subscriptionModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const userModel = require("../models/userModel");
const createCheckoutSession = async (req, res) => {
    try {
        const paymentMode = "subscription" // Change default to subscription
        const userId = req.user.id;
        const successUrl = req.body.successUrl || `${process.env.CLIENT_URL}/subscription-status`;
        const cancelUrl = req.body.cancelUrl || `${process.env.CLIENT_URL}/subscription-status`;
        // Check for existing subscription
        const existingSubscription = await subscriptionModel.findOne({
            userId,
            status: 'active',
        });

        if (existingSubscription) {
            return res.status(400).json({
                status: 'already_subscribed',
                message: 'You already have an active subscription',
                subscription: {
                    expiryDate: existingSubscription.expiryDate,
                    planType: existingSubscription.planType
                }
            });
        }

        // Create appropriate line items based on payment mode
        let lineItems;

        if (paymentMode === "subscription") {
            // Subscription mode - include recurring prices
            lineItems = [{
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "Premium Membership",
                        description: "Monthly subscription to our premium service",
                    },
                    unit_amount: 2000, // $20 in cents
                    recurring: {
                        interval: "month",
                        interval_count: 1
                    }
                },
                quantity: 1,
            }];
        } else {
            // One-time payment mode - NO recurring property
            lineItems = [{
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "Premium Access",
                        description: "One-time payment for premium access",
                    },
                    unit_amount: 2000, // $20 in cents
                    // No recurring property for one-time payments
                },
                quantity: 1,
            }];
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            success_url: successUrl,
            cancel_url: cancelUrl,
            mode: paymentMode, // Use the payment mode directly
            client_reference_id: userId,
            payment_intent_data: paymentMode === "payment" ? {
                setup_future_usage: 'off_session',
            } : undefined,
        });

        res.status(200).json({
            sessionId: session.id,
            url: session.url,
            status: 'created'
        });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ error: error.message }); // Send the actual error message for debugging
    }
};

const getUserSubscription = async (req, res) => {
    try {
        const userId = req.user.id;

        const subscription = await subscriptionModel.findOne({ userId, status: 'active' });

        if (!subscription) {
            return res.status(404).json({ message: 'No active subscription found' });
        }

        // Get the latest data from Stripe
        let stripeSubscription = null;
        if (subscription.stripeSubscriptionId) {
            stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
        }

        res.json({
            subscription: {
                id: subscription._id,
                stripeSubscriptionId: subscription.stripeSubscriptionId,
                planType: subscription.planType,
                status: subscription.status,
                expiryDate: subscription.expiryDate,
                createdAt: subscription.createdAt,
                // Add other relevant fields

                // Include Stripe-specific details if available
                stripeDetails: stripeSubscription ? {
                    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
                    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
                } : null
            }
        });
    } catch (error) {
        console.error('Error fetching subscription details:', error);
        res.status(500).json({ error: 'Failed to fetch subscription details' });
    }
};

// Enhanced cancellation controller
const cancelSubscription = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find user's subscription in database
        const subscription = await subscriptionModel.findOne({
            userId,
            status: 'active'
        });

        if (!subscription) {
            return res.status(404).json({ message: 'No active subscription found' });
        }

        const { stripeSubscriptionId } = subscription;

        if (!stripeSubscriptionId) {
            return res.status(400).json({ message: 'Invalid subscription data' });
        }

        // FIXED: Use cancel() instead of del() for immediate cancellation
        const canceledSubscription = await stripe.subscriptions.cancel(
            stripeSubscriptionId
            // No second parameter needed for immediate cancellation
        );

        // Update your database immediately
        subscription.status = 'canceled';
        subscription.cancelledAt = new Date();
        await subscription.save();
        
        // ADDITION: Update user status immediately
        await userModel.findByIdAndUpdate(userId, {
            isPremium: false
        });

        res.json({
            message: 'Subscription has been cancelled immediately',
            cancelledAt: new Date()
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
};
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // Verify the event came from Stripe
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            // Store subscription info in your database
            await handleSuccessfulPayment(session);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};
// Function to handle successful payments
const handleSuccessfulPayment = async (session) => {
    try {
        const userId = session.client_reference_id;
        let subscriptionEndDate = new Date();
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        // If it's a subscription, get subscription details
        if (subscriptionId) {

            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            if (subscription.interval == "day") {
                subscriptionEndDate.setDate(subscriptionEndDate.getDate() + subscription.interval_count);
            } else if (subscription.interval == "week") {
                subscriptionEndDate.setDate(subscriptionEndDate.getDate() + (subscription.interval_count * 7));
            }
            else if (subscription.interval == "month") {
                subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + subscription.interval_count);
            } else if (subscription.interval == "year") {
                subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + subscription.interval_count);
            }
            console.log("Subscription end date:", subscriptionEndDate);
            // Create or update subscription in your database
            await subscriptionModel.findOneAndUpdate(
                { userId },
                {
                    userId,
                    stripeCustomerId: customerId,
                    stripeSubscriptionId: subscriptionId,
                    status: 'active',
                    planType: 'premium', // Or whatever plan they subscribed to
                    expiryDate: subscriptionEndDate,
                    createdAt: new Date()
                },
                { upsert: true, new: true }
            );
            await userModel.findByIdAndUpdate(userId, {
                isPremium: true,
            });
        }
    } catch (error) {
        console.error("Error handling successful payment:", error);
    }
};

// Status checking endpoint
const checkPaymentStatus = async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // You can also check your database for more details
        const subscription = await subscriptionModel.findOne({
            userId: req.user.id,
            status: 'active'
        });

        res.status(200).json({
            status: session.payment_status,
            mode: session.mode,
            customer: session.customer,
            subscription: subscription ? {
                expiryDate: subscription.expiryDate,
                planType: subscription.planType,
                status: subscription.status
            } : null
        });
    } catch (error) {
        console.error("Error checking payment status:", error);
        res.status(500).json({ error: "Failed to check payment status" });
    }
};
module.exports = {
    createCheckoutSession,
    cancelSubscription,
    getUserSubscription,
    handleWebhook,
    checkPaymentStatus
};