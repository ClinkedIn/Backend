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
// *********************************** Companys APIs ***************************************//
/**
 * @swagger
 * tags:
 *   - name: Companys
 *     description: API endpoints for managing Companys
 */
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
