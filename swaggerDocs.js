/**
 * @swagger
 * components:
 *   schemas:
 *     PostBase:
 *       type: object
 *       properties:
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
 *             format: ObjectId
 *
 *     Post:
 *       allOf:
 *         - $ref: '#/components/schemas/PostBase'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: Unique ID of the post
 *               format: objectId
 *             userId:
 *               type: string
 *               description: ID of the user who created the post
 *               format: objectId
 *             isActive:
 *               type: boolean
 *               description: Indicates if the post is active
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp when the post was created
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp when the post was last updated
 *
 *     CommentBase:
 *       type: object
 *       properties:
 *         postId:
 *           type: string
 *           description: ID of the post the comment is on
 *           format: objectId
 *         commentContent:
 *           type: string
 *           description: Content of the comment
 *         commentAttachment:
 *           type: array
 *           description: List of media attachments (image/video URLs)
 *           items:
 *             type: string
 *         taggedUsers:
 *           type: array
 *           description: List of user IDs tagged in the post
 *           items:
 *             type: string
 *             format: ObjectId
 *         parentComment:
 *           type: string
 *           format: ObjectId
 *           nullable: true
 *           description: "Parent comment ID if this is a reply"
 *
 *     Comment:
 *       allOf:
 *         - $ref: '#/components/schemas/CommentBase'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: Unique ID of the comment
 *               format: objectId
 *             userId:
 *               type: string
 *               description: ID of the user who created the comment
 *               format: objectId
 *             impressions:
 *               type: array
 *               description: "List of user impressions (likes, reactions, etc.)"
 *               items:
 *                 type: string
 *                 format: ObjectId
 *             replies:
 *               type: array
 *               description: "Replies to this comment (nested comments)"
 *               items:
 *                 type: string
 *             isActive:
 *               type: boolean
 *               description: Indicates if the post is active
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp when the post was created
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp when the post was last updated
 *
 *     DirectChatBase:
 *       type: object
 *       properties:
 *         secondUserId:
 *           type: string
 *           description: Id of the other user (other than the user with the tokne)
 *           format: objectID
 *     
 *     DirectChat:
 *       allOf:
 *         - $ref: '#/components/schemas/DirectChatBase'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: Unique ID of the direct chat
 *               format: objectId
 *             messages:
 *               type: array
 *               description: List of messages in the chat
 *               items:
 *                 type: string
 *                 format: ObjectId
 *               default: []
 *
 *     GroupChatBase:
 *       type: object
 *       properties:
 *         members:
 *           type: array
 *           description: List of user IDs included in the chat group
 *           items:
 *             type: string
 *             format: ObjectId
 *     
 *     GroupChat:
 *       allOf:
 *         - $ref: '#/components/schemas/DirectChatBase'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: Unique ID of the GroupChat chat
 *               format: objectId
 *             messages:
 *               type: array
 *               description: List of messages in the chat
 *               items:
 *                 type: string
 *                 format: ObjectId
 * 
 *   requestBodies:
 *     CreatePostRequest:
 *       description: Request body for creating a new post
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostBase'
 *
 *     CreateCommentRequest:
 *       description: Request body for creating a new comment or reply
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentBase'
 * 
 *     CreateDirectChatRequest:
 *       description: Request body for creating a new direct chat
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DirectChatBase'
 * 
 *     CreateGroupChatRequest:
 *       description: Request body for creating a new chat group
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupChatBase'
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
 *     security:
 *       - BearerAuth: []
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
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       500:
 *         description: Internal server error
 * 
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     description: Retrieve all posts for a specific user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of posts retrieved successfully
 *         content:
 *           application/json:
 *            schema:
 *             type: array
 *             items:
 *              $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized, invalid or missing token
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
 *     security:
 *       - BearerAuth: []
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Post not found
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     description: Modify an existing post by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreatePostRequest'
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Post not found
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     description: Remove a post by its ID
 *     security:
 *       - BearerAuth: []
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
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /posts/{postId}/save:
 *   post:
 *     summary: Save a post
 *     tags: [Posts]
 *     description: Save a post to a user's collection
 *     security:
 *       - BearerAuth: []
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
 *       401:
 *         description: Unauthorized, invalid or missing token
 *   delete:
 *     summary: Unsave a post
 *     tags: [Posts]
 *     description: Remove a post from a user's saved list
 *     security:
 *       - BearerAuth: []
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
 *       401:
 *         description: Unauthorized, invalid or missing token
 */

/**
 * @swagger
 * /posts/{postId}/like:
 *   post:
 *     summary: Like a post
 *     tags: [Posts]
 *     description: Add a like to a post
 *     security:
 *       - BearerAuth: []
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
 *       401:
 *         description: Unauthorized, invalid or missing token
 * 
 *   delete:
 *     summary: Unlike a post
 *     tags: [Posts]
 *     description: Remove a like from a post
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post unliked successfully
 *       401:
 *         description: Unauthorized, invalid or missing token
 */



/**
 * @swagger
 * /posts/{postId}/repost:
 *   post:
 *     summary: Repost a post
 *     tags: [Posts]
 *     description: Repost an existing post
 *     security:
 *       - BearerAuth: []
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
 *       401:
 *         description: Unauthorized, invalid or missing token
 */

/**
 * @swagger
 * /posts/{postId}/repost/{repostId}:
 *   delete:
 *     summary: Delete a repost
 *     tags: [Posts]
 *     description: Remove a repost from a user's profile
 *     security:
 *       - BearerAuth: []
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
 *       401:
 *         description: Unauthorized, invalid or missing token
 */

/**
 * @swagger
 * /posts/{postId}/report:
 *   post:
 *     summary: Report a post
 *     tags: [Posts]
 *     description: Report a post for inappropriate content
 *     security:
 *       - BearerAuth: []
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
 *       401:
 *         description: Unauthorized, invalid or missing token
 */


/**
 * @swagger
 * tags:
 *   - name: Comments
 *     description: API endpoints for managing Comments and Replies
 */

/**
 * @swagger
 * /comments:
 *  post:
 *      summary: Add comment
 *      tags: [Comments]
 *      security:
 *          - BearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/CreateCommentRequest'
 *      responses:
 *          201:
 *              description: Comment added successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Comment'
 *          400:
 *              description: Bad request, invalid input
 *          401:
 *              description: Unauthorized, invalid or missing token
 *          500:
 *              description: Internal server error
 *
 * /comments/{commentId}:
 *  put:
 *     summary: Edit comment
 *     tags: [Comments]
 *     description: Edit a specific comment with its ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     requestBody:
 *      $ref: '#/components/requestBodies/CreateCommentRequest'
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *          application/json:
 *              schema:
 *                  $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Comment not found
 *  delete:
 *     summary: Delete comment
 *     tags: [Comments]
 *     description: Delete a specific comment by its ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Comment not found
 *  get:
 *     summary: Get a specific comment
 *     tags: [Comments]
 *     description: Retrieve a specific comment by its ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *          application/json:
 *              schema:
 *                  $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Post not found
 */

/**
 ************************************* Chat APIs *************************************
 */

/**
 * @swagger
 * tags:
 *   - name: Chats
 *     description: API endpoints for managing chats
 */

/**
 * @swagger
 * /chats/direct-chat:
 *   post:
 *     summary: Create a new direct chat
 *     tags: [Chats]
 *     description: Create a new direct chat between two users
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateDirectChatRequest'
 *     responses:
 *       201:
 *        description: Direct chat created successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/DirectChat'
 *       400:
 *         description: Bad request, invalid input
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /chats/direct-chat/{chatId}:
 *   get:
 *    summary: Get a direct chat
 *    tags: [Chats]
 *    description: Get a direct chat by its ID
 *    security:
 *      - BearerAuth: []
 *    parameters:
 *      - in: path
 *        name: chatId
 *        required: true
 *        schema:
 *          type: string
 *          description: The direct chat ID
 *    responses:
 *     200:
 *      description: Direct chat retrieved successfully
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/DirectChat'
 *    401:
 *     description: Unauthorized, invalid or missing token
 *    404:
 *     description: Chat not found
 *    500:
 *     description: Internal server error
 * 
 *   put:
 *     summary: Edit a direct chat
 *     tags: [Chats]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           description: The direct chat ID
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateDirectChatRequest'
 *     responses:
 *       200:
 *         description: Chat updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DirectChat'
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Chat not found
 */


/**
 * @swagger
 * /chats/group-chat:
 *   post:
 *     summary: Create a new chat group
 *     tags: [Chats]
 *     description: Create a new chat group between many users
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateGroupChatRequest'
 *     responses:
 *       201:
 *        description: Group chat created successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/GroupChat'
 *       400:
 *         description: Bad request, invalid input
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /chats/group-chat/{chatId}:
 *   get:
 *    summary: Get a group chat
 *    tags: [Chats]
 *    description: Get a group chat by its ID
 *    security:
 *      - BearerAuth: []
 *    parameters:
 *      - in: path
 *        name: chatId
 *        required: true
 *        schema:
 *          type: string
 *          description: Chat ID
 *    responses:
 *     200:
 *      description: Group chat retrieved successfully
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/GroupChat'
 *    401:
 *     description: Unauthorized, invalid or missing token
 *    404:
 *     description: Chat not found
 *    500:
 *     description: Internal server error
 * 
 *   put:
 *     summary: Edit a chat group
 *     tags: [Chats]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *     - in: path
 *       name: chatId
 *       required: true
 *       schema:
 *         type: string
 *         description: The chat group ID
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateGroupChatRequest'
 *     responses:
 *       200:
 *         description: Chat updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupChat'
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Chat not found
 */

/**
 * @swagger
 * /chats/all-chats:
 *   get:
 *     summary: Get all chats for a user
 *     tags: [Chats]
 *     description: Retrieve all chats for a user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of chats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 oneOf:
 *                   - $ref: '#/components/schemas/DirectChat'
 *                   - $ref: '#/components/schemas/GroupChat'
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: No chats found
 *       500:
 *         description: Internal server error
 */