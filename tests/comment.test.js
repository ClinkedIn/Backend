const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const {
  addComment,
  updateComment,
  getComment,
  getPostComments,
  deleteComment,
  getCommentReplies,
  likeComment,
  unlikeComment,
  getCommentImpressions,
} = require("../controllers/commentController");

// Set up mocks
jest.mock("../models/commentModel");
jest.mock("../models/postModel");
jest.mock("../models/userModel");
jest.mock("../models/impressionModel");
jest.mock("../models/notificationModel");
jest.mock("../utils/cloudinaryUpload");
jest.mock("../utils/Notification");

// Import models after mocking
const commentModel = require("../models/commentModel");
const postModel = require("../models/postModel");
const userModel = require("../models/userModel");
const impressionModel = require("../models/impressionModel");
const notificationModel = require("../models/notificationModel");
const { uploadFile } = require("../utils/cloudinaryUpload");
const { sendNotification } = require("../utils/Notification");

// Setup express app for testing
const app = express();
app.use(express.json());

// Mock authentication middleware
const mockVerifyToken = (req, res, next) => {
  req.user = {
    id: "cc81c18d6b9fc1b83e2bebe3",
    firstName: "Jane",
    lastName: "Doe",
    headline: "Software Engineer",
    profilePicture: "profile.jpg",
    connections: ["user123", "user456"],
  };
  next();
};

// Set up test routes
app.post("/posts/:postId/comments", mockVerifyToken, addComment);
app.put("/comments/:commentId", mockVerifyToken, updateComment);
app.get("/comments/:commentId", mockVerifyToken, getComment);
app.get("/posts/:postId/comments", mockVerifyToken, getPostComments);
app.delete("/comments/:commentId", mockVerifyToken, deleteComment);
app.get("/comments/:commentId/replies", mockVerifyToken, getCommentReplies);
app.post("/comments/:commentId/like", mockVerifyToken, likeComment);
app.delete("/comments/:commentId/like", mockVerifyToken, unlikeComment);
app.get(
  "/comments/:commentId/impressions",
  mockVerifyToken,
  getCommentImpressions
);

describe("Comment Controller Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests for addComment
  describe("POST /posts/:postId/comments - Add Comment", () => {
    test("should successfully add a comment to a post", async () => {
      // Mock post
      const mockPost = {
        _id: "post123",
        userId: "user456",
        description: "Test post content",
        commentSetting: "anyone",
      };

      // Mock post owner
      const mockPostOwner = {
        _id: "user456",
        firstName: "Post",
        lastName: "Owner",
        blockedUsers: [],
      };

      // Mock current user
      const mockUser = {
        _id: "cc81c18d6b9fc1b83e2bebe3",
        firstName: "Jane",
        lastName: "Doe",
        blockedUsers: [],
        connections: [],
      };

      // Create the commentObj that matches what your controller is constructing
      const commentObj = {
        _id: "comment789",
        userId: "cc81c18d6b9fc1b83e2bebe3",
        postId: "post123",
        commentContent: "This is a test comment",
        createdAt: new Date(),
      };

      // This is what's going to be returned in response.body.comment
      const commentResponse = {
        ...commentObj,
        firstName: "Jane",
        lastName: "Doe",
        headline: "Software Engineer",
        profilePicture: "profile.jpg",
      };

      // Mock the Comment model with proper save method
      const mockComment = {
        _id: "comment789",
        userId: "cc81c18d6b9fc1b83e2bebe3",
        postId: "post123",
        commentContent: "This is a test comment",
        toObject: () => commentObj,
        save: jest.fn().mockResolvedValue(true),
      };

      // Set up mocks
      postModel.findById.mockResolvedValue(mockPost);
      userModel.findById.mockImplementation((id) => {
        if (id === "user456") return mockPostOwner;
        return mockUser;
      });

      // Mock Comment constructor
      commentModel.prototype.save = jest.fn().mockResolvedValue(mockComment);

      // Explicitly mock the behavior when the controller constructs the response
      commentModel.prototype.toObject = jest.fn().mockReturnValue(commentObj);

      postModel.findByIdAndUpdate.mockResolvedValue({
        ...mockPost,
        commentCount: 1,
      });
      sendNotification.mockResolvedValue(true);

      const response = await request(app).post("/posts/post123/comments").send({
        postId: "post123",
        commentContent: "This is a test comment",
      });

      // The fix is here: Looking at the controller, we can see it uses the following structure
      // in the response:
      // { message, id, comment: { ...commentResponse } }
      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Comment added successfully");

      // The test should verify what's actually returned in response.body.comment
      expect(response.body).toHaveProperty("comment");
      expect(response.body.comment).toHaveProperty("firstName", "Jane");
      expect(response.body.comment).toHaveProperty("lastName", "Doe");
      expect(response.body.comment).toHaveProperty(
        "headline",
        "Software Engineer"
      );
      expect(response.body.comment).toHaveProperty(
        "profilePicture",
        "profile.jpg"
      );
      expect(response.body.comment).toHaveProperty(
        "commentContent",
        "This is a test comment"
      );

      // Verify post comment count was updated
      expect(postModel.findByIdAndUpdate).toHaveBeenCalledWith("post123", {
        $inc: { commentCount: 1 },
      });

      // Verify notification was sent
      expect(sendNotification).toHaveBeenCalled();
    });

    test("should return 400 if comment content is missing", async () => {
      const response = await request(app)
        .post("/posts/post123/comments")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Post ID and comment content are required"
      );

      // Verify no database operations were performed
      expect(commentModel.prototype.save).not.toHaveBeenCalled();
      expect(postModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test("should return 403 if user is blocked by post owner", async () => {
      // Mock post
      const mockPost = {
        _id: "post123",
        userId: "user456",
        description: "Test post content",
        commentSetting: "anyone", // Make sure this is set to allow comments in general
      };

      // Mock post owner with current user blocked
      const mockPostOwner = {
        _id: "user456",
        firstName: "Post",
        lastName: "Owner",
        blockedUsers: ["cc81c18d6b9fc1b83e2bebe3"], // Current user is blocked
      };

      // Mock current user
      const mockCurrentUser = {
        _id: "cc81c18d6b9fc1b83e2bebe3",
        firstName: "Jane",
        lastName: "Doe",
        blockedUsers: [],
        connections: [], // Make sure this is defined
      };

      // Set up mocks
      postModel.findById.mockResolvedValue(mockPost);
      userModel.findById.mockImplementation((id) => {
        if (id === "user456") return mockPostOwner;
        if (id === "cc81c18d6b9fc1b83e2bebe3") return mockCurrentUser;
        return null;
      });

      const response = await request(app).post("/posts/post123/comments").send({
        postId: "post123", // Explicitly include postId in the request body
        commentContent: "This should be blocked",
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("You can't comment on this post");

      // Verify no comment was saved
      expect(commentModel.prototype.save).not.toHaveBeenCalled();
    });
  });

  // Tests for updateComment
  describe("PUT /comments/:commentId - Update Comment", () => {
    test("should successfully update a comment", async () => {
      // Mock existing comment owned by current user
      const mockComment = {
        _id: "comment123",
        userId: "cc81c18d6b9fc1b83e2bebe3", // Matches req.user.id
        postId: "post456",
        commentContent: "Original comment",
        taggedUsers: [],
        save: jest.fn().mockResolvedValue(true),
        toObject: () => ({
          _id: "comment123",
          userId: "cc81c18d6b9fc1b83e2bebe3",
          postId: "post456",
          commentContent: "Updated comment content",
          taggedUsers: [
            { userId: "user789", firstName: "Tagged", lastName: "User" },
          ],
        }),
      };

      // Set up mocks
      commentModel.findById.mockResolvedValue(mockComment);

      const response = await request(app)
        .put("/comments/comment123")
        .send({
          commentContent: "Updated comment content",
          taggedUsers: [
            { userId: "user789", firstName: "Tagged", lastName: "User" },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Comment updated successfully");
      expect(response.body.comment.commentContent).toBe(
        "Updated comment content"
      );

      // Verify comment was updated
      expect(mockComment.commentContent).toBe("Updated comment content");
      expect(mockComment.save).toHaveBeenCalled();
    });

    test("should return 403 if user is not the comment owner", async () => {
      // Mock comment owned by another user
      const mockComment = {
        _id: "comment123",
        userId: "anotherUser789", // Different from req.user.id
        postId: "post456",
        commentContent: "Not your comment",
        taggedUsers: [],
      };

      // Set up mocks
      commentModel.findById.mockResolvedValue(mockComment);

      const response = await request(app)
        .put("/comments/comment123")
        .send({ commentContent: "Trying to update someone else's comment" });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("You can only edit your own comments");
    });

    test("should return 404 if comment is not found", async () => {
      // Mock comment not found
      commentModel.findById.mockResolvedValue(null);

      const response = await request(app)
        .put("/comments/nonexistentcomment")
        .send({ commentContent: "Update attempt on non-existent comment" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Comment not found");
    });
  });

  // Tests for getComment
  describe("GET /comments/:commentId - Get Comment", () => {
    test("should successfully return a comment", async () => {
      // Mock comment
      const mockComment = {
        _id: "comment123",
        userId: "user456",
        postId: "post789",
        commentContent: "Test comment content",
        isActive: true,
        createdAt: new Date(),
        toObject: () => ({
          _id: "comment123",
          userId: "user456",
          postId: "post789",
          commentContent: "Test comment content",
          isActive: true,
          createdAt: new Date(),
        }),
      };

      // Mock comment author
      const mockUser = {
        _id: "user456",
        firstName: "Comment",
        lastName: "Author",
        headline: "Developer",
        profilePicture: "author_profile.jpg",
      };

      // Set up mocks
      commentModel.findById.mockResolvedValue(mockComment);
      userModel.findById.mockResolvedValue(mockUser);

      const response = await request(app).get("/comments/comment123");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Comment retrieved successfully");
      expect(response.body.comment).toHaveProperty(
        "commentContent",
        "Test comment content"
      );
      expect(response.body.comment).toHaveProperty("firstName", "Comment");
      expect(response.body.comment).toHaveProperty("lastName", "Author");
    });

    test("should return 404 if comment is not found", async () => {
      // Mock comment not found
      commentModel.findById.mockResolvedValue(null);

      const response = await request(app).get("/comments/nonexistentcomment");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Comment not found");
    });

    test("should return 404 if comment is inactive", async () => {
      // Mock inactive comment
      const mockComment = {
        _id: "comment123",
        userId: "user456",
        postId: "post789",
        commentContent: "This comment has been removed",
        isActive: false,
      };

      // Set up mock
      commentModel.findById.mockResolvedValue(mockComment);

      const response = await request(app).get("/comments/comment123");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Comment not found");
    });
  });

  // Tests for getPostComments
  describe("GET /posts/:postId/comments - Get Post Comments", () => {

    test("should return 403 if user is blocked by post owner", async () => {
      // Mock post
      const mockPost = {
        _id: "post123",
        userId: "user456",
        description: "Test post",
        commentSetting: "anyone",
      };

      // Mock current user
      const mockUser = {
        _id: "cc81c18d6b9fc1b83e2bebe3",
        connections: [],
        blockedUsers: [],
      };

      // Mock post owner who blocked current user
      const mockPostOwner = {
        _id: "user456",
        blockedUsers: ["cc81c18d6b9fc1b83e2bebe3"], // Current user is blocked
      };

      // Set up mocks
      postModel.findById.mockResolvedValue(mockPost);
      userModel.findById.mockImplementation((id) => {
        if (id === "user456") return mockPostOwner;
        return mockUser;
      });

      const response = await request(app).get("/posts/post123/comments");

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        "You can't view comments on this post"
      );

      // Verify no comments were fetched
      expect(commentModel.find).not.toHaveBeenCalled();
    });
  });

  // Tests for deleteComment
  describe("DELETE /comments/:commentId - Delete Comment", () => {
    test("should successfully delete a comment", async () => {
      // Mock comment owned by current user
      const mockComment = {
        _id: "comment123",
        userId: "cc81c18d6b9fc1b83e2bebe3", // Matches req.user.id
        postId: "post456",
        commentContent: "Comment to be deleted",
        isActive: true,
        parentComment: null,
        save: jest.fn().mockResolvedValue(true),
        toString: () => "cc81c18d6b9fc1b83e2bebe3",
      };

      // Set up mocks
      commentModel.findById.mockResolvedValue(mockComment);
      postModel.findByIdAndUpdate.mockResolvedValue({ commentCount: 5 });
      notificationModel.findOneAndDelete.mockResolvedValue(true);

      const response = await request(app).delete("/comments/comment123");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Comment deleted successfully");

      // Verify comment was marked as inactive
      expect(mockComment.isActive).toBe(false);
      expect(mockComment.save).toHaveBeenCalled();

      // Verify post comment count was decremented
      expect(postModel.findByIdAndUpdate).toHaveBeenCalledWith("post456", {
        $inc: { commentCount: -1 },
      });

      // Verify notification was deleted
      expect(notificationModel.findOneAndDelete).toHaveBeenCalled();
    });

    test("should return 403 if user is not the comment owner", async () => {
      // Mock comment owned by someone else
      const mockComment = {
        _id: "comment123",
        userId: "anotherUser789", // Different from req.user.id
        toString: () => "anotherUser789",
        postId: "post456",
        commentContent: "Not your comment to delete",
        isActive: true,
      };

      // Set up mocks
      commentModel.findById.mockResolvedValue(mockComment);

      const response = await request(app).delete("/comments/comment123");

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        "You can only delete your own comments"
      );

      // Verify nothing was updated
      expect(postModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test("should return 404 if comment is not found", async () => {
      // Mock comment not found
      commentModel.findById.mockResolvedValue(null);

      const response = await request(app).delete(
        "/comments/nonexistentcomment"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Comment not found");
    });
  });

  // Tests for getCommentReplies
  describe("GET /comments/:commentId/replies - Get Comment Replies", () => {
    test("should return 404 if parent comment is not found", async () => {
      // Mock parent comment not found
      commentModel.findById.mockResolvedValue(null);

      const response = await request(app).get(
        "/comments/nonexistentcomment/replies"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Comment not found");

      // Verify no replies were fetched
      expect(commentModel.find).not.toHaveBeenCalled();
    });

    test("should return 404 if parent comment is inactive", async () => {
      // Mock inactive parent comment
      const mockParentComment = {
        _id: "comment123",
        userId: "user456",
        postId: "post789",
        commentContent: "Deleted comment",
        isActive: false,
      };

      // Set up mocks
      commentModel.findById.mockResolvedValue(mockParentComment);

      const response = await request(app).get("/comments/comment123/replies");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Comment not found");

      // Verify no replies were fetched
      expect(commentModel.find).not.toHaveBeenCalled();
    });
  });

  // Tests for likeComment
  describe("POST /comments/:commentId/like - Like Comment", () => {
    test("should successfully add a new impression to a comment", async () => {
      // Mock active comment
      const mockComment = {
        _id: "comment123",
        userId: "user456",
        postId: "post789",
        commentContent: "Test comment",
        isActive: true,
        impressionCounts: { like: 5, total: 5 },
        impressions: ["oldImpression1", "oldImpression2"],
      };

      // Mock new impression
      const mockNewImpression = {
        _id: "impression789",
        targetId: "comment123",
        targetType: "Comment",
        userId: "cc81c18d6b9fc1b83e2bebe3",
        type: "celebrate",
        isActive: true,
        createdAt: new Date(),
      };

      // Mock updated comment
      const mockUpdatedComment = {
        ...mockComment,
        impressionCounts: {
          like: 5,
          celebrate: 1,
          total: 6,
        },
        impressions: [...mockComment.impressions, "impression789"],
      };

      // Set up mocks
      commentModel.findOne.mockResolvedValue(mockComment);
      impressionModel.findOne.mockResolvedValue(null); // No existing impression
      impressionModel.create.mockResolvedValue(mockNewImpression);
      commentModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedComment);
      userModel.findById.mockImplementation((id) => {
        if (id === "user456")
          return { firstName: "Comment", lastName: "Owner" };
        return { firstName: "Jane", lastName: "Doe" };
      });
      sendNotification.mockResolvedValue(true);

      const response = await request(app)
        .post("/comments/comment123/like")
        .send({ impressionType: "celebrate" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Comment celebrated successfully");
      expect(response.body.impressionCounts).toEqual(
        mockUpdatedComment.impressionCounts
      );

      // Verify impression was created correctly
      expect(impressionModel.create).toHaveBeenCalledWith({
        targetId: "comment123",
        targetType: "Comment",
        userId: "cc81c18d6b9fc1b83e2bebe3",
        type: "celebrate",
        isActive: true,
      });

      // Verify comment counts were updated
      expect(commentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "comment123",
        {
          "impressionCounts.celebrate": 1,
          "impressionCounts.total": 6,
          impressions: expect.arrayContaining(["impression789"]),
        },
        { new: true }
      );

      // Verify notification was sent
      expect(sendNotification).toHaveBeenCalled();
    });

    test("should update impression type when user changes their reaction", async () => {
      // Mock active comment
      const mockComment = {
        _id: "comment123",
        userId: "user456",
        postId: "post789",
        commentContent: "Test comment",
        isActive: true,
        impressionCounts: { like: 5, funny: 2, total: 7 },
      };

      // Mock existing impression
      const mockExistingImpression = {
        _id: "impression789",
        targetId: "comment123",
        targetType: "Comment",
        userId: "cc81c18d6b9fc1b83e2bebe3",
        type: "like",
        save: jest.fn().mockResolvedValue(true),
      };

      // Mock updated comment
      const mockUpdatedComment = {
        ...mockComment,
        impressionCounts: {
          like: 4,
          funny: 3,
          total: 7,
        },
      };

      // Set up mocks
      commentModel.findOne.mockResolvedValue(mockComment);
      impressionModel.findOne.mockResolvedValue(mockExistingImpression);
      commentModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedComment);
      notificationModel.findOneAndDelete.mockResolvedValue(true);
      sendNotification.mockResolvedValue(true);

      const response = await request(app)
        .post("/comments/comment123/like")
        .send({ impressionType: "funny" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "Impression changed from like to funny"
      );
      expect(response.body.impressionCounts).toEqual(
        mockUpdatedComment.impressionCounts
      );

      // Verify impression type was updated
      expect(mockExistingImpression.type).toBe("funny");
      expect(mockExistingImpression.save).toHaveBeenCalled();

      // Verify comment counts were updated
      expect(commentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "comment123",
        {
          "impressionCounts.like": 4,
          "impressionCounts.funny": 3,
        },
        { new: true }
      );

      // Verify old notification was deleted and new one created
      expect(notificationModel.findOneAndDelete).toHaveBeenCalled();
      expect(sendNotification).toHaveBeenCalled();
    });

    test("should return 400 if user tries to add same impression type again", async () => {
      // Mock active comment
      const mockComment = {
        _id: "comment123",
        userId: "user456",
        postId: "post789",
        commentContent: "Test comment",
        isActive: true,
        impressionCounts: { insightful: 3, total: 3 },
      };

      // Mock existing impression with same type
      const mockExistingImpression = {
        _id: "impression789",
        targetId: "comment123",
        targetType: "Comment",
        userId: "cc81c18d6b9fc1b83e2bebe3",
        type: "insightful",
      };

      // Set up mocks
      commentModel.findOne.mockResolvedValue(mockComment);
      impressionModel.findOne.mockResolvedValue(mockExistingImpression);

      const response = await request(app)
        .post("/comments/comment123/like")
        .send({ impressionType: "insightful" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "You have already insightfuld this comment"
      );

      // Verify no updates were made
      expect(commentModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  // Tests for unlikeComment
  describe("DELETE /comments/:commentId/like - Unlike Comment", () => {
    test("should successfully remove an impression from a comment", async () => {
      // Mock active comment
      const mockComment = {
        _id: "comment123",
        userId: "user456",
        postId: "post789",
        commentContent: "Test comment",
        isActive: true,
        impressionCounts: { like: 5, total: 5 },
        impressions: ["impression789", "otherImpression"],
      };

      // Mock existing impression
      const mockExistingImpression = {
        _id: "impression789",
        targetId: "comment123",
        targetType: "Comment",
        userId: "cc81c18d6b9fc1b83e2bebe3",
        type: "like",
      };

      // Mock updated comment
      const mockUpdatedComment = {
        ...mockComment,
        impressionCounts: {
          like: 4,
          total: 4,
        },
        impressions: ["otherImpression"],
      };

      // Set up mocks
      commentModel.findOne.mockResolvedValue(mockComment);
      impressionModel.findOne.mockResolvedValue(mockExistingImpression);
      impressionModel.findByIdAndDelete.mockResolvedValue(
        mockExistingImpression
      );
      notificationModel.findOneAndDelete.mockResolvedValue(true);
      commentModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedComment);

      const response = await request(app).delete("/comments/comment123/like");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Comment like removed successfully");
      expect(response.body.impressionCounts).toEqual(
        mockUpdatedComment.impressionCounts
      );

      // Verify impression was deleted
      expect(impressionModel.findByIdAndDelete).toHaveBeenCalledWith(
        "impression789"
      );

      // Verify notification was deleted
      expect(notificationModel.findOneAndDelete).toHaveBeenCalledWith({
        resourceId: "impression789",
      });

      // Verify comment counts were updated
      expect(commentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "comment123",
        {
          "impressionCounts.like": 4,
          "impressionCounts.total": 4,
          impressions: ["otherImpression"],
        },
        { new: true }
      );
    });

    test("should return 400 if user has not reacted to the comment", async () => {
      // Mock active comment
      const mockComment = {
        _id: "comment123",
        userId: "user456",
        postId: "post789",
        commentContent: "Test comment",
        isActive: true,
        impressionCounts: { like: 5, total: 5 },
      };

      // Set up mocks
      commentModel.findOne.mockResolvedValue(mockComment);
      impressionModel.findOne.mockResolvedValue(null); // No existing impression

      const response = await request(app).delete("/comments/comment123/like");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "You have not reacted to this comment"
      );

      // Verify no updates were made
      expect(impressionModel.findByIdAndDelete).not.toHaveBeenCalled();
      expect(commentModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test("should return 404 if comment is not found or inactive", async () => {
      // Mock comment not found
      commentModel.findOne.mockResolvedValue(null);

      const response = await request(app).delete(
        "/comments/nonexistentcomment/like"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Comment not found or inactive");

      // Verify no impression lookup or updates were made
      expect(impressionModel.findOne).not.toHaveBeenCalled();
    });
  });

  // Tests for getCommentImpressions
  describe("GET /comments/:commentId/impressions - Get Comment Impressions", () => {
    test("should successfully return all impressions with pagination", async () => {
      // Mock active comment with impression counts
      const mockComment = {
        _id: "comment123",
        userId: "user456",
        postId: "post789",
        commentContent: "Test comment",
        isActive: true,
        impressionCounts: {
          like: 3,
          celebrate: 2,
          insightful: 1,
          total: 6,
        },
      };

      // Mock impressions
      const mockImpressions = [
        {
          _id: "impression1",
          targetId: "comment123",
          targetType: "Comment",
          userId: "user101",
          type: "like",
          createdAt: new Date("2025-04-10T10:00:00Z"),
        },
        {
          _id: "impression2",
          targetId: "comment123",
          targetType: "Comment",
          userId: "user202",
          type: "celebrate",
          createdAt: new Date("2025-04-10T09:30:00Z"),
        },
        {
          _id: "impression3",
          targetId: "comment123",
          targetType: "Comment",
          userId: "user303",
          type: "insightful",
          createdAt: new Date("2025-04-10T09:00:00Z"),
        },
      ];

      // Mock users who made impressions
      const mockUsers = [
        {
          _id: "user101",
          firstName: "First",
          lastName: "User",
          headline: "Developer",
          profilePicture: "profile1.jpg",
        },
        {
          _id: "user202",
          firstName: "Second",
          lastName: "User",
          headline: "Designer",
          profilePicture: "profile2.jpg",
        },
        {
          _id: "user303",
          firstName: "Third",
          lastName: "User",
          headline: "Manager",
          profilePicture: "profile3.jpg",
        },
      ];

      // Set up mocks
      commentModel.findOne.mockResolvedValue(mockComment);
      impressionModel.countDocuments.mockResolvedValue(6);
      impressionModel.find.mockImplementation(() => ({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockImpressions),
      }));
      userModel.find.mockResolvedValue(mockUsers);

      const response = await request(app).get(
        "/comments/comment123/impressions?page=1&limit=3"
      );

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Impressions retrieved successfully");
      expect(response.body.impressions).toHaveLength(3);

      // Verify first impression has correct structure
      expect(response.body.impressions[0]).toEqual({
        impressionId: "impression1",
        userId: "user101",
        type: "like",
        createdAt: expect.any(String),
        firstName: "First",
        lastName: "User",
        headline: "Developer",
        profilePicture: "profile1.jpg",
      });

      // Verify pagination and counts
      expect(response.body.pagination.totalImpressions).toBe(6);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.counts).toEqual({
        like: 3,
        support: 0,
        celebrate: 2,
        love: 0,
        insightful: 1,
        funny: 0,
        total: 6,
      });
    });

    test("should filter impressions by type when provided", async () => {
      // Mock active comment with impression counts
      const mockComment = {
        _id: "comment123",
        userId: "user456",
        postId: "post789",
        commentContent: "Test comment",
        isActive: true,
        impressionCounts: {
          like: 3,
          celebrate: 2,
          total: 5,
        },
      };

      // Mock filtered impressions (only likes)
      const mockLikeImpressions = [
        {
          _id: "impression1",
          targetId: "comment123",
          targetType: "Comment",
          userId: "user101",
          type: "like",
          createdAt: new Date(),
        },
        {
          _id: "impression2",
          targetId: "comment123",
          targetType: "Comment",
          userId: "user202",
          type: "like",
          createdAt: new Date(),
        },
      ];

      // Mock users who liked
      const mockUsers = [
        {
          _id: "user101",
          firstName: "First",
          lastName: "Liker",
          headline: "Developer",
          profilePicture: "profile1.jpg",
        },
        {
          _id: "user202",
          firstName: "Second",
          lastName: "Liker",
          headline: "Designer",
          profilePicture: "profile2.jpg",
        },
      ];

      // Set up mocks
      commentModel.findOne.mockResolvedValue(mockComment);
      impressionModel.countDocuments.mockResolvedValue(3); // 3 likes total
      impressionModel.find.mockImplementation(() => ({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockLikeImpressions),
      }));
      userModel.find.mockResolvedValue(mockUsers);

      const response = await request(app).get(
        "/comments/comment123/impressions?type=like"
      );

      expect(response.status).toBe(200);
      expect(response.body.impressions).toHaveLength(2);
      expect(response.body.impressions[0].type).toBe("like");
      expect(response.body.impressions[1].type).toBe("like");

      // Verify correct query was used
      expect(impressionModel.find).toHaveBeenCalledWith({
        targetId: "comment123",
        targetType: "Comment",
        type: "like",
      });
    });

    test("should return 404 if comment is not found or inactive", async () => {
      // Mock comment not found
      commentModel.findOne.mockResolvedValue(null);

      const response = await request(app).get(
        "/comments/nonexistentcomment/impressions"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Comment not found or inactive");

      // Verify no impressions were fetched
      expect(impressionModel.countDocuments).not.toHaveBeenCalled();
      expect(impressionModel.find).not.toHaveBeenCalled();
    });
  });
});
