const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const {
  createCheckoutSession,
  cancelSubscription,
  handleWebhook,
} = require('../controllers/stripeController');

// Mock Stripe more effectively
jest.mock('stripe', () => {
  return jest.fn(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'cs_test_123',
          url: 'https://checkout.stripe.com/test',
          payment_intent: 'pi_123'
        }),
        retrieve: jest.fn().mockResolvedValue({
          id: 'cs_test_123',
          payment_status: 'paid',
          mode: 'subscription',
          customer: 'cus_123'
        })
      }
    },
    subscriptions: {
      cancel: jest.fn().mockResolvedValue({
        id: 'sub_stripe123',
        status: 'canceled'
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'sub_123',
        interval: 'month',
        interval_count: 1
      })
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            client_reference_id: 'user123',
            customer: 'cus_123',
            subscription: 'sub_123'
          }
        }
      })
    }
  }));
});

jest.mock('../models/subscriptionModel');
jest.mock('../models/userModel');

// Import mocked models
const subscriptionModel = require('../models/subscriptionModel');
const userModel = require('../models/userModel');

// Setup express app for testing
const app = express();
app.use(express.json()); 

// For webhook endpoint - use raw body parser
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
// For all other routes - use JSON parser
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Mock authentication middleware
const mockVerifyToken = (req, res, next) => {
  req.user = {
    id: 'user123',
    email: 'test@example.com'
  };
  next();
};

// Set up routes for testing
app.post('/api/stripe/create-checkout-session', mockVerifyToken, createCheckoutSession);
app.delete('/api/stripe/cancel-subscription', mockVerifyToken, cancelSubscription);
app.post('/api/stripe/webhook', handleWebhook);

describe('Stripe Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/stripe/create-checkout-session - Create Checkout Session', () => {
    test('should create a checkout session successfully', async () => {
      // Mock subscription check
      subscriptionModel.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/api/stripe/create-checkout-session')
        .send({
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sessionId', 'cs_test_123');
      expect(response.body).toHaveProperty('url', 'https://checkout.stripe.com/test');
    });

    test('should return 400 if user already has active subscription', async () => {
      // Mock existing subscription
      const mockSubscription = {
        userId: 'user123',
        status: 'active',
        planType: 'premium',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      };
      
      subscriptionModel.findOne = jest.fn().mockResolvedValue(mockSubscription);

      const response = await request(app)
        .post('/api/stripe/create-checkout-session')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'already_subscribed');
    });

  });

  describe('DELETE /api/stripe/cancel-subscription - Cancel Subscription', () => {
    test('should successfully cancel a subscription', async () => {
      // Mock subscription with save method
      const mockSubscription = {
        userId: 'user123',
        stripeSubscriptionId: 'sub_stripe123',
        status: 'active',
        save: jest.fn().mockResolvedValue(true)
      };
      
      subscriptionModel.findOne = jest.fn().mockResolvedValue(mockSubscription);
      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({ id: 'user123', isPremium: false });

      const response = await request(app).delete('/api/stripe/cancel-subscription');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Subscription has been cancelled immediately');
      expect(mockSubscription.status).toBe('canceled');
    });

    test('should return 404 if no active subscription found', async () => {
      subscriptionModel.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app).delete('/api/stripe/cancel-subscription');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'No active subscription found');
    });

    test('should return 400 if subscription has no Stripe ID', async () => {
      // Mock invalid subscription
      const mockSubscription = {
        userId: 'user123',
        stripeSubscriptionId: null,
        status: 'active'
      };
      
      subscriptionModel.findOne = jest.fn().mockResolvedValue(mockSubscription);

      const response = await request(app).delete('/api/stripe/cancel-subscription');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid subscription data');
    });
  });

  describe('POST /api/stripe/webhook - Handle Webhook', () => {
    test('should handle checkout.session.completed event', async () => {
      // Mocks for the webhook test
      subscriptionModel.findOneAndUpdate = jest.fn().mockResolvedValue({});
      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue({});
      
      // Send a simulated webhook event
      const response = await request(app)
        .post('/api/stripe/webhook')
        .set('stripe-signature', 'test_signature')
        .send(JSON.stringify({
          type: 'checkout.session.completed',
          data: {
            object: {
              client_reference_id: 'user123',
              customer: 'cus_123',
              subscription: 'sub_123'
            }
          }
        }));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('received', true);
    }, 10000); // Increase timeout

  });
});