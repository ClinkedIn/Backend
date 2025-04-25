const { sendNotification } = require("../utils/Notification");
const Notification = require("../models/notificationModel");
const userModel = require("../models/userModel");
const commentModel = require("../models/commentModel");
const admin = require("../utils/firebase");
const { getMessaging } = require("firebase-admin/messaging");

// Mocks
jest.mock("../models/notificationModel");
jest.mock("../models/userModel");
jest.mock("../models/commentModel");
jest.mock("../utils/firebase");
jest.mock("firebase-admin/messaging");

describe("Notification Templates", () => {
  // Extract notificationTemplate for testing (from the original module)
  const originalModule = jest.requireActual("../utils/Notification");
  const notificationTemplate = originalModule.notificationTemplate;

  // Test each template function for correct output
  it("should generate correct reaction post notification message", () => {
    const sender = { firstName: "John", lastName: "Doe" };
    const message = notificationTemplate.reactionPost(sender, "like");

    expect(message).toEqual({
      body: "John Doe reacted with like to your post",
    });
  });

  it("should generate correct reaction comment notification message", () => {
    const sender = { firstName: "Jane", lastName: "Smith" };
    const message = notificationTemplate.reactionComment(sender, "love");

    expect(message).toEqual({
      body: "Jane Smith reacted with love to your comment",
    });
  });

  it("should generate correct comment notification message", () => {
    const sender = { firstName: "Alice", lastName: "Johnson" };
    const message = notificationTemplate.comment(sender);

    expect(message).toEqual({
      body: "Alice Johnson commented on your post",
    });
  });

  // Add tests for other templates...
  it("should generate correct follow notification message", () => {
    const sender = { firstName: "Bob", lastName: "Miller" };
    const message = notificationTemplate.follow(sender);

    expect(message).toEqual({
      body: "Bob Miller started following you",
    });
  });

  it("should generate correct connection request notification message", () => {
    const sender = { firstName: "Charlie", lastName: "Brown" };
    const message = notificationTemplate.connectionRequest(sender);

    expect(message).toEqual({
      body: "Charlie Brown sent you a connection request",
    });
  });
});

describe("generateMessage", () => {
  // Extract generateMessage for testing
  const originalModule = jest.requireActual("../utils/Notification");
  const generateMessage = originalModule.generateMessage;

  it("should generate post reaction message", () => {
    const sendingUser = { firstName: "John", lastName: "Doe" };
    const subject = "impression";
    const resource = { type: "like", targetType: "Post" };

    const message = generateMessage(sendingUser, subject, resource);

    expect(message).toEqual({
      body: "John Doe reacted with like to your post",
    });
  });

  it("should generate comment reaction message", () => {
    const sendingUser = { firstName: "Jane", lastName: "Smith" };
    const subject = "impression";
    const resource = { type: "love", targetType: "Comment" };

    const message = generateMessage(sendingUser, subject, resource);

    expect(message).toEqual({
      body: "Jane Smith reacted with love to your comment",
    });
  });

  it("should generate message for other notification types", () => {
    const sendingUser = { firstName: "Alice", lastName: "Johnson" };
    const subject = "follow";
    const resource = {};

    const message = generateMessage(sendingUser, subject, resource);

    expect(message).toEqual({
      body: "Alice Johnson started following you",
    });
  });
});

describe("buildNotificationData", () => {
  // Extract buildNotificationData for testing
  const originalModule = jest.requireActual("../utils/Notification");
  const buildNotificationData = originalModule.buildNotificationData;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should build data for post impression notification", async () => {
    const sendingUser = { id: "sender123" };
    const receivingUser = { id: "receiver456" };
    const subject = "impression";
    const resource = {
      id: "resource789",
      targetType: "Post",
      targetId: "post123",
    };

    const result = await buildNotificationData(
      sendingUser,
      receivingUser,
      subject,
      resource
    );

    expect(result).toEqual({
      from: "sender123",
      to: "receiver456",
      subject: "impression",
      content: "",
      resourceId: "resource789",
      relatedPostId: "post123",
    });
  });

  it("should build data for comment impression notification", async () => {
    const sendingUser = { id: "sender123" };
    const receivingUser = { id: "receiver456" };
    const subject = "impression";
    const resource = {
      id: "resource789",
      targetType: "Comment",
      targetId: "comment123",
    };

    const mockComment = { _id: "comment123", postId: "post456" };
    commentModel.findById.mockResolvedValue(mockComment);

    const result = await buildNotificationData(
      sendingUser,
      receivingUser,
      subject,
      resource
    );

    expect(commentModel.findById).toHaveBeenCalledWith("comment123");
    expect(result).toEqual({
      from: "sender123",
      to: "receiver456",
      subject: "impression",
      content: "",
      resourceId: "resource789",
      relatedPostId: "post456",
      relatedCommentId: "comment123",
    });
  });

  it("should return null if comment not found", async () => {
    const sendingUser = { id: "sender123" };
    const receivingUser = { id: "receiver456" };
    const subject = "impression";
    const resource = {
      id: "resource789",
      targetType: "Comment",
      targetId: "comment123",
    };

    commentModel.findById.mockResolvedValue(null);

    const result = await buildNotificationData(
      sendingUser,
      receivingUser,
      subject,
      resource
    );

    expect(commentModel.findById).toHaveBeenCalledWith("comment123");
    expect(result).toBeNull();
  });

  it("should build data for comment notification", async () => {
    const sendingUser = { id: "sender123" };
    const receivingUser = { id: "receiver456" };
    const subject = "comment";
    const resource = {
      id: "resource789",
      postId: "post123",
    };

    const result = await buildNotificationData(
      sendingUser,
      receivingUser,
      subject,
      resource
    );

    expect(result).toEqual({
      from: "sender123",
      to: "receiver456",
      subject: "comment",
      content: "",
      resourceId: "resource789",
      relatedPostId: "post123",
    });
  });

  it("should build data for message notification", async () => {
    const sendingUser = { id: "sender123" };
    const receivingUser = { id: "receiver456" };
    const subject = "message";
    const resource = {
      id: "resource789",
      chatId: { toHexString: () => "chat123" },
    };

    const result = await buildNotificationData(
      sendingUser,
      receivingUser,
      subject,
      resource
    );

    expect(result).toEqual({
      from: "sender123",
      to: "receiver456",
      subject: "message",
      content: "",
      resourceId: "resource789",
      relatedChatId: "chat123",
    });
  });
});

describe("sendNotification", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock getMessaging
    const mockMessaging = {
      sendEachForMulticast: jest.fn().mockResolvedValue({
        failureCount: 0,
        responses: [{ success: true }],
      }),
    };
    getMessaging.mockReturnValue(mockMessaging);
  });

  it("should not send notification to self", async () => {
    const user = {
      id: "user123",
      firstName: "John",
      lastName: "Doe",
    };

    const resource = { id: "resource123" };

    await sendNotification(user, user, "follow", resource);

    expect(userModel.findById).not.toHaveBeenCalled();
    expect(Notification.create).not.toHaveBeenCalled();
  });

  it("should handle user not found", async () => {
    const sendingUser = {
      id: "sender123",
      firstName: "John",
      lastName: "Doe",
    };

    const receivingUser = {
      id: "receiver456",
      firstName: "Jane",
      lastName: "Smith",
    };

    const resource = { id: "resource123" };

    userModel.findById.mockResolvedValue(null);

    await sendNotification(sendingUser, receivingUser, "follow", resource);

    expect(userModel.findById).toHaveBeenCalledWith("receiver456");
    expect(Notification.create).not.toHaveBeenCalled();
  });

  it("should create notification but not send FCM if notifications are paused", async () => {
    const sendingUser = {
      id: "sender123",
      firstName: "John",
      lastName: "Doe",
    };

    const receivingUser = {
      id: "receiver456",
      firstName: "Jane",
      lastName: "Smith",
    };

    const resource = { id: "resource123" };

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); // tomorrow

    const mockUser = {
      _id: "receiver456",
      notificationPauseExpiresAt: futureDate,
      fcmToken: ["token123"],
      save: jest.fn().mockResolvedValue(true),
    };

    userModel.findById.mockResolvedValue(mockUser);
    Notification.create.mockResolvedValue({ _id: "notif123" });

    await sendNotification(sendingUser, receivingUser, "follow", resource);

    expect(userModel.findById).toHaveBeenCalledWith("receiver456");
    expect(Notification.create).toHaveBeenCalled();
    expect(getMessaging().sendEachForMulticast).not.toHaveBeenCalled();
  });

  it("should create notification and send FCM if notifications are not paused", async () => {
    const sendingUser = {
      id: "sender123",
      firstName: "John",
      lastName: "Doe",
    };

    const receivingUser = {
      id: "receiver456",
      firstName: "Jane",
      lastName: "Smith",
    };

    const resource = { id: "resource123" };

    const mockUser = {
      _id: "receiver456",
      notificationPauseExpiresAt: null,
      fcmToken: ["token123"],
      save: jest.fn().mockResolvedValue(true),
    };

    userModel.findById.mockResolvedValue(mockUser);
    Notification.create.mockResolvedValue({ _id: "notif123" });

    await sendNotification(sendingUser, receivingUser, "follow", resource);

    expect(userModel.findById).toHaveBeenCalledWith("receiver456");
    expect(Notification.create).toHaveBeenCalled();

    const fcmMessage = {
      notification: { body: "John Doe started following you" },
      data: { subject: "follow", resourceId: "resource123" },
      tokens: ["token123"],
    };

    expect(getMessaging().sendEachForMulticast).toHaveBeenCalledWith(
      fcmMessage
    );
  });

  it("should clear expired notification pause", async () => {
    const sendingUser = {
      id: "sender123",
      firstName: "John",
      lastName: "Doe",
    };

    const receivingUser = {
      id: "receiver456",
      firstName: "Jane",
      lastName: "Smith",
    };

    const resource = { id: "resource123" };

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // yesterday

    const mockUser = {
      _id: "receiver456",
      notificationPauseExpiresAt: pastDate, // expired pause
      fcmToken: ["token123"],
      save: jest.fn().mockResolvedValue(true),
    };

    userModel.findById.mockResolvedValue(mockUser);
    Notification.create.mockResolvedValue({ _id: "notif123" });

    await sendNotification(sendingUser, receivingUser, "follow", resource);

    expect(mockUser.notificationPauseExpiresAt).toBeNull();
    expect(mockUser.save).toHaveBeenCalled();
    expect(getMessaging().sendEachForMulticast).toHaveBeenCalled();
  });

  it("should handle missing FCM tokens", async () => {
    const sendingUser = {
      id: "sender123",
      firstName: "John",
      lastName: "Doe",
    };

    const receivingUser = {
      id: "receiver456",
      firstName: "Jane",
      lastName: "Smith",
    };

    const resource = { id: "resource123" };

    const mockUser = {
      _id: "receiver456",
      notificationPauseExpiresAt: null,
      fcmToken: [], // empty token array
      save: jest.fn().mockResolvedValue(true),
    };

    userModel.findById.mockResolvedValue(mockUser);
    Notification.create.mockResolvedValue({ _id: "notif123" });

    await sendNotification(sendingUser, receivingUser, "follow", resource);

    expect(Notification.create).toHaveBeenCalled();
    expect(getMessaging().sendEachForMulticast).not.toHaveBeenCalled();
  });

  it("should handle FCM send failures", async () => {
    const sendingUser = {
      id: "sender123",
      firstName: "John",
      lastName: "Doe",
    };

    const receivingUser = {
      id: "receiver456",
      firstName: "Jane",
      lastName: "Smith",
    };

    const resource = { id: "resource123" };

    const mockUser = {
      _id: "receiver456",
      notificationPauseExpiresAt: null,
      fcmToken: ["token123", "token456"],
      save: jest.fn().mockResolvedValue(true),
    };

    // Mock FCM failure
    getMessaging().sendEachForMulticast.mockResolvedValue({
      failureCount: 1,
      responses: [
        { success: true },
        { success: false, error: { code: "messaging/invalid-token" } },
      ],
    });

    userModel.findById.mockResolvedValue(mockUser);
    Notification.create.mockResolvedValue({ _id: "notif123" });

    // Spy on console.log
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    await sendNotification(sendingUser, receivingUser, "follow", resource);

    expect(Notification.create).toHaveBeenCalled();
    expect(getMessaging().sendEachForMulticast).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "List of tokens that caused failures:",
      ["token456"]
    );

    consoleSpy.mockRestore();
  });

  it("should handle errors during notification creation", async () => {
    const sendingUser = {
      id: "sender123",
      firstName: "John",
      lastName: "Doe",
    };

    const receivingUser = {
      id: "receiver456",
      firstName: "Jane",
      lastName: "Smith",
    };

    const resource = { id: "resource123" };

    userModel.findById.mockResolvedValue({
      _id: "receiver456",
      fcmToken: ["token123"],
    });

    // Force an error during notification creation
    const error = new Error("Database error");
    Notification.create.mockRejectedValue(error);

    // Spy on console.error
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    await sendNotification(sendingUser, receivingUser, "follow", resource);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error creating notification:",
      error
    );

    consoleSpy.mockRestore();
  });
});
