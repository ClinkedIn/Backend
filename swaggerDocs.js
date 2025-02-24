/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique ID of the post
 *         userId:
 *           type: string
 *           description: ID of the user who created the post
 *         description:
 *           type: string
 *           description: Text content of the post
 *         attachments:
 *           type: array
 *           description: List of media attachments (image/video URLs)
 *           items:
 *             type: string
 *         taggedUsers:
 *           type: array
 *           description: List of user IDs tagged in the post
 *           items:
 *             type: string
 *         isActive:
 *           type: boolean
 *           description: Indicates if the post is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the post was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the post was last updated
 * 
 *   requestBodies:
 *     CreatePostRequest:
 *       description: Request body for creating a new post
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               description:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *               taggedUsers:
 *                 type: array
 *                 items:
 *                   type: string
 */

/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: API endpoints for managing posts
 */

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     description: Add a new post to the platform
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreatePostRequest'
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request, invalid input
 *       500:
 *         description: Internal server error
 * 
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     description: Retrieve all posts
 *     responses:
 *       200:
 *         description: List of posts retrieved successfully
 *         content:
 *           application/json:
 *            schema:
 *             type: array
 *             items:
 *              $ref: '#/components/schemas/Post'
 *       404:
 *        description: No posts found
 *       500:
 *        description: Internal server error
 */

/**
 * @swagger
 * /posts/{postId}:
 *   get:
 *     summary: Get a single post
 *     tags: [Posts]
 *     description: Retrieve a specific post by its ID
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     description: Modify an existing post by ID
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post updated successfully
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     description: Remove a post by its ID
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 */

/**
 * @swagger
 * /posts/{postId}/save:
 *   post:
 *     summary: Save a post
 *     tags: [Posts]
 *     description: Save a post to a user’s collection
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post saved successfully
 *   delete:
 *     summary: Unsave a post
 *     tags: [Posts]
 *     description: Remove a post from a user’s saved list
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post unsaved successfully
 */

/**
 * @swagger
 * /posts/{postId}/like:
 *   post:
 *     summary: Like a post
 *     tags: [Posts]
 *     description: Add a like to a post
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post liked successfully
 */

/**
 * @swagger
 * /posts/{postId}/like/{userId}:
 *   delete:
 *     summary: Unlike a post
 *     tags: [Posts]
 *     description: Remove a like from a post
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Post unliked successfully
 */

/**
 * @swagger
 * /posts/{postId}/comment:
 *   post:
 *     summary: Comment on a post
 *     tags: [Posts]
 *     description: Add a comment to a post
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Comment added successfully
 */

/**
 * @swagger
 * /posts/{postId}/comment/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Posts]
 *     description: Remove a comment from a post
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 */

/**
 * @swagger
 * /posts/{postId}/repost:
 *   post:
 *     summary: Repost a post
 *     tags: [Posts]
 *     description: Repost an existing post
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post reposted successfully
 */

/**
 * @swagger
 * /posts/{postId}/repost/{repostId}:
 *   delete:
 *     summary: Delete a repost
 *     tags: [Posts]
 *     description: Remove a repost from a user’s profile
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *       - in: path
 *         name: repostId
 *         required: true
 *         schema:
 *           type: string
 *         description: The repost ID
 *     responses:
 *       200:
 *         description: Repost deleted successfully
 */

/**
 * @swagger
 * /posts/{postId}/report:
 *   post:
 *     summary: Report a post
 *     tags: [Posts]
 *     description: Report a post for inappropriate content
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post reported successfully
 */
