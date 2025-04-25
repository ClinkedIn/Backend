// userController.test.js
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const Notification = require("../models/notificationModel");
const APIFeatures = require("../utils/apiFeatures");
const ms = require("ms");
const notificationController = require("../controllers/notificationController.js");
const { sendNotification } = require("../utils/Notification.js");
const userModel = require("../models/userModel");
const firebaseAdmin = require("../utils/firebase");
const crypto = require("crypto");

// Create a simple mock response object
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.get = jest.fn();
  return res;
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// --- Mocks ---
jest.mock("../models/userModel");
jest.mock("../utils/firebase");
jest.mock("../models/notificationModel");
jest.mock("../utils/apiFeatures");
jest.mock("ms");
describe("getNotifications", () => {
  let req, res;
  let featuresMock;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: { id: "userId123" },
      query: {},
    };
    res = mockRes();

    // Create a consistent featuresMock with chainable methods
    featuresMock = {
      filter: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limitFields: jest.fn().mockReturnThis(),
      paginate: jest.fn().mockReturnThis(),
      query: null, // Will be set in each test
    };

    // Reset the mock implementation for each test
    APIFeatures.mockImplementation((query, queryString) => {
      // Store the latest call for verification
      APIFeatures.mockQuery = query;
      APIFeatures.mockQueryString = queryString;
      return featuresMock;
    });
  });

  it("should return 404 when no notifications are found", async () => {
    // Setup the mock to return no notifications
    featuresMock.query = Promise.resolve(null);

    await notificationController.getNotifications(req, res);

    // Verify query construction
    expect(APIFeatures).toHaveBeenCalledTimes(1);
    expect(APIFeatures.mockQueryString).toEqual(req.query);

    // Verify chain methods were called
    expect(featuresMock.filter).toHaveBeenCalled();
    expect(featuresMock.sort).toHaveBeenCalled();
    expect(featuresMock.limitFields).toHaveBeenCalled();
    expect(featuresMock.paginate).toHaveBeenCalled();

    // Verify response
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "No notifications found",
    });
  });

  it("should return notifications with user details when found", async () => {
    // Mock notifications
    const mockNotifications = [
      {
        _id: "notif1",
        from: "sender1",
        to: "userId123",
        message: "Test notification 1",
        _doc: {
          _id: "notif1",
          from: "sender1",
          to: "userId123",
          message: "Test notification 1",
        },
      },
      {
        _id: "notif2",
        from: "sender2",
        to: "userId123",
        message: "Test notification 2",
        _doc: {
          _id: "notif2",
          from: "sender2",
          to: "userId123",
          message: "Test notification 2",
        },
      },
    ];

    // Mock sender users
    const mockUsers = {
      sender1: {
        _id: "sender1",
        email: "sender1@example.com",
        firstName: "John",
        lastName: "Doe",
        profilePicture: "profile1.jpg",
      },
      sender2: {
        _id: "sender2",
        email: "sender2@example.com",
        firstName: "Jane",
        lastName: "Smith",
        profilePicture: "profile2.jpg",
      },
    };

    // Setup the query result
    featuresMock.query = Promise.resolve(mockNotifications);

    // Setup the findById to return appropriate user based on the ID
    userModel.findById = jest.fn().mockImplementation((id) => {
      return Promise.resolve(mockUsers[id]);
    });

    // Create expected response with user details
    const expectedResponse = mockNotifications.map((notification) => ({
      ...notification._doc,
      sendingUser: {
        email: mockUsers[notification.from].email,
        firstName: mockUsers[notification.from].firstName,
        lastName: mockUsers[notification.from].lastName,
        profilePicture: mockUsers[notification.from].profilePicture,
      },
    }));

    await notificationController.getNotifications(req, res);

    // Verify query construction
    expect(APIFeatures).toHaveBeenCalledTimes(1);
    expect(APIFeatures.mockQueryString).toEqual(req.query);

    // Check that user lookup was called for each notification
    expect(userModel.findById).toHaveBeenCalledTimes(2);
    expect(userModel.findById).toHaveBeenCalledWith("sender1");
    expect(userModel.findById).toHaveBeenCalledWith("sender2");

    // Check response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expectedResponse);
  });

  it("should handle errors appropriately", async () => {
    // Force an error in the query
    const error = new Error("Database error");
    featuresMock.query = Promise.reject(error);

    await notificationController.getNotifications(req, res);

    // Verify query construction
    expect(APIFeatures).toHaveBeenCalledTimes(1);

    // Verify error response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server Error",
      error,
    });
  });

  it("should use pagination and filtering from request query", async () => {
    // Setup request with query parameters
    req.query = {
      page: "2",
      limit: "10",
      sort: "-createdAt",
      read: "false", // For filtering
    };

    // Empty notifications for this test
    featuresMock.query = Promise.resolve([]);

    await notificationController.getNotifications(req, res);

    // Verify APIFeatures was called with correct params
    expect(APIFeatures).toHaveBeenCalledTimes(1);
    expect(APIFeatures.mockQueryString).toEqual(req.query);

    // Verify all query methods were called
    expect(featuresMock.filter).toHaveBeenCalled();
    expect(featuresMock.sort).toHaveBeenCalled();
    expect(featuresMock.limitFields).toHaveBeenCalled();
    expect(featuresMock.paginate).toHaveBeenCalled();

    // Verify successful response for empty array
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});

describe("getUnreadNotificationsCount", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: { id: "userId123" },
    };
    res = mockRes();
  });

  it("should return the correct count of unread notifications", async () => {
    // Mock the countDocuments function to return a specific count
    const mockUnreadCount = 5;
    Notification.countDocuments = jest.fn().mockResolvedValue(mockUnreadCount);

    await notificationController.getUnreadNotificationsCount(req, res);

    // Verify countDocuments was called with correct parameters
    expect(Notification.countDocuments).toHaveBeenCalledWith({
      to: "userId123",
      isRead: false,
      isDeleted: false,
    });

    // Verify response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ unreadCount: mockUnreadCount });
  });

  it("should return zero when there are no unread notifications", async () => {
    // Mock the countDocuments function to return zero
    Notification.countDocuments = jest.fn().mockResolvedValue(0);

    await notificationController.getUnreadNotificationsCount(req, res);

    // Verify countDocuments was called with correct parameters
    expect(Notification.countDocuments).toHaveBeenCalledWith({
      to: "userId123",
      isRead: false,
      isDeleted: false,
    });

    // Verify response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ unreadCount: 0 });
  });

  it("should handle errors appropriately", async () => {
    // Force an error in the countDocuments operation
    const error = new Error("Database error");
    Notification.countDocuments = jest.fn().mockRejectedValue(error);

    await notificationController.getUnreadNotificationsCount(req, res);

    // Verify error response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server Error",
      error,
    });
  });
});

describe("markRead", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: { id: "userId123" },
      params: { id: "notification123" },
    };
    res = mockRes();
  });

  it("should successfully mark a notification as read", async () => {
    // Mock a notification that belongs to the user
    const mockNotification = {
      _id: "notification123",
      to: {
        toString: () => "userId123", // Mock the toString method to return the user ID
      },
      isDeleted: false,
      isRead: false,
      save: jest.fn().mockResolvedValue(true),
    };

    // Set up the mock to return our test notification
    Notification.findById = jest.fn().mockResolvedValue(mockNotification);

    await notificationController.markRead(req, res);

    // Verify the notification was found
    expect(Notification.findById).toHaveBeenCalledWith("notification123");

    // Verify isRead was set to true
    expect(mockNotification.isRead).toBe(true);

    // Verify save was called
    expect(mockNotification.save).toHaveBeenCalled();

    // Verify response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Notification marked as read",
    });
  });

  it("should return 404 if notification is not found", async () => {
    // Mock findById to return null (notification not found)
    Notification.findById = jest.fn().mockResolvedValue(null);

    await notificationController.markRead(req, res);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Notification not found",
    });
  });

  it("should return 404 if notification is deleted", async () => {
    // Mock a deleted notification
    const mockNotification = {
      _id: "notification123",
      to: {
        toString: () => "userId123",
      },
      isDeleted: true, // This notification is marked as deleted
      save: jest.fn(),
    };

    Notification.findById = jest.fn().mockResolvedValue(mockNotification);

    await notificationController.markRead(req, res);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Notification not found",
    });

    // Verify save was not called
    expect(mockNotification.save).not.toHaveBeenCalled();
  });

  it("should return 403 if user is not authorized", async () => {
    // Mock a notification that belongs to a different user
    const mockNotification = {
      _id: "notification123",
      to: {
        toString: () => "differentUserId", // Different from req.user.id
      },
      isDeleted: false,
      save: jest.fn(),
    };

    Notification.findById = jest.fn().mockResolvedValue(mockNotification);

    await notificationController.markRead(req, res);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized to edit this notification",
    });

    // Verify save was not called
    expect(mockNotification.save).not.toHaveBeenCalled();
  });

  it("should handle database errors", async () => {
    // Force a database error
    const error = new Error("Database error");
    Notification.findById = jest.fn().mockRejectedValue(error);

    await notificationController.markRead(req, res);

    // Verify error response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server Error",
      error,
    });
  });

  it("should handle save errors", async () => {
    // Mock a notification with a save method that throws an error
    const saveError = new Error("Save failed");
    const mockNotification = {
      _id: "notification123",
      to: {
        toString: () => "userId123",
      },
      isDeleted: false,
      isRead: false,
      save: jest.fn().mockRejectedValue(saveError),
    };

    Notification.findById = jest.fn().mockResolvedValue(mockNotification);

    await notificationController.markRead(req, res);

    // Verify error response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server Error",
      error: saveError,
    });
  });
});

describe("markUnread", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: { id: "userId123" },
      params: { id: "notification123" },
    };
    res = mockRes();
  });

  it("should successfully mark a notification as unread", async () => {
    // Mock a notification that belongs to the user
    const mockNotification = {
      _id: "notification123",
      to: {
        toString: () => "userId123", // Mock the toString method to return the user ID
      },
      isDeleted: false,
      isRead: true,
      save: jest.fn().mockResolvedValue(true),
    };

    // Set up the mock to return our test notification
    Notification.findById = jest.fn().mockResolvedValue(mockNotification);

    await notificationController.markUnread(req, res);

    // Verify the notification was found
    expect(Notification.findById).toHaveBeenCalledWith("notification123");

    // Verify isRead was set to false
    expect(mockNotification.isRead).toBe(false);

    // Verify save was called
    expect(mockNotification.save).toHaveBeenCalled();

    // Verify response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Notification marked as unread",
    });
  });

  it("should return 404 if notification is not found", async () => {
    // Mock findById to return null (notification not found)
    Notification.findById = jest.fn().mockResolvedValue(null);

    await notificationController.markUnread(req, res);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Notification not found",
    });
  });

  it("should return 404 if notification is deleted", async () => {
    // Mock a deleted notification
    const mockNotification = {
      _id: "notification123",
      to: {
        toString: () => "userId123",
      },
      isDeleted: true, // This notification is marked as deleted
      save: jest.fn(),
    };

    Notification.findById = jest.fn().mockResolvedValue(mockNotification);

    await notificationController.markUnread(req, res);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Notification not found",
    });

    // Verify save was not called
    expect(mockNotification.save).not.toHaveBeenCalled();
  });

  it("should return 403 if user is not authorized", async () => {
    // Mock a notification that belongs to a different user
    const mockNotification = {
      _id: "notification123",
      to: {
        toString: () => "differentUserId", // Different from req.user.id
      },
      isDeleted: false,
      save: jest.fn(),
    };

    Notification.findById = jest.fn().mockResolvedValue(mockNotification);

    await notificationController.markUnread(req, res);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized to edit this notification",
    });

    // Verify save was not called
    expect(mockNotification.save).not.toHaveBeenCalled();
  });

  it("should handle database errors during findById", async () => {
    // Force a database error
    const error = new Error("Database error");
    Notification.findById = jest.fn().mockRejectedValue(error);

    await notificationController.markUnread(req, res);

    // Verify error response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server Error",
      error,
    });
  });

  it("should handle save errors", async () => {
    // Mock a notification with a save method that throws an error
    const saveError = new Error("Save failed");
    const mockNotification = {
      _id: "notification123",
      to: {
        toString: () => "userId123",
      },
      isDeleted: false,
      isRead: true,
      save: jest.fn().mockRejectedValue(saveError),
    };

    Notification.findById = jest.fn().mockResolvedValue(mockNotification);

    await notificationController.markUnread(req, res);

    // Verify error response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server Error",
      error: saveError,
    });
  });
});

describe("pauseNotifications", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: { id: "userId123" },
      body: { duration: "2h" },
    };
    res = mockRes();

    // Mock ms to return milliseconds
    ms.mockReturnValue(7200000); // 2 hours in milliseconds
    jest.spyOn(Date, "now").mockImplementation(() => 1618000000000); // Fixed timestamp
  });

  it("should pause notifications for the specified duration", async () => {
    // Mock user
    const mockUser = {
      _id: "userId123",
      notificationPauseExpiresAt: null,
      save: jest.fn().mockResolvedValue(true),
    };

    userModel.findById = jest.fn().mockResolvedValue(mockUser);

    await notificationController.pauseNotifications(req, res);

    // Verify user was found
    expect(userModel.findById).toHaveBeenCalledWith("userId123");

    // Verify duration was parsed
    expect(ms).toHaveBeenCalledWith("2h");

    // Verify expiration was set correctly
    expect(mockUser.notificationPauseExpiresAt).toEqual(
      new Date(1618000000000 + 7200000)
    );

    // Verify save was called
    expect(mockUser.save).toHaveBeenCalled();

    // Verify response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Notifications paused for 2h",
      resumeAt: mockUser.notificationPauseExpiresAt,
    });
  });

  it("should return 400 if duration is not provided", async () => {
    req.body = {}; // No duration

    await notificationController.pauseNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Duration is required" });
    expect(userModel.findById).not.toHaveBeenCalled();
  });

  it("should return 400 if duration format is invalid", async () => {
    req.body = { duration: "invalid" };
    ms.mockReturnValue(0); // Invalid duration returns 0

    await notificationController.pauseNotifications(req, res);

    expect(ms).toHaveBeenCalledWith("invalid");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid duration format",
    });
    expect(userModel.findById).not.toHaveBeenCalled();
  });

  it("should return 404 if user is not found", async () => {
    userModel.findById = jest.fn().mockResolvedValue(null);

    await notificationController.pauseNotifications(req, res);

    expect(userModel.findById).toHaveBeenCalledWith("userId123");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should handle database errors", async () => {
    const error = new Error("Database error");
    userModel.findById = jest.fn().mockRejectedValue(error);

    await notificationController.pauseNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server Error",
      error,
    });
  });

  it("should handle save errors", async () => {
    const mockUser = {
      _id: "userId123",
      notificationPauseExpiresAt: null,
      save: jest.fn().mockRejectedValue(new Error("Save failed")),
    };

    userModel.findById = jest.fn().mockResolvedValue(mockUser);

    await notificationController.pauseNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server Error",
      error: expect.any(Error),
    });
  });
});

describe("resumeNotifications", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: { id: "userId123" },
    };
    res = mockRes();
  });

  it("should resume notifications by setting expiration to null", async () => {
    // Mock user with paused notifications
    const mockUser = {
      _id: "userId123",
      notificationPauseExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      save: jest.fn().mockResolvedValue(true),
    };

    userModel.findById = jest.fn().mockResolvedValue(mockUser);

    await notificationController.resumeNotifications(req, res);

    // Verify user was found
    expect(userModel.findById).toHaveBeenCalledWith("userId123");

    // Verify expiration was set to null
    expect(mockUser.notificationPauseExpiresAt).toBeNull();

    // Verify save was called
    expect(mockUser.save).toHaveBeenCalled();

    // Verify response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Notifications resumed" });
  });

  it("should return 404 if user is not found", async () => {
    userModel.findById = jest.fn().mockResolvedValue(null);

    await notificationController.resumeNotifications(req, res);

    expect(userModel.findById).toHaveBeenCalledWith("userId123");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should handle database errors", async () => {
    const error = new Error("Database error");
    userModel.findById = jest.fn().mockRejectedValue(error);

    await notificationController.resumeNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server Error",
      error,
    });
  });

  it("should handle save errors", async () => {
    const mockUser = {
      _id: "userId123",
      notificationPauseExpiresAt: new Date(),
      save: jest.fn().mockRejectedValue(new Error("Save failed")),
    };

    userModel.findById = jest.fn().mockResolvedValue(mockUser);

    await notificationController.resumeNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server Error",
      error: expect.any(Error),
    });
  });
});

describe("deleteNotification", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: { id: "userId123" },
      params: { id: "notification123" },
    };
    res = mockRes();
  });

  it("should mark a notification as deleted", async () => {
    // Mock notification
    const mockNotification = {
      _id: "notification123",
      to: {
        toString: () => "userId123", // User ID matches the requester
      },
      isDeleted: false,
      save: jest.fn().mockResolvedValue(true),
    };

    Notification.findById = jest.fn().mockResolvedValue(mockNotification);

    await notificationController.deleteNotification(req, res);

    // Verify notification was found
    expect(Notification.findById).toHaveBeenCalledWith("notification123");

    // Verify isDeleted was set to true
    expect(mockNotification.isDeleted).toBe(true);

    // Verify save was called
    expect(mockNotification.save).toHaveBeenCalled();

    // Verify response
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledWith({ message: "Notification deleted" });
  });

  it("should return 404 if notification is not found", async () => {
    Notification.findById = jest.fn().mockResolvedValue(null);

    await notificationController.deleteNotification(req, res);

    expect(Notification.findById).toHaveBeenCalledWith("notification123");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Notification not found",
    });
  });

  it("should return 404 if notification is already deleted", async () => {
    const mockNotification = {
      _id: "notification123",
      to: {
        toString: () => "userId123",
      },
      isDeleted: true, // Already deleted
      save: jest.fn(),
    };

    Notification.findById = jest.fn().mockResolvedValue(mockNotification);

    await notificationController.deleteNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Notification not found",
    });
    expect(mockNotification.save).not.toHaveBeenCalled();
  });

  it("should return 403 if user is not authorized", async () => {
    const mockNotification = {
      _id: "notification123",
      to: {
        toString: () => "differentUserId", // Different user ID
      },
      isDeleted: false,
      save: jest.fn(),
    };

    Notification.findById = jest.fn().mockResolvedValue(mockNotification);

    await notificationController.deleteNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized to delete this notification",
    });
    expect(mockNotification.save).not.toHaveBeenCalled();
  });

  it("should handle database errors", async () => {
    const error = new Error("Database error");
    Notification.findById = jest.fn().mockRejectedValue(error);

    await notificationController.deleteNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server Error",
      error,
    });
  });
});

describe("restoreNotification", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: { id: "userId123" },
      params: { id: "notification123" },
    };
    res = mockRes();
  });

  it("should restore a deleted notification", async () => {
    // Mock a deleted notification
    const mockNotification = {
      _id: "notification123",
      to: {
        toString: () => "userId123", // User ID matches the requester
      },
      isDeleted: true,
      save: jest.fn().mockResolvedValue(true),
    };

    Notification.findById = jest.fn().mockResolvedValue(mockNotification);

    await notificationController.restoreNotification(req, res);

    // Verify notification was found
    expect(Notification.findById).toHaveBeenCalledWith("notification123");

    // Verify isDeleted was set to false
    expect(mockNotification.isDeleted).toBe(false);

    // Verify save was called
    expect(mockNotification.save).toHaveBeenCalled();

    // Verify response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Notification restored" });
  });

  it("should return 404 if notification is not found", async () => {
    Notification.findById = jest.fn().mockResolvedValue(null);

    await notificationController.restoreNotification(req, res);

    expect(Notification.findById).toHaveBeenCalledWith("notification123");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Notification not found",
    });
  });

  it("should return 400 if notification is not deleted", async () => {
    const mockNotification = {
      _id: "notification123",
      to: {
        toString: () => "userId123",
      },
      isDeleted: false, // Not deleted
      save: jest.fn(),
    };

    Notification.findById = jest.fn().mockResolvedValue(mockNotification);

    await notificationController.restoreNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Notification is not deleted",
    });
    expect(mockNotification.save).not.toHaveBeenCalled();
  });

  it("should return 403 if user is not authorized", async () => {
    const mockNotification = {
      _id: "notification123",
      to: {
        toString: () => "differentUserId", // Different user ID
      },
      isDeleted: true,
      save: jest.fn(),
    };

    Notification.findById = jest.fn().mockResolvedValue(mockNotification);

    await notificationController.restoreNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized to restore this notification",
    });
    expect(mockNotification.save).not.toHaveBeenCalled();
  });

  it("should handle database errors", async () => {
    const error = new Error("Database error");
    Notification.findById = jest.fn().mockRejectedValue(error);

    await notificationController.restoreNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server Error",
      error,
    });
  });

  it("should handle save errors", async () => {
    const saveError = new Error("Save failed");
    const mockNotification = {
      _id: "notification123",
      to: {
        toString: () => "userId123",
      },
      isDeleted: true,
      save: jest.fn().mockRejectedValue(saveError),
    };

    Notification.findById = jest.fn().mockResolvedValue(mockNotification);

    await notificationController.restoreNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server Error",
      error: saveError,
    });
  });
});
