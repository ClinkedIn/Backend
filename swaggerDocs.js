/**
 * @swagger
 * components:
 * 
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 *   schemas:
 *     ImpressionBase:
 *       type: object
 *       properties:
 *         targetId:
 *           type: string
 *           description: Id for the post or the comment
 *         targetType:
 *           type: string
 *           enum: ["Post", "Comment"]
 *           description: Impression for post or comment
 *         type:
 *           type: string
 *           enum: ["Like", "Celebrate", "Support", "Insightful", "Funny"]
 *           description: Type of the impression
 * 
 *     Impression:
 *       allOf:
 *         - $ref: '#/components/schemas/ImpressionBase'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: Unique ID of the impression
 *               format: objectId
 *             userId:
 *               type: string
 *               description: ID of the user who made the impression
 *               format: objectId
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp when the impression was created
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp when the impression was last updated   
 *          
 * 
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
 *           default: null
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
 *     MessageBase:
 *       type: object
 *       properties:
 *         senderId:
 *           type: string
 *           description: ID of the sender
 *           format: objectId
 *         chatId:
 *           type: string
 *           description: ID of the chat
 *           format: objectId
 *         chatType:
 *           type: string
 *           enum: ["direct", "group"]
 *           description: Chat type (direct chat or chat group)
 *         messageText:
 *           type: string
 *           description: Content of the message
 *         messageAttachment:
 *           type: string
 *           description: Can be a file URL or path
 *           nullable: true
 *           default: null
 *         replyTo:
 *           type: string
 *           format: objectId
 *           description: References another message if it's a reply
 *           nullable: true
 *           default: null
 * 
 *     Message:
 *       allOf:
 *         - $ref: '#/components/schemas/MessageBase'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: Unique ID of the direct chat
 *               format: objectId
 *             readBy:
 *               type: array
 *               items: 
 *                 type: string
 *                 format: objectId
 *               description: List of user IDs who have read the message
 *             timeStamp:
 *               type: string
 *               format: date-time
 *               description: Timestamp when the message was sent
 *             isDeleted:
 *               type: boolean
 *               description: Indicates if the message was deleted
 *               default: false
 * 
 * 
 *     DirectChatBase:
 *       type: object
 *       properties:
 *         secondUserId:
 *           type: string
 *           description: Id of the other user (other than the user with the tokne)
 *           format: objectId
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
 *               default: []
 * 
 *     JobBase:
 *       type: object
 *       properties:
 *         companyId:
 *           type: string
 *           description: ID of the company offering the job
 *         workplaceType:
 *           type: string
 *           enum: ["Onsite", "Hybrid", "Remote"]
 *           description: Work location type
 *         jobLocation:
 *           type: string
 *           description: Location of the job
 *         jobType:
 *           type: string
 *           enum: ["Full Time", "Part Time", "Contract", "Temporary", "Other", "Volunteer", "Internship"]
 *           description: Classification of the job
 *         description:
 *           type: string
 *           description: Details about the job
 *         applicationEmail:
 *           type: string
 *           description: Email to which job applications should be sent
 *         screeningQuestions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 description: The screening question
 *               mustHave:
 *                 type: boolean
 *                 description: Indicates if the question is a must-have requirement
 *         autoRejectMustHave:
 *           type: boolean
 *           description: Whether to automatically reject applicants who do not meet must-have criteria
 *         rejectPreview:
 *           type: string
 *           description: Message to display for rejected applicants
 *
 *     Job:
 *       allOf:
 *         - $ref: '#/components/schemas/JobBase'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: Unique ID of the job
 *             applicants:
 *               type: array
 *               items:
 *                 type: string
 *               description: IDs of users who applied
 *             accepted:
 *               type: array
 *               items:
 *                 type: string
 *               description: IDs of accepted applicants
 *             rejected:
 *               type: array
 *               items:
 *                 type: string
 *               description: IDs of rejected applicants
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp when the job was created
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp when the job was last updated
 *
 *     CompanyBase:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the company creator
 *         name:
 *           type: string
 *           description: Name of the company
 *         address:
 *           type: string
 *           description: Unique LinkedIn-style URL of the company
 *         website:
 *           type: string
 *           description: Company website
 *         industry:
 *           type: string
 *           description: Industry the company belongs to
 *         organizationSize:
 *           type: string
 *           enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5000+"]
 *           description: Size of the organization
 *         organizationType:
 *           type: string
 *           enum: ["Public", "Private", "Nonprofit", "Government", "Educational", "Self-employed"]
 *           description: Type of the organization
 *         logo:
 *           type: string
 *           description: URL to the company's logo
 *         tagLine:
 *           type: string
 *           description: Short company description or tagline
 *
 *     Company:
 *       allOf:
 *         - $ref: '#/components/schemas/CompanyBase'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: Unique ID of the company
 *               format: objectId
 *             followers:
 *               type: array
 *               items:
 *                 type: string
 *               description: IDs of users following the company
 *             visitors:
 *               type: array
 *               items:
 *                 type: string
 *               description: IDs of users who visited the company profile
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp when the company was created
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               description: Timestamp when the company was last updated
 *
 * 
 *   requestBodies:
 * 
 *     CreateImpressionRequest:
 *       description: Request body for adding an impression
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ImpressionBase' 
 * 
 *     CreatePostRequest:
 *       description: Request body for creating a new post
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostBase'
 * 
 *
 *     CreateCommentRequest:
 *       description: Request body for creating a new comment or reply
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentBase'
 * 
 *   
 *     CreateMessageRequest:
 *       description: Request body for sending a new message
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MessageBase'
 *  
 *  
 *     CreateDirectChatRequest:
 *       description: Request body for creating a new direct chat
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DirectChatBase'
 * 
 * 
 *     CreateGroupChatRequest:
 *       description: Request body for creating a new chat group
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupChatBase'
 *     CreateJobRequest:
 *       description: Request body for creating a new job
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobBase'
 *
 *     CreateCompanyRequest:
 *       description: Request body for creating a new company
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompanyBase'
 *
 */

/**
 * @swagger
 * tags:
 *   - name: Impressions
 *     description: API endpoints for managing impressions
 */

/**
 * @swagger
 * /impressions:
 *   post:
 *     summary: Add an impression
 *     tags: [Impressions]
 *     description: Add a new impression
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateImpressionRequest'
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Impression'
 *       400:
 *         description: Bad request, invalid input
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       500:
 *         description: Internal server error
 *       
 */

/**
 * @swagger
 * /impressions/{id}:
 *   get:
 *     summary: Retrieve all impression for a specific post or comment
 *     tags: [Impressions]
 *     description: Retrieve all impression for a specific post or comment
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *         description: The target post or comment ID
 *     responses:
 *       200:
 *         description: List of posts retrieved successfully
 *         content:
 *           application/json:
 *            schema:
 *             type: array
 *             items:
 *              $ref: '#/components/schemas/Impression'
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *        description: No Impressions found
 *       500:
 *        description: Internal server error
 * 
 *   delete:
 *     summary: Delete an impression
 *     tags: [Impressions]
 *     description: Remove an impression by its ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: impressionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The impression ID
 *     responses:
 *       200:
 *         description: Impression deleted successfully
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Impression not found
 */


// ******************************************* Posts APIs ************************************* //


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
 *     requestBody:
 *       
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
 * 
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

//************************************ Messages APIs ******************************************//

/**
 * @swagger
 * tags:
 *   - name: Messages
 *     description: API endpoints for managing messages
 */

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     description: Send a message to a chat
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateMessageRequest'
 *     responses:
 *       201:
 *         description: Message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Bad request, invalid input
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /messages/{messageId}:
 *   get:
 *     summary: Get a message
 *     tags: [Messages]
 *     description: Get a message by its ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the message
 *     responses:
 *       200:
 *         description: Message retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized, invalid, or missing token
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 * 
 *   put:
 *     summary: Update a message
 *     tags: [Messages]
 *     description: Edit a message by its ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the message
 *     requestBody:
 *       description: Request body for editing a message
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageText:
 *                 type: string
 *                 description: The new text content of the message
 *               messageAttachment:
 *                 type: string
 *                 description: The new attachments of the message
 *     responses:
 *       200:
 *         description: Message updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'         
 *       400:
 *         description: Bad request, invalid input
 *       401:
 *         description: Unauthorized, invalid, or missing token
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 * 
 *
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     description: Delete a message by its ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the message 
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Message not found
 */



// *********************************** Chat APIs ***************************************//

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

// *********************************** jobs APIs ***************************************//
/**
 * @swagger
 * tags:
 *   - name: Jobs
 *     description: API endpoints for managing jobs
 */

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     description: Create a new job posting
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateJobRequest'
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Bad request, invalid input
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       500:
 *         description: Internal server error
 *
 *   get:
 *     summary: Retrieve all jobs
 *     tags: [Jobs]
 *     description: Retrieve a list of all job postings
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /jobs/{jobId}:
 *   get:
 *     summary: Retrieve a specific job
 *     tags: [Jobs]
 *     description: Retrieve details of a job posting by its ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job to retrieve
 *     responses:
 *       200:
 *         description: Job details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update a job
 *     tags: [Jobs]
 *     description: Update details of an existing job posting
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job to update
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateJobRequest'
 *     responses:
 *       200:
 *         description: Job updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Bad request, invalid input
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete a job
 *     tags: [Jobs]
 *     description: Delete a job posting by its ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job to delete
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /jobs/{jobId}/apply:
 *   post:
 *     summary: Apply for a job
 *     tags: [Jobs]
 *     description: Submit an application for a specific job posting
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job to apply for
 *     requestBody:
 *       description: Applicant's user ID
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user applying for the job
 *     responses:
 *       200:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Bad request, invalid input or user already applied
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /jobs/{jobId}/applications/{userId}/accept:
 *   put:
 *     summary: Accept a job applicant
 *     tags: [Jobs]
 *     description: Mark an applicant as accepted for a job posting
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the applicant to accept
 *     responses:
 *       200:
 *         description: Applicant accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Bad request, user has not applied for this job
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /jobs/{jobId}/applications/{userId}/reject:
 *   put:
 *     summary: Reject a job applicant
 *     tags: [Jobs]
 *     description: Mark an applicant as rejected for a job posting
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the applicant to reject
 *     responses:
 *       200:
 *         description: Applicant rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Bad request, user has not applied for this job
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /jobs/company/{companyId}:
 *   get:
 *     summary: Retrieve jobs by company
 *     tags: [Jobs]
 *     description: Retrieve all job postings created by a specific company
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the company
 *     responses:
 *       200:
 *         description: List of jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: No jobs found for the specified company
 *       500:
 *         description: Internal server error
 */
// *********************************** Company APIs ***************************************//
/**

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Create a new company
 *     tags: [Companies]
 *     description: Create a new company profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateCompanyRequest'
 *     responses:
 *       201:
 *         description: Company created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       400:
 *         description: Bad request, invalid input
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       500:
 *         description: Internal server error
 *
 *   get:
 *     summary: Retrieve all companies
 *     tags: [Companies]
 *     description: Retrieve a list of all companies
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of companies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Company'
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /companies/{companyId}:
 *   get:
 *     summary: Retrieve a specific company
 *     tags: [Companies]
 *     description: Retrieve details of a company by its ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the company to retrieve
 *     responses:
 *       200:
 *         description: Company details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update a company
 *     tags: [Companies]
 *     description: Update details of an existing company profile
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the company to update
 *     requestBody:
 *       $ref: '#/components/requestBodies/CreateCompanyRequest'
 *     responses:
 *       200:
 *         description: Company updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       400:
 *         description: Bad request, invalid input
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete a company
 *     tags: [Companies]
 *     description: Delete a company profile by its ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the company to delete
 *     responses:
 *       200:
 *         description: Company deleted successfully
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /companies/{companyId}/follow:
 *   post:
 *     summary: Follow a company
 *     tags: [Companies]
 *     description: Follow a company by adding a user to the company's followers list
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the company to follow
 *     requestBody:
 *       description: User ID of the follower
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user who wants to follow the company
 *     responses:
 *       200:
 *         description: Company followed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       400:
 *         description: Bad request, invalid input or user already following
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Unfollow a company
 *     tags: [Companies]
 *     description: Remove a user from the company's followers list
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the company to unfollow
 *     requestBody:
 *       description: User ID of the follower
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user who wants to unfollow the company
 *     responses:
 *       200:
 *         description: Company unfollowed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       400:
 *         description: Bad request, invalid input
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /companies/{companyId}/visit:
 *   post:
 *     summary: Add a visitor to a company
 *     tags: [Companies]
 *     description: Record a visit to a company's profile by a user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the company being visited
 *     requestBody:
 *       description: User ID of the visitor
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user who visited the company
 *     responses:
 *       200:
 *         description: Visitor added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       400:
 *         description: Bad request, invalid input
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */
// *********************************** User APIs ******************************************//

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: API endpoints for managing users
 */

/** 
 * @swagger
 * /user/:
 *     post:
 *         summary: Create a new user
 *         tags: [Users] 
 *         description: Registeration a new user 
 *         operationId: createUser
 *         requestBody:
 *             description: Create User object 
 *             required: true
 *             content:
 *                 application/json: 
 *                     schema:
 *                         $ref: '#/components/schemas/RegisterUser'
 *         responses:
 *             201:
 *                 description: User created successfully
 *                 content:
 *                     application/json:
 *                         example:
 *                             message: User created successfully
 *             500:
 *                 description: Internal server error
 *     delete:
 *         summary: Delete a user
 *         tags: [Users]
 *         description: Delete a user 
 *         operationId: deleteUser
 *         responses:
 *             200:
 *                 description: User deleted successfully
 *                 content:
 *                     application/json:
 *                         example:
 *                             message: User deleted successfully
 *             400:
 *                 description: Bad request, invalid input
 *             401:
 *                 description: Unauthorized, user must be logged in
 *             500:
 *                 description: Internal server error 
 * */

/**
 * @swagger
 * /user/login:
 *     post:
 *         summary: Login user
 *         tags: [Users]
 *         description: Login a user with email and password
 *         requestBody:
 *             content:
 *                 application/json:
 *                     schema:
 *                         $ref: '#/components/schemas/UserLogin'   
 *             required: true
 *         responses:
 *             200:
 *                 description: User logged in successfully
 *                 content:
 *                     application/json:
 *                         example:
 *                             token: <JWT_TOKEN>
 *
 *             401:
 *                 description: Unauthorized, invalid credentials 
 *             500:
 *                 description: Internal server error
 */

/**
 * @swasgger
 * user/auth/google:    
 *    get:
 *      summary: Login with google
 *      tags: [Users]
 *      description: Login with google
 *      responses:
 *       200:
 *        description: User logged in successfully
 *        content:
 *          application/json:
 *            example:
 *            token: <JWT_TOKEN>
 *       401:
 *         description: Unauthorized, invalid credentials
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/logout:
 *    get:
 *     summary: Logout user
 *     tags: [Users]
 *     description: Logout a user
 *     responses:
 *       200:
 *        description: User logged out successfully
 *        content:
 *          application/json:
 *            example:
 *              message: User logged out successfully
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/forgot-password:
 *     post:
 *         summary: Send an email to the user to reset password
 *         tags: [Users]
 *         description: Send reset link
 *         operationId: forgotPassword
 *         requestBody:
 *             description: Send reset link
 *             required: true
 *             content:
 *                 application/json:
 *                     schema:
 *                         $ref: "#/components/schemas/ForgotPassword"
 *         responses:
 *             200:
 *                 description: Password reset email sent successfully
 *                 content:
 *                     application/json:
 *                         example:
 *                             message: Password reset email sent successfully
 *             404:
 *                 description: email does not exist
 *                 content:
 *                     application/json:
 *                         example:
 *                             message: email does not exist
 *             500:
 *                 description: Internal server error
 */

/**
 * @swagger
 * /user/update-password:
 *     patch:
 *         summary: update password (for when user doesn't remember password and follows link in email)
 *         tags: [Users]
 *         description: update password using reset link
 *         requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                     schema:
 *                         $ref: "#/components/schemas/UpdatePassword"
 *         responses:
 *             200:
 *                 description: Password update successfully
 *                 content:
 *                     application/json:
 *                         example:
 *                             message: Password updated successfully
 *             401:
 *                 description: Unauthorized, user must be logged in
 *             500:
 *                 description: Internal server error
 */

/**
 * @swagger
 * /user/update-email:
 *     patch:
 *         summary: Allows user to update email
 *         tags: [Users]
 *         description: Update user email address.
 *         operationId: updateEmail
 *         requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                     schema:
 *                         $ref: "#/components/schemas/UpdateEmail"
 *         responses:
 *             200:
 *                 description: Email updated successfully
 *                 content:
 *                     application/json:
 *                         example:
 *                             message: Email updated successfully
 *             400:
 *                 description: Invalid Email
 *             401:
 *                 description: Unauthorized, user must be logged in
 *             500:
 *                 description: Internal server error
 */

/**
 * @swagger
 * /user/confirm-email:
 *   get:
 *     summary: Send email confirmation link
 *     tags: [Users]
 *     description: Sends a verification email containing a token for email confirmation.
 *     operationId: sendEmailConfirmation
 *     responses:
 *       200:
 *         description: Email verification token generated and email sent successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Email verification email sent successfully
 *               emailVerificationToken: "123456789abcdef"
 *       401:
 *         description: Unauthorized, user must be logged in
 *       500:
 *         description: Internal server error
 *   patch:
 *     summary: Confirm email address
 *     tags: [Users]
 *     description: Confirms the user's email by verifying the token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ConfirmEmail"
 *     responses:
 *       200:
 *         description: Email confirmed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Email confirmed successfully
 *       400:
 *         description: Invalid or expired token
 *       401:
 *         description: Unauthorized, user must be logged in
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/in/{userId}:
 *    get:
 *      summary: Get a logged-in user's public profile data by ID
 *      tags: [Users]
 *      description: Retrieve a logged-in user's public profile data by their ID
 *      parameters:
 *        - name: userId
 *          in: path
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: User data retrieved successfully
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/LoggedInUser"
 *        401:
 *          description: Unauthorized, user must be logged in
 *        404:
 *          description: User not found
 *        500:
 *          description: Internal server error
 */

/**
 * @swagger
 * /user/{userId}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     description: Retrieves a user's profile with privacy filtering based on requester's relationship with the user
 *     operationId: getUserProfile
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the user whose profile to retrieve
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User profile retrieved successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 5a96ecd7fc5c55fee3eab5fe
 *                     firstName:
 *                       type: string
 *                       example: Torrance
 *                     lastName:
 *                       type: string
 *                       example: Willms
 *                     email:
 *                       type: string
 *                       example: Cyril.Wunsch62@yahoo.com
 *                     profilePicture:
 *                       type: string
 *                       example: https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/81.jpg
 *                     coverPicture:
 *                       type: string
 *                       example: https://picsum.photos/seed/MFzbMCDqC/675/1424
 *                     resume:
 *                       type: string
 *                       example: https://content-cutlet.info
 *                     bio:
 *                       type: string
 *                       example: Stipes conatus creber sit.
 *                     location:
 *                       type: string
 *                       example: Kalebchester
 *                     lastJobTitle:
 *                       type: string
 *                       example: Global Response Planner
 *                     industry:
 *                       type: string
 *                       nullable: true
 *                     mainEducation:
 *                       type: string
 *                       nullable: true
 *                     profilePrivacySettings:
 *                       type: string
 *                       enum: [public, private, connectionsOnly]
 *                       example: public
 *                     workExperience:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           jobTitle:
 *                             type: string
 *                           companyName:
 *                             type: string
 *                           fromDate:
 *                             type: string
 *                             format: date-time
 *                           toDate:
 *                             type: string
 *                             format: date-time
 *                           employmentType:
 *                             type: string
 *                           location:
 *                             type: string
 *                           locationType:
 *                             type: string
 *                           description:
 *                             type: string
 *                           skills:
 *                             type: array
 *                             items:
 *                               type: string
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           skillName:
 *                             type: string
 *                           endorsements:
 *                             type: array
 *                             items:
 *                               type: string
 *                     education:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           school:
 *                             type: string
 *                           degree:
 *                             type: string
 *                           fieldOfStudy:
 *                             type: string
 *                           startDate:
 *                             type: string
 *                             format: date-time
 *                           endDate:
 *                             type: string
 *                             format: date-time
 *                           grade:
 *                             type: string
 *                           description:
 *                             type: string
 *                           skills:
 *                             type: array
 *                             items:
 *                               type: string
 *                     following:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           entity:
 *                             type: string
 *                           entityType:
 *                             type: string
 *                           followedAt:
 *                             type: string
 *                             format: date-time
 *                     followers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           entity:
 *                             type: string
 *                           entityType:
 *                             type: string
 *                           followedAt:
 *                             type: string
 *                             format: date-time
 *                     connectionList:
 *                       type: array
 *                       items:
 *                         type: string
 *       403:
 *         description: Access denied due to privacy settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This profile is private
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve user profile
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get a list of users
 *     tags: [Users]
 *     description: Retrieves a paginated and filtered list of users, respecting privacy settings
 *     operationId: getAllUsers
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Filter by first name or last name (case-insensitive, partial match)
 *         required: false
 *         schema:
 *           type: string
 *       - name: location
 *         in: query
 *         description: Filter by location (case-insensitive, partial match)
 *         required: false
 *         schema:
 *           type: string
 *       - name: industry
 *         in: query
 *         description: Filter by industry (case-insensitive, partial match)
 *         required: false
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *       - name: limit
 *         in: query
 *         description: Number of users per page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Users retrieved successfully
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 5a96ecd7fc5c55fee3eab5fe
 *                       firstName:
 *                         type: string
 *                         example: John
 *                       lastName:
 *                         type: string
 *                         example: Doe
 *                       profilePicture:
 *                         type: string
 *                         example: https://example.com/profile.jpg
 *                       location:
 *                         type: string
 *                         example: San Francisco, CA
 *                       industry:
 *                         type: string
 *                         example: Technology
 *                       mainEducation:
 *                         type: string
 *                         example: Stanford University
 *                       bio:
 *                         type: string
 *                         example: Software engineer with 10+ years of experience
 *                       profilePrivacySettings:
 *                         type: string
 *                         enum: [public, private, connectionsOnly]
 *                         example: public
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of users matching the filters
 *                       example: 243
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       description: Number of users per page
 *                       example: 10
 *                     pages:
 *                       type: integer
 *                       description: Total number of pages
 *                       example: 25
 *       401:
 *         description: Unauthorized - User must be logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authentication required
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve users
 *                 error:
 *                   type: string
 *                   example: Internal server error details
 */

/**
 * @swagger
 * /user/profile:
 *   post:
 *     summary: Create a user profile
 *     tags: [Users]
 *     description: Create a new user profile with basic information.
 *     operationId: createUserProfile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UserProfile"
 *     responses:
 *       201:
 *         description: User profile created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: User profile created successfully
 *               userId: "64f8a1b2c3d4e5f6a7b8c9d0"
 *       400:
 *         description: Bad request, invalid input
 *       500:
 *         description: Internal server error
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     description: Update user profile details such as name, bio, location, work experience, education, and skills.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UpdateUserIntro"
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Profile updated successfully"
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized, user must be logged in
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /user/profile-picture:
 *   post:
 *     summary: Upload a profile picture
 *     tags: [Users]
 *     description: Upload or update a user's profile picture
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
 *       400:
 *         description: Invalid file format
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 *
 *   delete:
 *     summary: Delete profile picture
 *     tags: [Users]
 *     description: Remove a user's profile picture
 *     responses:
 *       200:
 *         description: Profile picture deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile picture not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /user/cover-photo:
 *   post:
 *     summary: Upload a cover photo
 *     tags: [Users]
 *     description: Upload or update a user's cover photo
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               coverPhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cover photo uploaded successfully
 *       400:
 *         description: Invalid file format
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 *
 *   delete:
 *     summary: Delete cover photo
 *     tags: [Users]
 *     description: Remove a user's cover photo
 *     responses:
 *       200:
 *         description: Cover photo deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cover photo not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /user/resume:
 *   get:
 *     summary: Get user resume
 *     tags: [Users]
 *     description: Retrieves the current user's resume URL
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Resume retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Resume retrieved successfully"
 *                 resume:
 *                   type: string
 *                   example: "https://res.cloudinary.com/dn9y17jjs/raw/upload/v1741980697/documents/aus6mwgtk3tloi6j3can"
 *                 googleDocsUrl:
 *                   type: string
 *                   example: "https://docs.google.com/viewer?url=https://res.cloudinary.com/dn9y17jjs/raw/upload/v1741980697/documents/aus6mwgtk3tloi6j3can&embedded=true"
 *       400:
 *         description: Resume not uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Resume not uploaded"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Upload resume
 *     tags: [Users]
 *     description: Upload or update a user's resume
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: PDF, DOC or DOCX file (max 10MB)
 *     responses:
 *       200:
 *         description: Resume uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Resume uploaded successfully"
 *                 resume:
 *                   type: string
 *                   example: "https://res.cloudinary.com/dn9y17jjs/raw/upload/v1741980697/documents/aus6mwgtk3tloi6j3can"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid file type. Only PDF, DOC, and DOCX are allowed."
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete resume
 *     tags: [Users]
 *     description: Remove a user's resume
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Resume deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Resume deleted successfully"
 *       400:
 *         description: No resume to delete
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No resume to delete"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /user/experience:
 *   post:
 *     summary: Add a new work experience
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Adds a work experience entry to the user's profile.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobTitle:
 *                 type: string
 *                 example: "Software Engineer"
 *               companyName:
 *                 type: string
 *                 example: "TechCorp"
 *               fromDate:
 *                 type: string
 *                 format: date
 *                 example: "2022-01-01"
 *               toDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-06-01"
 *               currentlyWorking:
 *                 type: boolean
 *                 example: false
 *               employmentType:
 *                 type: string
 *                 example: "Full-time"
 *               location:
 *                 type: string
 *                 example: "New York, USA"
 *               locationType:
 *                 type: string
 *                 example: "Remote"
 *               description:
 *                 type: string
 *                 example: "Worked on backend development."
 *     responses:
 *       200:
 *         description: Experience added successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/experience:
 *   get:
 *     summary: Get user's work experiences
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Retrieves all work experiences of the authenticated user.
 *     responses:
 *       200:
 *         description: A list of experiences
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/experience/{index}:
 *   get:
 *     summary: Get a specific experience by index
 *     description: Retrieves a specific work experience entry from the user's profile based on the given index.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: index
 *         in: path
 *         required: true
 *         description: The index of the experience to retrieve.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved the experience.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 experience:
 *                   type: object
 *                   properties:
 *                     jobTitle:
 *                       type: string
 *                       example: "Software Engineer"
 *                     companyName:
 *                       type: string
 *                       example: "Google"
 *                     fromDate:
 *                       type: string
 *                       format: date
 *                       example: "2022-06-01"
 *                     toDate:
 *                       type: string
 *                       format: date
 *                       example: "2023-08-30"
 *                     currentlyWorking:
 *                       type: boolean
 *                       example: false
 *                     employmentType:
 *                       type: string
 *                       example: "Full-time"
 *                     location:
 *                       type: string
 *                       example: "New York, USA"
 *                     locationType:
 *                       type: string
 *                       example: "On-site"
 *                     description:
 *                       type: string
 *                       example: "Developed and maintained scalable applications."
 *                     foundVia:
 *                       type: string
 *                       example: "LinkedIn"
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["JavaScript", "React", "Node.js"]
 *                     media:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["https://example.com/project.pdf"]
 *       400:
 *         description: Invalid experience index or out of range.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid experience index"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 *                 details:
 *                   type: string
 *                   example: "Error message here"
 */

/**
 * @swagger
 * /user/experience/{index}:
 *   put:
 *     summary: Update an experience by index
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Updates an existing work experience entry of a user.
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *         description: Index of the experience to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobTitle:
 *                 type: string
 *               companyName:
 *                 type: string
 *               fromDate:
 *                 type: string
 *                 format: date
 *               toDate:
 *                 type: string
 *                 format: date
 *               currentlyWorking:
 *                 type: boolean
 *               employmentType:
 *                 type: string
 *               location:
 *                 type: string
 *               locationType:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Experience updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Experience not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/experience/{index}:
 *   delete:
 *     summary: Delete a work experience by index
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Removes a specific work experience entry from the user's profile.
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *         description: Index of the experience to delete
 *     responses:
 *       200:
 *         description: Work experience deleted successfully
 *       400:
 *         description: Invalid experience index
 *       404:
 *         description: Experience not found
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /user/education:
 *   post:
 *     summary: Add education
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Add an education entry to a user's profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Education"
 *     responses:
 *       200:
 *         description: Education added successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
/**
 * @swagger
 * /user/education/{index}:
 *   patch:
 *     summary: Update a specific education entry
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *         description: Index of the education entry to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               school:
 *                 type: string
 *                 description: Name of the school/university
 *               degree:
 *                 type: string
 *                 description: Degree obtained
 *               fieldOfStudy:
 *                 type: string
 *                 description: Field of study
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of education (YYYY-MM-DD)
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of education (YYYY-MM-DD)
 *               grade:
 *                 type: string
 *                 description: Grade achieved
 *               activities:
 *                 type: string
 *                 description: Activities and societies
 *               description:
 *                 type: string
 *                 description: Description of education
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Skills acquired during education
 *               media:
 *                 type: string
 *                 description: URL to education-related media
 *     responses:
 *       200:
 *         description: Education entry updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Education updated successfully
 *               education:
 *                 school: Harvard University
 *                 degree: Master of Science
 *                 fieldOfStudy: Computer Science
 *                 startDate: 2020-09-01
 *                 endDate: 2022-06-30
 *       400:
 *         description: Bad request (missing school name or invalid data)
 *       404:
 *         description: User or education entry not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /user/education/{index}:
 *   get:
 *     summary: Get a specific education entry
 *     tags: [Users]
 *     description: Retrieves a single education entry by its index
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *         description: Index of the education entry to retrieve
 *     responses:
 *       200:
 *         description: Education entry retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 education:
 *                   type: object
 *                   properties:
 *                     school:
 *                       type: string
 *                       example: Harvard University
 *                     degree:
 *                       type: string
 *                       example: Bachelor of Science
 *                     fieldOfStudy:
 *                       type: string
 *                       example: Computer Science
 *                     startDate:
 *                       type: string
 *                       format: date
 *                       example: 2020-09-01
 *                     endDate:
 *                       type: string
 *                       format: date
 *                       example: 2024-06-30
 *                     grade:
 *                       type: string
 *                       example: 3.8
 *                     activities:
 *                       type: string
 *                       example: Coding Club
 *                     description:
 *                       type: string
 *                       example: Focus on AI and ML
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Python", "Machine Learning"]
 *                     media:
 *                       type: string
 *                       example: https://example.com/certificate.pdf
 *       400:
 *         description: Invalid education index
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid education index
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               message: User not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Server error
 */

/**
 * @swagger
 * /user/education:
 *   get:
 *     summary: Get all education entries
 *     tags: [Users]
 *     description: Retrieves all education entries for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of education entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 educations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       school:
 *                         type: string
 *                         example: Harvard University
 *                       degree:
 *                         type: string
 *                         example: Bachelor of Science
 *                       fieldOfStudy:
 *                         type: string
 *                         example: Computer Science
 *                       startDate:
 *                         type: string
 *                         format: date
 *                         example: 2020-09-01
 *                       endDate:
 *                         type: string
 *                         format: date
 *                         example: 2024-06-30
 *                       grade:
 *                         type: string
 *                         example: 3.8
 *                       activities:
 *                         type: string
 *                         example: Coding Club, Research Group
 *                       description:
 *                         type: string
 *                         example: Major in AI and ML
 *                       skills:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Python", "Machine Learning"]
 *                       media:
 *                         type: string
 *                         example: https://example.com/certificate.pdf
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               message: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Server error
 */

/**
 * @swagger
 * /user/education/{index}:
 *   delete:
 *     summary: Delete an education entry
 *     tags: [Users]
 *     description: Removes a specific education entry by its index
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *         description: Index of the education entry to delete
 *     responses:
 *       200:
 *         description: Education entry deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Education deleted successfully
 *                 educations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       school:
 *                         type: string
 *                         example: Harvard University
 *                       degree:
 *                         type: string
 *                         example: Bachelor of Science
 *                       fieldOfStudy:
 *                         type: string
 *                         example: Computer Science
 *                       startDate:
 *                         type: string
 *                         format: date
 *                         example: 2020-09-01
 *                       endDate:
 *                         type: string
 *                         format: date
 *                         example: 2024-06-30
 *                       grade:
 *                         type: string
 *                         example: 3.8
 *                       activities:
 *                         type: string
 *                         example: Coding Club, Research Group
 *                       description:
 *                         type: string
 *                         example: Major in AI and ML
 *                       skills:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Python", "Machine Learning"]
 *                       media:
 *                         type: string
 *                         example: https://example.com/certificate.pdf
 *       400:
 *         description: Invalid education index
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid education index
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */

/**
 * @swagger
 * /user/certifications:
 *   post:
 *     summary: Add certification
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Add a certification to a user's profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Certification"
 *     responses:
 *       200:
 *         description: Certification added successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /user/skills:
 *   post:
 *     summary: Add a skill to user's profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Adds a new skill to a user's profile after validating the skill name and checking for duplicates.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skillName:
 *                 type: string
 *                 example: "JavaScript"
 *     responses:
 *       201:
 *         description: Skill added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Skill added successfully"
 *                 skill:
 *                   type: string
 *                   example: "JavaScript"
 *       400:
 *         description: Invalid input data or skill already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid skill name or skill already exists"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 * 
 *   get:
 *     summary: Get all user skills
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Retrieve all skills associated with the authenticated user.
 *     responses:
 *       200:
 *         description: Successfully retrieved user skills
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       skillName:
 *                         type: string
 *                         example: "JavaScript"
 *                       endorsements:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["userId1", "userId2"]
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 *                 details:
 *                   type: string
 *                   example: "Error message details"
 */

/**
 * @swagger
 * /user/skills/{skillName}:
 * 
 *   get:
 *     summary: Get a specific skill by name
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Retrieve a specific skill from a user's profile by skill name.
 *     parameters:
 *       - in: path
 *         name: skillName
 *         required: true
 *         schema:
 *           type: string
 *           example: "JavaScript"
 *         description: The name of the skill to retrieve.
 *     responses:
 *       200:
 *         description: Skill retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 skill:
 *                   type: object
 *                   properties:
 *                     skillName:
 *                       type: string
 *                       example: "JavaScript"
 *                     endorsements:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["userId1", "userId2"]
 *       404:
 *         description: User not found or skill not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Skill not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 *                 details:
 *                   type: string
 *                   example: "Error message details"
 * 
 *   put:
 *     summary: Update a user's skill
 *     description: Allows a user to update an existing skill in their profile.
 *     tags:
 *       - Skills
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the skill to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newSkillName:
 *                 type: string
 *                 description: The updated skill name
 *     responses:
 *       200:
 *         description: Skill updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 skill:
 *                   type: object
 *       400:
 *         description: Invalid request, missing or duplicate skill name
 *       404:
 *         description: Skill not found
 *       500:
 *         description: Internal server error
 *
 * 
 *   delete:
 *     summary: Delete a skill by name
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Remove a skill from a user's profile by specifying its name.
 *     parameters:
 *       - in: path
 *         name: skillName
 *         required: true
 *         schema:
 *           type: string
 *           example: "JavaScript"
 *         description: The name of the skill to delete.
 *     responses:
 *       200:
 *         description: Skill deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Skill deleted successfully"
 *                 deletedSkill:
 *                   type: object
 *                   properties:
 *                     skillName:
 *                       type: string
 *                       example: "JavaScript"
 *                     endorsements:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["userId1", "userId2"]
 *       404:
 *         description: User not found or skill not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Skill not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 *                 details:
 *                   type: string
 *                   example: "Error message details"
 */

/**
 * @swagger
 * /user/skills/add-endorsement:
 *   post:
 *     summary: Endorse a user's skill
 *     tags: [Users]
 *     description: Adds an endorsement to a user's skill.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skillOwnerId:
 *                 type: string
 *                 example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *               skillName:
 *                 type: string
 *                 example: "JavaScript"
 *     responses:
 *       200:
 *         description: Skill endorsement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Skill endorsement created successfully"
 *                 skill:
 *                   type: object
 *                   properties:
 *                     skillName:
 *                       type: string
 *                       example: "JavaScript"
 *                     endorsements:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["USER_ID_1", "USER_ID_2"]
 *       400:
 *         description: Bad request (e.g., User cannot endorse themselves, already endorsed)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User or skill not found
 *       500:
 *         description: Internal Server Error
 *
 * /user/skills/remove-endorsement/{skillName}:
 *   delete:
 *     summary: Remove endorsement from a skill
 *     tags: [Users]
 *     description: Removes an endorsement from a user's skill.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillName
 *         required: true
 *         schema:
 *           type: string
 *         description: The skill name to remove endorsement from
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skillOwnerId:
 *                 type: string
 *                 example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *     responses:
 *       200:
 *         description: Skill endorsement deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Skill endorsement deleted successfully"
 *                 skill:
 *                   type: object
 *                   properties:
 *                     skillName:
 *                       type: string
 *                       example: "JavaScript"
 *                     endorsements:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["USER_ID_2"]
 *       400:
 *         description: Bad request (e.g., missing fields)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User or skill not found
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /user/privacy-settings:
 *   patch:
 *     summary: Update profile visibility privacy settings
 *     tags: [Users]
 *     description: Update the user's profile visibility settings. Allowed values are "public", "private", or "connections-only".
 *     operationId: updateProfilePrivacySettings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ProfilePrivacySettings"
 *     responses:
 *       200:
 *         description: Privacy settings updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Privacy settings updated successfully"
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized, user must be logged in
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/follow/{entityId}:
 *   post:
 *     summary: Follow an entity (user or company)
 *     tags: [Users]
 *     description: Allows a user to follow another user or a company.
 *     operationId: followEntity
 *     parameters:
 *       - name: entityId
 *         in: path
 *         required: true
 *         description: The ID of the entity (user or company) to follow
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entityType:
 *                 type: string
 *                 enum: [User, Company]
 *                 default: User
 *                 description: Type of entity to follow (User or Company)
 *     responses:
 *       200:
 *         description: Entity followed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "User followed successfully"
 *       400:
 *         description: Cannot follow this entity or invalid entity type
 *       401:
 *         description: Unauthorized, user must be logged in
 *       404:
 *         description: Entity not found
 *       500:
 *         description: Internal server error
 * 
 *   delete:
 *     summary: Unfollow an entity (user or company)
 *     tags: [Users]
 *     description: Allows a user to unfollow another user or company.
 *     operationId: unfollowEntity
 *     parameters:
 *       - name: entityId
 *         in: path
 *         required: true
 *         description: The ID of the entity (user or company) to unfollow
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entityType:
 *                 type: string
 *                 enum: [User, Company]
 *                 default: User
 *                 description: Type of entity to unfollow (User or Company)
 *     responses:
 *       200:
 *         description: Entity unfollowed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "User unfollowed successfully"
 *       400:
 *         description: Cannot unfollow this entity or invalid entity type
 *       401:
 *         description: Unauthorized, user must be logged in
 *       404:
 *         description: Entity not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/blocked:
 *   get:
 *     summary: Get list of blocked users
 *     tags: [Users]
 *     description: Retrieve the list of users that the logged-in user has blocked.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Blocked users list retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               blockedUsers: ["userId1", "userId2"]
 *       401:
 *         description: Unauthorized, user must be logged in
 */

/**
 * @swagger
 * /user/block/{userId}:
 *   post:
 *     summary: Block a user
 *     tags: [Users]
 *     description: Block a user from interacting with the logged-in user.
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The ID of the user to block
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User blocked successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "User blocked successfully"
 *       400:
 *         description: Cannot block this user
 *       401:
 *         description: Unauthorized, user must be logged in
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Unblock a user
 *     tags: [Users]
 *     description: Unblock a previously blocked user.
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The ID of the user to unblock
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unblocked successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "User unblocked successfully"
 *       400:
 *         description: Cannot unblock this user
 *       401:
 *         description: Unauthorized, user must be logged in
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /user/message-requests:
 *   post:
 *     summary: Send a message request to a non-connection
 *     tags: [Messaging]
 *     description: Allows a user to send a message request to another user who is not in their connections.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientUserId:
 *                 type: string
 *                 example: "user123"
 *               message:
 *                 type: string
 *                 example: "Hi, I'd like to connect with you."
 *     responses:
 *       201:
 *         description: Message request sent successfully.
 *         content:
 *           application/json:
 *             example:
 *               message: "Message request sent."
 *       400:
 *         description: Invalid request data.
 *       401:
 *         description: Unauthorized, user must be logged in.
 *       403:
 *         description: Recipient has restricted message requests.
 *       500:
 *         description: Internal server error.
 *
 *   get:
 *     summary: Get pending message requests
 *     tags: [Messaging]
 *     description: Retrieves a list of message requests received by the logged-in user.
 *     responses:
 *       200:
 *         description: List of pending message requests.
 *         content:
 *           application/json:
 *             example:
 *               messageRequests: 
 *                 - senderId: "user456"
 *                   senderName: "Jane Doe"
 *                   messagePreview: "Hello, I wanted to..."
 *                   timestamp: "2025-03-04T12:00:00Z"
 *       401:
 *         description: Unauthorized, user must be logged in.
 *       500:
 *         description: Internal server error.
 *
 *   patch:
 *     summary: Accept or reject a message request
 *     tags: [Messaging]
 *     description: Allows a user to accept or reject a message request from a non-connection.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sendingUserId:
 *                 type: string
 *                 example: "user123"
 *               action:
 *                 type: string
 *                 enum: ["accept", "reject"]
 *                 example: "accept"
 *     responses:
 *       200:
 *         description: Message request handled successfully.
 *         content:
 *           application/json:
 *             example:
 *               message: "Message request accepted."
 *       400:
 *         description: Invalid request data.
 *       401:
 *         description: Unauthorized, user must be logged in.
 *       404:
 *         description: Message request not found.
 *       500:
 *         description: Internal server error.
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterUser:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string 
 *           example: John
 *         lastName:
 *           type: string
 *           example: Cena
 *         email:
 *           type: string
 *           example: example@email.com
 *         password:
 *           type: string
 *           example: password
 *     UserLogin:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: example@email.com
 *         password:
 *           type: string
 *           example: password
 *     ForgotPassword:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: example@email.com
 *     UpdatePassword:
 *       type: object
 *       properties:
 *         newPassword:
 *           type: string
 *           example: newpassword
 *     UpdateEmail:
 *       type: object
 *       properties:
 *         newEmail:
 *           type: string
 *           example: newEmail@email.com
 *         password:
 *           type: string
 *           example: password
 * 
 *     WorkExperience:
 *       type: object
 *       properties:
 *         jobTitle:
 *           type: string
 *           example: Software Engineer
 *         companyName:
 *           type: string
 *           example: Google
 *         from:
 *           type: string
 *           format: date
 *           example: "2020-06-01"
 *         to:
 *           type: string
 *           format: date
 *           example: "2023-06-01"
 *         employmentType:
 *           type: string
 *           enum: [full-time, part-time, freelance, self-employed, contract, internship, apprenticeship, seasonal]
 *           example: full-time
 *         location:
 *           type: string
 *           example: San Francisco, CA, USA
 *         locationType:
 *           type: string
 *           enum: [onsite, hybrid, remote]
 *           example: hybrid
 *         description:
 *           type: string
 *           example: Worked on backend services and APIs.
 *         jobSource:
 *           type: string
 *           enum: [Indeed, LinkedIn, Company Website, Other job sites, Referral, Contracted by recruiter, Staffing agency, Other]
 *           example: LinkedIn
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           example: ["JavaScript", "Node.js", "MongoDB"]
 *         media:
 *           type: string
 *           example: "https://example.com/certificate.pdf"
 * 
 *     Education:
 *       type: object
 *       properties:
 *         school:
 *           type: string
 *           example: Harvard University
 *         degree:
 *           type: string
 *           example: Bachelor's
 *         fieldOfStudy:
 *           type: string
 *           example: Computer Science
 *         startDate:
 *           type: string
 *           format: date
 *           example: "2017-09-01"
 *         endDate:
 *           type: string
 *           format: date
 *           example: "2021-06-01"
 *         grade:
 *           type: string
 *           example: 3.8 GPA
 *         activitiesAndSocieties:
 *           type: string
 *           example: "Coding Club, Debate Team"
 *         description:
 *           type: string
 *           example: "Completed a thesis on AI and Machine Learning."
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Python", "AI", "Data Science"]
 *         media:
 *           type: string
 *           example: "https://example.com/transcript.pdf"
 * 
 *     Skill:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: JavaScript
 *         endorsements:
 *           type: array
 *           items:
 *             type: string
 *           example: ["userId1", "userId2"]
 *
 *     LoggedInUser:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         email:
 *           type: string
 *           example: johndoe@email.com
 *         profilePicture:
 *           type: string
 *           example: "https://example.com/profile.jpg"
 *         coverPicture:
 *           type: string
 *           example: "https://example.com/cover.jpg"
 *         resume:
 *           type: string
 *           example: "https://example.com/resume.pdf"
 *         bio:
 *           type: string
 *           example: "Passionate software engineer with 5 years of experience."
 *         location:
 *           type: string
 *           example: "San Francisco, CA, USA"
 *         lastJobTitle:
 *           type: string
 *           example: "Software Engineer"
 *         workExperience:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/WorkExperience"
 *         skills:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Skill"
 *         education:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Education"
 *         profilePrivacySettings:
 *           type: string
 *           enum: [public, private, connections-only]
 *           example: "connections-only"
 *         connectionRequestPrivacySetting:
 *           type: string
 *           enum: [everyone, connections-only, no-one]
 *           example: "connections-only"
 *         following:
 *           type: array
 *           items:
 *             type: string
 *           example: ["userId1", "userId2"]
 *         followers:
 *           type: array
 *           items:
 *             type: string
 *           example: ["userId1"]
 *         connectionList:
 *           type: array
 *           items:
 *             type: string
 *           example: ["userId2"]
 *         blockedUsers:
 *           type: array
 *           items:
 *             type: string
 *           example: ["userId3"]
 *         profileViews:
 *           type: array
 *           items:
 *             type: string
 *           example: ["userId4", "userId5"]
 *         savedPosts:
 *           type: array
 *           items:
 *             type: string
 *           example: ["postId1", "postId2"]
 *         savedJobs:
 *           type: array
 *           items:
 *             type: string
 *           example: ["jobId1", "jobId2"]
 *         appliedJobs:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               jobId:
 *                 type: string
 *                 example: "jobId123"
 *               status:
 *                 type: string
 *                 enum: [pending, viewed, rejected, accepted]
 *                 example: "pending"
 *         jobListings:
 *           type: array
 *           items:
 *             type: string
 *           example: ["jobId123", "jobId456"]
 *         defaultMode:
 *           type: string
 *           enum: [light, dark]
 *           example: "dark"
 *         isActive:
 *           type: boolean
 *           example: true
 *     User:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         email:
 *           type: string
 *           example: johndoe@email.com
 *         profilePicture:
 *           type: string
 *           example: "https://example.com/profile.jpg"
 *         coverPicture:
 *           type: string
 *           example: "https://example.com/cover.jpg"
 *         resume:
 *           type: string
 *           example: "https://example.com/resume.pdf"
 *         bio:
 *           type: string
 *           example: "Passionate software engineer with 5 years of experience."
 *         location:
 *           type: string
 *           example: "San Francisco, CA, USA"
 *         lastJobTitle:
 *           type: string
 *           example: "Software Engineer"
 *         workExperience:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/WorkExperience"
 *         skills:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Skill"
 *         education:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Education"
 *         following:
 *           type: array
 *           items:
 *             type: string
 *           example: ["userId1", "userId2"]
 *         followers:
 *           type: array
 *           items:
 *             type: string
 *           example: ["userId1"]
 *         connectionList:
 *           type: array
 *           items:
 *             type: string
 *           example: ["userId2"]
 *         isActive:
 *           type: boolean
 *           example: true
 *     Certification:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "AWS Certified Solutions Architect"
 *         issuingOrganization:
 *           type: string
 *           example: "Amazon Web Services (AWS)"
 *         issueDate:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         credentialUrl:
 *           type: string
 *           format: uri
 *           example: "https://www.credly.com/badges/123456"
 * 
 *     UpdateUserIntro:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           example: "John"
 *         lastName:
 *           type: string
 *           example: "Doe"
 *         bio:
 *           type: string
 *           example: "Software engineer passionate about AI and ML."
 *         location:
 *           type: string
 *           example: "San Francisco, USA"
 *         mainEducation:
 *           type: integer
 *         industry:
 *           type: string
 *           example: "Software Development"
 * 
 *     UserProfile:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *       properties:
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         email:
 *           type: string
 *           example: john.doe@email.com
 *         bio:
 *           type: string
 *           example: "Software Engineer with 5 years of experience"
 *         location:
 *           type: string
 *           example: "Giza, Egypt"
 *         profilePicture:
 *           type: string
 *           example: "https://example.com/profile.jpg"
 *         coverPicture:
 *           type: string
 *           example: "https://example.com/cover.jpg"
 *         resume:
 *           type: string
 *           example: "https://example.com/resume.pdf"
 *         workExperience:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/WorkExperience"
 *         education:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Education"
 *         skills:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Skill"
 *     ConfirmEmail:
 *       type: object
 *       required:
 *         - emailVerificationToken
 *       properties:
 *         emailVerificationToken:
 *           type: string
 *           example: "123456789abcdef"
 * 
 *     ProfilePrivacySettings:
 *       type: object
 *       required:
 *         - profilePrivacySettings
 *       properties:
 *         profilePrivacySettings:
 *           type: string
 *           enum: [public, private, connections-only]
 *           example: public
 */


// *********************************** Connections APIs ******************************************//
/**
 * @swagger
 * tags:
 *   - name: Connections
 *     description: Managing connections and connection requests
 */

/**
 * @swagger
 * /connections/request/{targetUserId}:
 *   post:
 *     summary: Send connection request to another user
 *     tags: [Connections]
 *     description: Send a connection request to the user specified by targetUserId.
 *     parameters:
 *       - name: targetUserId
 *         in: path
 *         required: true
 *         description: The ID of the user to send a connection request to
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Connection request sent successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Connection request sent successfully"
 *       400:
 *         description: Invalid user ID 
 *       401:
 *         description: Unauthorized, user must be logged in
 *       409:
 *         description: request already sent
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /connections/requests/{userId}:
 *   patch:
 *     summary: Accept or decline a connection request
 *     tags: [Connections]
 *     description: Accept or decline a pending connection request.
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The ID of the user that sent the request
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [accept, decline]
 *                 example: accept
 *     responses:
 *       200:
 *         description: Connection request updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Connection request accepted"
 *       400:
 *         description: Invalid action or userId
 *       401:
 *         description: Unauthorized, user must be logged in
 *       404:
 *         description: Connection request not found
 */

/**
 * @swagger
 * /connections/{userId}:
 *   delete:
 *     summary: Remove a connection
 *     tags: [Connections]
 *     description: Remove an existing connection.
 *     parameters:
 *       - name: uderId
 *         in: path
 *         required: true
 *         description: The ID of the user to remove
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Connection removed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Connection removed successfully"
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Unauthorized, user must be logged in
 *       404:
 *         description: user not found
 */

/**
 * @swagger
 * /connections:
 *   get:
 *     summary: Get a list of connections
 *     tags: [Connections]
 *     description: Retrieve a list of all connections for the logged-in user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Connections retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               connections: ["user123", "user456"]
 *
 *       401:
 *         description: Unauthorized, user must be logged in
 */

/**
 * @swagger
 * /connections/requests:
 *   get:
 *     summary: Get a list of pending connection requests
 *     tags: [Connections]
 *     description: Retrieve a list of all pending connection requests for the logged-in user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Pending connection requests retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               pendingRequests: ["user123", "user456"]
 *       401:
 *         description: Unauthorized, user must be logged in
 */






// *********************************** Notifications APIs ******************************************//

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management API
 *
 * /notifications:
 *   get:
 *     summary: Get notifications for likes, comments, connection requests, and messages
 *     tags: [Notifications]
 *     description: Retrieve a list of notifications for the logged-in user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               notifications: [
 *                 {
 *                   id: "notif123",
 *                   from: "user456",
 *                   subject: "like",
 *                   text: "Alice liked your post",
 *                   isRead: false
 *                 },
 *                 {
 *                   id: "notif456",
 *                   from: "user789",
 *                   subject: "message",
 *                   text: "Bob sent you a message",
 *                   isRead: false
 *                 }
 *               ]
 *       401:
 *         description: Unauthorized, user must be logged in
 *
 * /notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     description: Updates a specific notification to mark it as read.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: notificationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Notification marked as read"
 *       404:
 *         description: Notification not found
 *
 * /notifications/unseenCount:
 *   get:
 *     summary: Get unseen notifications count
 *     tags: [Notifications]
 *     description: Returns the count of unseen notifications for the logged-in user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Unseen notifications count retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               unseenCount: 5
 *       401:
 *         description: Unauthorized, user must be logged in
 *
 * /notifications/pushToken:
 *   post:
 *     summary: Register or update push notification token
 *     tags: [Notifications]
 *     description: Allows users to register or update their Firebase Cloud Messaging (FCM) token for push notifications.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 example: "exampleFcmToken12345"
 *     responses:
 *       200:
 *         description: Push notification token registered successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Push notification token registered"
 *       400:
 *         description: Invalid request body
 */



// *********************************** Search APIs ******************************************//
/**
 * @swagger
 * tags:
 *   - name: Search
 *     description: API endpoints for search
 */

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search for users by name, company, or industry
 *     tags: [Search]
 *     description: Retrieve a list of users that match the search criteria (name, company, or industry).
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         description: Search query for user name, company, or industry
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               users: [
 *                 {
 *                   userId: "user123",
 *                   firstName: "John",
 *                   lastName: "Doe",
 *                   company: "Example Corp",
 *                   industry: "Technology"
 *                 },
 *                 {
 *                   userId: "user456",
 *                   firstName: "Jane",
 *                   lastName: "Smith",
 *                   company: "Acme Inc",
 *                   industry: "Finance"
 *                 }
 *               ]
 *       400:
 *         description: Invalid search query
 *       401:
 *         description: Unauthorized, user must be logged in
 */