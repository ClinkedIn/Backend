/**
 * @swagger
 * /user/search:
 *   get:
 *     summary: Search for users
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: General search query
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Filter by company name
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: Filter by industry
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Results per page
 *     responses:
 *       200:
 *         description: List of users matching search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       company:
 *                         type: string
 *                       industry:
 *                         type: string
 *                       profilePicture:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     pages:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 * 
 * 
 * /user/connections:
 *   get:
 *     summary: Get user's connections list
 *     tags: [Connections & Networking]
 *     description: Retrieve paginated list of user's connections with basic profile information
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 100
 *         description: Number of connections per page
 *     responses:
 *       200:
 *         description: List of connections retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 connections:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Connection's user ID
 *                       firstName:
 *                         type: string
 *                         description: Connection's first name
 *                       lastName:
 *                         type: string
 *                         description: Connection's last name
 *                       profilePicture:
 *                         type: string
 *                         description: URL to connection's profile picture
 *                       company:
 *                         type: string
 *                         description: Connection's company name
 *                       position:
 *                         type: string
 *                         description: Connection's job position
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of connections
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     pages:
 *                       type: integer
 *                       description: Total number of pages
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 * /user/connections/request/{targetUserId}:
 *   post:
 *     summary: Send a connection request
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Connection request sent successfully
 *       400:
 *         description: Invalid request or already connected
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 * 
 * /user/connections/requests:
 *   get:
 *     summary: Get pending connection requests
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending connection requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       profilePicture:
 *                         type: string
 *                       headline:
 *                         type: string
 *
 * /user/connections/requests/{senderId}:
 *   patch:
 *     summary: Accept or decline a connection request
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: senderId
 *         required: true
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
 *     responses:
 *       200:
 *         description: Request handled successfully
 *
 * /user/connections/{connectionId}:
 *   delete:
 *     summary: Remove a connection
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Connection removed successfully
 *
 * /user/follow/{userId}:
 *   post:
 *     summary: Follow a user
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully followed user
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully unfollowed user
 *
 * /user/block/{userId}:
 *   post:
 *     summary: Block a user
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User blocked successfully
 *   delete:
 *     summary: Unblock a user
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unblocked successfully
 *
 * /user/blocked:
 *   get:
 *     summary: Get list of blocked users
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of blocked users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blockedUsers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       profilePicture:
 *                         type: string
 *
 * /user/message-requests:
 *   get:
 *     summary: Get message requests
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of message requests
 *   post:
 *     summary: Send a message request
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetUserId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message request sent successfully
 *
 * /user/message-requests/{requestId}:
 *   patch:
 *     summary: Accept or decline a message request
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
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
 *     responses:
 *       200:
 *         description: Message request handled successfully
 */
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
 *     description: Create a post with optional attachments and tagged users. Supports text content, image/video uploads, and user tagging.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Excited to share my latest project! #coding #nodejs"
 *                 description: The text content of the post (required)
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to attach to the post (max 10 files total, videos must be uploaded alone)
 *               taggedUsers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     userType:
 *                       type: string
 *                       enum: ["User", "Company"]
 *                       example: "User"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     companyName:
 *                       type: string
 *                       example: "Acme Inc"
 *                 description: Array of users tagged in the post
 *               whoCanSee:
 *                 type: string
 *                 enum: [anyone, connections]
 *                 default: anyone
 *                 example: "anyone"
 *                 description: Privacy setting for post visibility
 *               whoCanComment:
 *                 type: string
 *                 enum: [anyone, connections, noOne]
 *                 default: anyone
 *                 example: "anyone"
 *                 description: Privacy setting for who can comment on the post
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post created successfully"
 *                 post:
 *                   type: object
 *                   properties:
 *                     postId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     userId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c84"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     headline:
 *                       type: string
 *                       example: "Software Engineer at Tech Company"
 *                     postDescription:
 *                       type: string
 *                       example: "Excited to share my latest project! #coding #nodejs"
 *                     attachments:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "https://res.cloudinary.com/example/image/upload/v1625148732/attachments/image.jpg"
 *                     impressionTypes:
 *                       type: array
 *                       items:
 *                         type: string
 *                     impressionCounts:
 *                       type: object
 *                       properties:
 *                         like:
 *                           type: number
 *                           example: 0
 *                         support:
 *                           type: number
 *                           example: 0
 *                         celebrate:
 *                           type: number
 *                           example: 0
 *                         love:
 *                           type: number
 *                           example: 0
 *                         insightful:
 *                           type: number
 *                           example: 0
 *                         funny:
 *                           type: number
 *                           example: 0
 *                         total:
 *                           type: number
 *                           example: 0
 *                     commentCount:
 *                       type: number
 *                       example: 0
 *                     repostCount:
 *                       type: number
 *                       example: 0
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-18T12:30:45.123Z"
 *                     taggedUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c86"
 *                           userType:
 *                             type: string
 *                             example: "User"
 *                           firstName:
 *                             type: string
 *                             example: "Jane"
 *                           lastName:
 *                             type: string
 *                             example: "Smith"
 *                           companyName:
 *                             type: string
 *                             example: null
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post description is required"
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to create post"
 *                 error:
 *                   type: string
 *                   example: "Internal server error details"
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get feed posts including reposts
 *     tags: [Posts]
 *     description: Retrieve posts from connections, followed users, followed companies, and reposts from these users in chronological order.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       postId:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c85"
 *                       userId:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c84"
 *                       firstName:
 *                         type: string
 *                         example: "John"
 *                       lastName:
 *                         type: string
 *                         example: "Doe"
 *                       headline:
 *                         type: string
 *                         example: "Software Engineer at Tech Company"
 *                       profilePicture:
 *                         type: string
 *                         example: "https://res.cloudinary.com/example/image/upload/profile.jpg"
 *                       postDescription:
 *                         type: string
 *                         example: "Excited to share my latest project!"
 *                       attachments:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["https://res.cloudinary.com/example/image/upload/image.jpg"]
 *                       impressionCounts:
 *                         type: object
 *                         properties:
 *                           like:
 *                             type: number
 *                             example: 5
 *                           support:
 *                             type: number
 *                             example: 2
 *                           celebrate:
 *                             type: number
 *                             example: 3
 *                           love:
 *                             type: number
 *                             example: 1
 *                           insightful:
 *                             type: number
 *                             example: 4
 *                           funny:
 *                             type: number
 *                             example: 0
 *                           total:
 *                             type: number
 *                             example: 15
 *                       commentCount:
 *                         type: number
 *                         example: 3
 *                       repostCount:
 *                         type: number
 *                         example: 1
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-18T12:30:45.123Z"
 *                       taggedUsers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             userId:
 *                               type: string
 *                               example: "60d21b4667d0d8992e610c86"
 *                             userType:
 *                               type: string
 *                               example: "User"
 *                             firstName:
 *                               type: string
 *                               example: "Jane"
 *                             lastName:
 *                               type: string
 *                               example: "Smith"
 *                       isSaved:
 *                         type: boolean
 *                         example: true
 *                       isLiked:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "67f6e9cb34a9b18adec3b744"
 *                           userId:
 *                             type: string
 *                             example: "e6ade1a5da7abe26b8bf0b22"
 *                           targetId:
 *                             type: string
 *                             example: "d28373f0a7de2e82da302a5e"
 *                           targetType:
 *                             type: string
 *                             example: "Post"
 *                           type:
 *                             type: string
 *                             example: "like"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-04-09T21:42:35.825Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-04-09T21:42:35.825Z"
 *                           __v:
 *                             type: number
 *                             example: 0
 *                       isRepost:
 *                         type: boolean
 *                         example: true
 *                       repostId:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c87"
 *                       reposterId:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c88"
 *                       reposterFirstName:
 *                         type: string
 *                         example: "Robert"
 *                       reposterLastName:
 *                         type: string
 *                         example: "Johnson"
 *                       reposterProfilePicture:
 *                         type: string
 *                         example: "https://res.cloudinary.com/example/image/upload/profile2.jpg"
 *                       reposterHeadline:
 *                         type: string
 *                         example: "Marketing Manager at Company XYZ"
 *                       repostDescription:
 *                         type: string
 *                         example: "Great insights in this post!"
 *                       repostDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-19T10:15:30.123Z"
 *                 pagination:
 *                   type: object
 *                   description: Pagination metadata
 *                   properties:
 *                     total:
 *                       type: number
 *                       example: 25
 *                       description: Total number of reposts for this post
 *                     page:
 *                       type: number
 *                       example: 1
 *                       description: Current page number
 *                     limit:
 *                       type: number
 *                       example: 10
 *                       description: Number of results per page
 *                     pages:
 *                       type: number
 *                       example: 3
 *                       description: Total number of pages available
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                       description: Whether there is a next page available
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *                       description: Whether there is a previous page available
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch posts"
 *                 error:
 *                   type: string
 *                   example: "Internal server error details"
 */

/**
 * @swagger
 * /posts/{postId}:
 *   get:
 *     summary: Get a single post
 *     tags: [Posts]
 *     description: Retrieve a specific post by its ID. Honors post privacy settings and includes saved status.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to retrieve
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post retrieved successfully"
 *                 post:
 *                   type: object
 *                   properties:
 *                     postId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     userId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c84"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     headline:
 *                       type: string
 *                       example: "Software Engineer at Tech Company"
 *                     profilePicture:
 *                       type: string
 *                       example: "https://res.cloudinary.com/example/image/upload/profile.jpg"
 *                     postDescription:
 *                       type: string
 *                       example: "Excited to share my latest project!"
 *                     attachments:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["https://res.cloudinary.com/example/image/upload/image.jpg"]
 *                     impressionCounts:
 *                       type: object
 *                       properties:
 *                         like:
 *                           type: number
 *                           example: 5
 *                         support:
 *                           type: number
 *                           example: 2
 *                         celebrate:
 *                           type: number
 *                           example: 3
 *                         love:
 *                           type: number
 *                           example: 1
 *                         insightful:
 *                           type: number
 *                           example: 4
 *                         funny:
 *                           type: number
 *                           example: 0
 *                         total:
 *                           type: number
 *                           example: 15
 *                     commentCount:
 *                       type: number
 *                       example: 3
 *                     repostCount:
 *                       type: number
 *                       example: 1
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-18T12:30:45.123Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-19T14:45:30.123Z"
 *                     taggedUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c86"
 *                           userType:
 *                             type: string
 *                             example: "User"
 *                           firstName:
 *                             type: string
 *                             example: "Jane"
 *                           lastName:
 *                             type: string
 *                             example: "Smith"
 *                     whoCanSee:
 *                       type: string
 *                       enum: [anyone, connections]
 *                       example: "anyone"
 *                     whoCanComment:
 *                       type: string
 *                       enum: [anyone, connections, noOne]
 *                       example: "anyone"
 *                     isSaved:
 *                       type: boolean
 *                       example: true
 *                     isLiked:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "67f6e9cb34a9b18adec3b744"
 *                         userId:
 *                           type: string
 *                           example: "e6ade1a5da7abe26b8bf0b22"
 *                         targetId:
 *                           type: string
 *                           example: "d28373f0a7de2e82da302a5e"
 *                         targetType:
 *                           type: string
 *                           example: "Post"
 *                         type:
 *                           type: string
 *                           example: "like"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-04-09T21:42:35.825Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-04-09T21:42:35.825Z"
 *                         __v:
 *                           type: number
 *                           example: 0
 *                     isRepost:
 *                       type: boolean
 *                       example: true
 *                     repostId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c87"
 *                     reposterId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c88"
 *                     reposterFirstName:
 *                       type: string
 *                       example: "Robert"
 *                     reposterLastName:
 *                       type: string
 *                       example: "Johnson"
 *                     reposterProfilePicture:
 *                       type: string
 *                       example: "https://res.cloudinary.com/example/image/upload/profile2.jpg"
 *                     reposterHeadline:
 *                       type: string
 *                       example: "Marketing Manager at Company XYZ"
 *                     repostDescription:
 *                       type: string
 *                       example: "Great insights in this post!"
 *                     repostDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-19T10:15:30.123Z"
 *       400:
 *         description: Bad request - missing post ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post ID is required"
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       403:
 *         description: Forbidden - user doesn't have access to this post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "This post is only visible to the author's connections"
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve post"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

/**
 * @swagger
 * /posts/{postId}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     description: Performs a soft delete of a post by marking it as inactive. Only the post owner can delete their posts.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post deleted successfully"
 *       400:
 *         description: Bad request - missing post ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post ID is required"
 *       403:
 *         description: Forbidden - user is not the post owner
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You can only delete your own posts"
 *       404:
 *         description: Post not found or already deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post not found or already deleted"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to delete post"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

/**
 * @swagger
 * /posts/{postId}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     description: Updates a post's description and/or tagged users. Only the post owner can update their posts.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: The updated text content of the post
 *                 example: "Updated post description with new information"
 *               taggedUsers:
 *                 type: array
 *                 description: List of users tagged in the post
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c86"
 *                     userType:
 *                       type: string
 *                       enum: ["User", "Company"]
 *                       example: "User"
 *                     firstName:
 *                       type: string
 *                       example: "Jane"
 *                     lastName:
 *                       type: string
 *                       example: "Smith"
 *                     companyName:
 *                       type: string
 *                       example: null
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post updated successfully"
 *                 post:
 *                   type: object
 *                   properties:
 *                     postId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     userId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c84"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     headline:
 *                       type: string
 *                       example: "Software Engineer at Tech Company"
 *                     profilePicture:
 *                       type: string
 *                       example: "https://res.cloudinary.com/example/image/upload/profile.jpg"
 *                     postDescription:
 *                       type: string
 *                       example: "Updated post description with new information"
 *                     attachments:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "https://res.cloudinary.com/example/image/upload/image.jpg"
 *                     impressionCounts:
 *                       type: object
 *                       properties:
 *                         like:
 *                           type: number
 *                           example: 5
 *                         support:
 *                           type: number
 *                           example: 2
 *                         celebrate:
 *                           type: number
 *                           example: 3
 *                         love:
 *                           type: number
 *                           example: 1
 *                         insightful:
 *                           type: number
 *                           example: 4
 *                         funny:
 *                           type: number
 *                           example: 0
 *                         total:
 *                           type: number
 *                           example: 15
 *                     commentCount:
 *                       type: number
 *                       example: 3
 *                     repostCount:
 *                       type: number
 *                       example: 1
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-15T12:30:45.123Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-19T14:45:30.123Z"
 *                     taggedUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c86"
 *                           userType:
 *                             type: string
 *                             example: "User"
 *                           firstName:
 *                             type: string
 *                             example: "Jane"
 *                           lastName:
 *                             type: string
 *                             example: "Smith"
 *       400:
 *         description: Bad request - invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post description cannot be empty"
 *       403:
 *         description: Forbidden - user is not the post owner
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You can only update your own posts"
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to update post"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

/**
 * @swagger
 * /posts/{postId}/save:
 *   post:
 *     summary: Save a post
 *     tags: [Posts]
 *     description: Save a post to the user's saved posts collection
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to save
 *     responses:
 *       200:
 *         description: Post saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post saved successfully"
 *       400:
 *         description: Bad request - missing post ID or post already saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post ID is required"
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       404:
 *         description: Post not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post not found or inactive"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to save post"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

/**
 * @swagger
 * /posts/{postId}/like:
 *   post:
 *     summary: Like or react to a post
 *     tags: [Posts]
 *     description: Add a reaction to a post (like, support, celebrate, etc.)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to like
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               impressionType:
 *                 type: string
 *                 enum: [like, support, celebrate, love, insightful, funny]
 *                 default: like
 *                 description: Type of reaction to add to the post
 *     responses:
 *       200:
 *         description: Post liked successfully or impression changed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post liked successfully"
 *                 impressionCounts:
 *                   type: object
 *                   properties:
 *                     like:
 *                       type: number
 *                       example: 5
 *                     support:
 *                       type: number
 *                       example: 2
 *                     celebrate:
 *                       type: number
 *                       example: 3
 *                     love:
 *                       type: number
 *                       example: 1
 *                     insightful:
 *                       type: number
 *                       example: 4
 *                     funny:
 *                       type: number
 *                       example: 0
 *                     total:
 *                       type: number
 *                       example: 15
 *       400:
 *         description: Bad request - missing post ID, invalid impression type, or user already liked this post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You have already liked this post"
 *                 validTypes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["like", "support", "celebrate", "love", "insightful", "funny"]
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       404:
 *         description: Post not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post not found or inactive"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to like post"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 *
 *   delete:
 *     summary: Unlike or remove reaction from a post
 *     tags: [Posts]
 *     description: Remove a user's reaction from a post
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to unlike
 *     responses:
 *       200:
 *         description: Reaction removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post like removed successfully"
 *                 impressionCounts:
 *                   type: object
 *                   properties:
 *                     like:
 *                       type: number
 *                       example: 4
 *                     support:
 *                       type: number
 *                       example: 2
 *                     celebrate:
 *                       type: number
 *                       example: 3
 *                     love:
 *                       type: number
 *                       example: 1
 *                     insightful:
 *                       type: number
 *                       example: 4
 *                     funny:
 *                       type: number
 *                       example: 0
 *                     total:
 *                       type: number
 *                       example: 14
 *       400:
 *         description: Bad request - missing post ID or user hasn't reacted to this post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You have not reacted to this post"
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       404:
 *         description: Post not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post not found or inactive"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to remove post impression"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

/**
 * @swagger
 * /posts/{postId}/repost:
 *   post:
 *     summary: Repost a post
 *     tags: [Posts]
 *     description: Create a repost of an existing post with optional description
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to repost
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: Optional description to add to the repost
 *     responses:
 *       201:
 *         description: Post reposted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post reposted successfully"
 *                 repost:
 *                   type: object
 *                   properties:
 *                     repostId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     originalPostId:
 *                       type: string
 *                       example: "60d21b1c67d0d8992e610c83"
 *                     userId:
 *                       type: string
 *                       example: "60d0fe4677975f4ae0329ea4"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     headline:
 *                       type: string
 *                       example: "Software Engineer at XYZ Corp"
 *                     profilePicture:
 *                       type: string
 *                       example: "https://res.cloudinary.com/example/image/upload/v1624420422/profile/user123.jpg"
 *                     repostDescription:
 *                       type: string
 *                       example: "This is a great post that I wanted to share!"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-03-22T14:30:00.000Z"
 *       400:
 *         description: Bad request - missing post ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post ID is required"
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       404:
 *         description: Post not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post not found or inactive"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to repost post"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

/**
 * @swagger
 * /posts/{repostId}/repost:
 *   delete:
 *     summary: Delete a repost
 *     tags: [Posts]
 *     description: Remove a repost from the user's profile by setting it to inactive. Only the owner of the repost can delete it.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: repostId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the repost to delete
 *     responses:
 *       200:
 *         description: Repost deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Repost deleted successfully"
 *       400:
 *         description: Bad request - missing repost ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Repost ID is required"
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       403:
 *         description: Forbidden - user is not the owner of the repost
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You can only delete your own reposts"
 *       404:
 *         description: Repost not found or already deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Repost not found or already deleted"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to delete repost"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

/**
 * @swagger
 * /posts/{postId}/report:
 *   post:
 *     summary: Report a post for policy violations
 *     tags: [Posts]
 *     description: Report a post for violating platform policies. Users can specify a policy violation reason and optionally indicate why they don't want to see similar content.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to report
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - policy
 *             properties:
 *               policy:
 *                 type: string
 *                 enum: [
 *                   "Harassment",
 *                   "Fraud or scam",
 *                   "Spam",
 *                   "Misinformation",
 *                   "Hateful speech",
 *                   "Threats or violence",
 *                   "Self-harm",
 *                   "Graphic content",
 *                   "Dangerous or extremist organizations",
 *                   "Sexual content",
 *                   "Fake account",
 *                   "Child exploitation",
 *                   "Illegal goods and services",
 *                   "Infringement",
 *                   "This person is impersonating someone",
 *                   "This account has been hacked",
 *                   "This account is not a real person"
 *                 ]
 *                 description: Reason for reporting the post (policy violation type)
 *                 example: "Misinformation"
 *               dontWantToSee:
 *                 type: string
 *                 enum: [
 *                   "I'm not interested in the author",
 *                   "I'm not interested in this topic",
 *                   "I've seen too many posts on this topic",
 *                   "I've seen this post before",
 *                   "This post is old",
 *                   "It's something else"
 *                 ]
 *                 description: Optional reason why the user doesn't want to see similar content
 *                 example: "I'm not interested in this topic"
 *     responses:
 *       201:
 *         description: Post reported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post reported successfully"
 *                 reportId:
 *                   type: string
 *                   example: "60d21b4667d0d8992e610c85"
 *       400:
 *         description: Bad request - missing required fields or invalid reason
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid report reason"
 *                 validReasons:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Harassment", "Fraud or scam", "Spam", "Misinformation", "Hateful speech", "Threats or violence", "Self-harm", "Graphic content", "Dangerous or extremist organizations", "Sexual content", "Fake account", "Child
 * exploitation", "Illegal goods and services", "Infringement", "This person is impersonating someone", "This account has been hacked", "This account is not a real person"]
 *             examples:
 *               invalidPolicy:
 *                 summary: Invalid policy violation reason
 *                 value:
 *                   message: "Invalid report reason"
 *                   validReasons: ["Harassment", "Fraud or scam", "Spam", "Misinformation", "Hateful speech", "Threats or violence", "Self-harm", "Graphic content", "Dangerous or extremist organizations", "Sexual content", "Fake account", "Child exploitation", "Illegal goods and services", "Infringement", "This person is impersonating someone", "This account has been hacked", "This account is not a real person"]
 *               invalidDontWantToSee:
 *                 summary: Invalid "don't want to see" reason
 *                 value:
 *                   message: "Invalid \"don't want to see\" reason"
 *                   validReasons: ["I'm not interested in the author", "I'm not interested in this topic", "I've seen too many posts on this topic", "I've seen this post before", "This post is old", "It's something else"]
 *               missingPolicy:
 *                 summary: Missing policy violation reason
 *                 value:
 *                   message: "Report reason (policy) is required"
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       404:
 *         description: Post not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post not found or inactive"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to report post"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

/**
 * @swagger
 * tags:
 *   - name: Comments
 *     description: API endpoints for managing Comments and Replies
 *   - name: Connections & Networking
 *     description: API endpoints for managing user connections, follows, blocks and messaging requests
 */

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Add a new comment or reply to a post
 *     tags: [Comments]
 *     description: Create a new comment on a post or reply to an existing comment with optional image attachment and user tagging
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *             properties:
 *               postId:
 *                 type: string
 *                 description: ID of the post being commented on
 *                 example: "65fb2a8e7c5721f123456789"
 *               commentContent:
 *                 type: string
 *                 description: Text content of the comment
 *                 example: "This is a great post! Thanks for sharing."
 *               commentAttachment:
 *                 type: string
 *                 description: URL of an image (alternative to file upload)
 *                 example: "https://example.com/image.jpg"
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file to attach to the comment (only images allowed)
 *               taggedUsers:
 *                 type: array
 *                 description: Array of users tagged in the comment
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: ID of the tagged user
 *                       example: "65fb2a8e7c5721f987654321"
 *                     userType:
 *                       type: string
 *                       enum: ["User", "Company"]
 *                       default: "User"
 *                       description: Type of the tagged entity
 *                       example: "User"
 *                     firstName:
 *                       type: string
 *                       description: First name of the tagged user
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       description: Last name of the tagged user
 *                       example: "Doe"
 *                     companyName:
 *                       type: string
 *                       description: Name of the tagged company (if userType is Company)
 *                       example: "Acme Corporation"
 *               parentComment:
 *                 type: string
 *                 description: ID of the parent comment if this is a reply
 *                 example: "65fb2a8e7c5721f123456790"
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment added successfully"
 *                 id:
 *                   type: string
 *                   example: "65fb2a8e7c5721f123456791"
 *                 comment:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "65fb2a8e7c5721f123456791"
 *                     userId:
 *                       type: string
 *                       example: "65fb2a8e7c5721f123456788"
 *                     postId:
 *                       type: string
 *                       example: "65fb2a8e7c5721f123456789"
 *                     commentContent:
 *                       type: string
 *                       example: "This is a great post! Thanks for sharing."
 *                     commentAttachment:
 *                       type: string
 *                       example: "https://res.cloudinary.com/example/image/upload/v1625148732/attachments/image.jpg"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     headline:
 *                       type: string
 *                       example: "Software Engineer at Tech Company"
 *                     profilePicture:
 *                       type: string
 *                       example: "https://res.cloudinary.com/example/image/upload/profile.jpg"
 *                     taggedUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             example: "65fb2a8e7c5721f987654321"
 *                           userType:
 *                             type: string
 *                             example: "User"
 *                           firstName:
 *                             type: string
 *                             example: "Jane"
 *                           lastName:
 *                             type: string
 *                             example: "Smith"
 *                           companyName:
 *                             type: string
 *                             example: null
 *                     impressionCounts:
 *                       type: object
 *                       properties:
 *                         like:
 *                           type: number
 *                           example: 0
 *                         support:
 *                           type: number
 *                           example: 0
 *                         celebrate:
 *                           type: number
 *                           example: 0
 *                         love:
 *                           type: number
 *                           example: 0
 *                         insightful:
 *                           type: number
 *                           example: 0
 *                         funny:
 *                           type: number
 *                           example: 0
 *                         total:
 *                           type: number
 *                           example: 0
 *                     impressions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *                     replies:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *                     replyCount:
 *                       type: number
 *                       example: 0
 *                     parentComment:
 *                       type: string
 *                       nullable: true
 *                       example: "65fb2a8e7c5721f123456790"
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-18T12:30:45.123Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-18T12:30:45.123Z"
 *       400:
 *         description: Bad request - missing required fields or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post ID and comment content are required"
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to add comment"
 *                 error:
 *                   type: string
 *                   example: "Error message details"
 */

/**
 * @swagger
 * /comments/{commentId}:
 *   put:
 *     summary: Update an existing comment
 *     tags: [Comments]
 *     description: Edit a comment's content and/or tagged users. Only the comment owner can edit their own comments.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment to update
 *         example: "65fb2a8e7c5721f123456791"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commentContent:
 *                 type: string
 *                 description: Updated text content of the comment
 *                 example: "Updated comment content with additional thoughts."
 *               taggedUsers:
 *                 type: array
 *                 description: Updated array of users tagged in the comment
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: ID of the tagged user
 *                       example: "65fb2a8e7c5721f987654321"
 *                     userType:
 *                       type: string
 *                       enum: ["User", "Company"]
 *                       default: "User"
 *                       description: Type of the tagged entity
 *                       example: "User"
 *                     firstName:
 *                       type: string
 *                       description: First name of the tagged user
 *                       example: "Jane"
 *                     lastName:
 *                       type: string
 *                       description: Last name of the tagged user
 *                       example: "Smith"
 *                     companyName:
 *                       type: string
 *                       description: Name of the tagged company (if userType is Company)
 *                       example: null
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment updated successfully"
 *                 id:
 *                   type: string
 *                   example: "65fb2a8e7c5721f123456791"
 *                 comment:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "65fb2a8e7c5721f123456791"
 *                     userId:
 *                       type: string
 *                       example: "65fb2a8e7c5721f123456788"
 *                     postId:
 *                       type: string
 *                       example: "65fb2a8e7c5721f123456789"
 *                     commentContent:
 *                       type: string
 *                       example: "Updated comment content with additional thoughts."
 *                     commentAttachment:
 *                       type: string
 *                       example: "https://res.cloudinary.com/example/image/upload/v1625148732/attachments/image.jpg"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     headline:
 *                       type: string
 *                       example: "Software Engineer at Tech Company"
 *                     profilePicture:
 *                       type: string
 *                       example: "https://res.cloudinary.com/example/image/upload/profile.jpg"
 *                     taggedUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             example: "65fb2a8e7c5721f987654321"
 *                           userType:
 *                             type: string
 *                             example: "User"
 *                           firstName:
 *                             type: string
 *                             example: "Jane"
 *                           lastName:
 *                             type: string
 *                             example: "Smith"
 *                           companyName:
 *                             type: string
 *                             example: null
 *                     impressionCounts:
 *                       type: object
 *                       properties:
 *                         like:
 *                           type: number
 *                           example: 2
 *                         support:
 *                           type: number
 *                           example: 1
 *                         celebrate:
 *                           type: number
 *                           example: 0
 *                         love:
 *                           type: number
 *                           example: 3
 *                         insightful:
 *                           type: number
 *                           example: 1
 *                         funny:
 *                           type: number
 *                           example: 0
 *                         total:
 *                           type: number
 *                           example: 7
 *                     impressions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["65fb2a8e7c5721f123456792", "65fb2a8e7c5721f123456793"]
 *                     replies:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["65fb2a8e7c5721f123456794"]
 *                     replyCount:
 *                       type: number
 *                       example: 1
 *                     parentComment:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-18T12:30:45.123Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-18T14:45:20.456Z"
 *       400:
 *         description: Bad request - missing required fields or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No changes provided for update"
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       403:
 *         description: Forbidden - user is not the owner of the comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You can only edit your own comments"
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to update comment"
 *                 error:
 *                   type: string
 *                   example: "Error message details"
 */

/**
 * @swagger
 * /comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     description: Soft delete a comment by setting isActive to false. Only the comment owner can delete their own comments.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment to delete
 *         example: "65fb2a8e7c5721f123456791"
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment deleted successfully"
 *       400:
 *         description: Bad request - missing comment ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment ID is required"
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       403:
 *         description: Forbidden - user is not the owner of the comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You can only delete your own comments"
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to delete comment"
 *                 error:
 *                   type: string
 *                   example: "Error message details"
 */

/**
 * @swagger
 * /comments/{commentId}:
 *   get:
 *     summary: Get a single comment by ID
 *     tags: [Comments]
 *     description: Retrieve a specific comment by its ID with enhanced user information
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment to retrieve
 *         example: "65fb2a8e7c5721f123456791"
 *     responses:
 *       200:
 *         description: Comment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment retrieved successfully"
 *                 comment:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "65fb2a8e7c5721f123456791"
 *                     userId:
 *                       type: string
 *                       example: "65fb2a8e7c5721f123456788"
 *                     postId:
 *                       type: string
 *                       example: "65fb2a8e7c5721f123456789"
 *                     commentContent:
 *                       type: string
 *                       example: "This is a detailed comment about this interesting post."
 *                     commentAttachment:
 *                       type: string
 *                       example: "https://res.cloudinary.com/example/image/upload/v1625148732/attachments/image.jpg"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     headline:
 *                       type: string
 *                       example: "Software Engineer at Tech Company"
 *                     profilePicture:
 *                       type: string
 *                       example: "https://res.cloudinary.com/example/image/upload/profile.jpg"
 *                     taggedUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             example: "65fb2a8e7c5721f987654321"
 *                           userType:
 *                             type: string
 *                             example: "User"
 *                           firstName:
 *                             type: string
 *                             example: "Jane"
 *                           lastName:
 *                             type: string
 *                             example: "Smith"
 *                           companyName:
 *                             type: string
 *                             example: null
 *                     impressionCounts:
 *                       type: object
 *                       properties:
 *                         like:
 *                           type: number
 *                           example: 5
 *                         support:
 *                           type: number
 *                           example: 2
 *                         celebrate:
 *                           type: number
 *                           example: 1
 *                         love:
 *                           type: number
 *                           example: 3
 *                         insightful:
 *                           type: number
 *                           example: 4
 *                         funny:
 *                           type: number
 *                           example: 0
 *                         total:
 *                           type: number
 *                           example: 15
 *                     impressions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["65fb2a8e7c5721f123456792", "65fb2a8e7c5721f123456793"]
 *                     replies:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["65fb2a8e7c5721f123456794", "65fb2a8e7c5721f123456795"]
 *                     replyCount:
 *                       type: number
 *                       example: 2
 *                     parentComment:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-18T12:30:45.123Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-18T12:30:45.123Z"
 *       400:
 *         description: Bad request - missing comment ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment ID is required"
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       404:
 *         description: Comment not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to get comment"
 *                 error:
 *                   type: string
 *                   example: "Error message details"
 */

/**
 * @swagger
 * /comments/{commentId}/like:
 *   post:
 *     summary: Add an impression (like, celebrate, etc.) to a comment
 *     tags: [Comments]
 *     description: Add or change an impression on a comment. Users can add various types of impressions (like, celebrate, support, etc.) to express their reaction to a comment.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment to add an impression to
 *         example: "65fb2a8e7c5721f123456791"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               impressionType:
 *                 type: string
 *                 enum: [like, support, celebrate, love, insightful, funny]
 *                 default: like
 *                 description: Type of impression to add to the comment
 *                 example: "love"
 *           examples:
 *             like:
 *               summary: Default like impression
 *               value:
 *                 impressionType: "like"
 *             celebrate:
 *               summary: Celebrate impression
 *               value:
 *                 impressionType: "celebrate"
 *             love:
 *               summary: Love impression
 *               value:
 *                 impressionType: "love"
 *     responses:
 *       200:
 *         description: Impression added or changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment loved successfully"
 *                 impressionCounts:
 *                   type: object
 *                   properties:
 *                     like:
 *                       type: number
 *                       example: 5
 *                     support:
 *                       type: number
 *                       example: 2
 *                     celebrate:
 *                       type: number
 *                       example: 1
 *                     love:
 *                       type: number
 *                       example: 4
 *                     insightful:
 *                       type: number
 *                       example: 3
 *                     funny:
 *                       type: number
 *                       example: 0
 *                     total:
 *                       type: number
 *                       example: 15
 *             examples:
 *               newImpression:
 *                 summary: New impression added
 *                 value:
 *                   message: "Comment loved successfully"
 *                   impressionCounts:
 *                     like: 5
 *                     support: 2
 *                     celebrate: 1
 *                     love: 4
 *                     insightful: 3
 *                     funny: 0
 *                     total: 15
 *               changedImpression:
 *                 summary: Impression type changed
 *                 value:
 *                   message: "Impression changed from like to love"
 *                   impressionCounts:
 *                     like: 4
 *                     support: 2
 *                     celebrate: 1
 *                     love: 4
 *                     insightful: 3
 *                     funny: 0
 *                     total: 14
 *       400:
 *         description: Bad request - invalid input, duplicate impression, or invalid impression type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You have already liked this comment"
 *                 validTypes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["like", "support", "celebrate", "love", "insightful", "funny"]
 *             examples:
 *               duplicateImpression:
 *                 summary: User has already added this impression type
 *                 value:
 *                   message: "You have already liked this comment"
 *               invalidImpressionType:
 *                 summary: Invalid impression type provided
 *                 value:
 *                   message: "Invalid impression type"
 *                   validTypes: ["like", "support", "celebrate", "love", "insightful", "funny"]
 *               missingCommentId:
 *                 summary: Missing comment ID
 *                 value:
 *                   message: "Comment ID is required"
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       404:
 *         description: Comment not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment not found or inactive"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to like comment"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 *
 *   delete:
 *     summary: Remove an impression from a comment
 *     tags: [Comments]
 *     description: Remove a user's impression (like, celebrate, etc.) from a comment
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment to remove the impression from
 *         example: "65fb2a8e7c5721f123456791"
 *     responses:
 *       200:
 *         description: Impression removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment like removed successfully"
 *                 impressionCounts:
 *                   type: object
 *                   properties:
 *                     like:
 *                       type: number
 *                       example: 4
 *                     support:
 *                       type: number
 *                       example: 2
 *                     celebrate:
 *                       type: number
 *                       example: 1
 *                     love:
 *                       type: number
 *                       example: 3
 *                     insightful:
 *                       type: number
 *                       example: 3
 *                     funny:
 *                       type: number
 *                       example: 0
 *                     total:
 *                       type: number
 *                       example: 13
 *       400:
 *         description: Bad request - missing comment ID or no impression found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               noImpression:
 *                 summary: User has no impression on this comment
 *                 value:
 *                   message: "You have not reacted to this comment"
 *               missingCommentId:
 *                 summary: Missing comment ID
 *                 value:
 *                   message: "Comment ID is required"
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       404:
 *         description: Comment not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment not found or inactive"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to remove comment impression"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

/**
 * @swagger
 * /comments/{postId}/post:
 *   get:
 *     summary: Get comments for a specific post
 *     tags: [Comments]
 *     description: Retrieve paginated top-level comments for a post (excluding replies). Results include user information and pagination metadata.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to get comments for
 *         example: "65fb2a8e7c5721f123456789"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination (defaults to 1)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Number of comments per page (defaults to 10)
 *         example: 10
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comments retrieved successfully"
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "65fb2a8e7c5721f123456791"
 *                       userId:
 *                         type: string
 *                         example: "65fb2a8e7c5721f123456788"
 *                       postId:
 *                         type: string
 *                         example: "65fb2a8e7c5721f123456789"
 *                       commentContent:
 *                         type: string
 *                         example: "This is a great post! Thanks for sharing."
 *                       commentAttachment:
 *                         type: string
 *                         example: "https://res.cloudinary.com/example/image/upload/v1625148732/attachments/image.jpg"
 *                       firstName:
 *                         type: string
 *                         example: "John"
 *                       lastName:
 *                         type: string
 *                         example: "Doe"
 *                       headline:
 *                         type: string
 *                         example: "Software Engineer at Tech Company"
 *                       profilePicture:
 *                         type: string
 *                         example: "https://res.cloudinary.com/example/image/upload/profile.jpg"
 *                       taggedUsers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             userId:
 *                               type: string
 *                               example: "65fb2a8e7c5721f987654321"
 *                             userType:
 *                               type: string
 *                               example: "User"
 *                             firstName:
 *                               type: string
 *                               example: "Jane"
 *                             lastName:
 *                               type: string
 *                               example: "Smith"
 *                             companyName:
 *                               type: string
 *                               example: null
 *                       impressionCounts:
 *                         type: object
 *                         properties:
 *                           like:
 *                             type: number
 *                             example: 5
 *                           support:
 *                             type: number
 *                             example: 2
 *                           celebrate:
 *                             type: number
 *                             example: 1
 *                           love:
 *                             type: number
 *                             example: 3
 *                           insightful:
 *                             type: number
 *                             example: 4
 *                           funny:
 *                             type: number
 *                             example: 0
 *                           total:
 *                             type: number
 *                             example: 15
 *                       impressions:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["65fb2a8e7c5721f123456792", "65fb2a8e7c5721f123456793"]
 *                       replies:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["65fb2a8e7c5721f123456794", "65fb2a8e7c5721f123456795"]
 *                       replyCount:
 *                         type: number
 *                         example: 2
 *                       parentComment:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-18T12:30:45.123Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-18T12:30:45.123Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalComments:
 *                       type: number
 *                       example: 25
 *                     totalPages:
 *                       type: number
 *                       example: 3
 *                     currentPage:
 *                       type: number
 *                       example: 1
 *                     pageSize:
 *                       type: number
 *                       example: 10
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Bad request - missing post ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post ID is required"
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to get comments"
 *                 error:
 *                   type: string
 *                   example: "Error message details"
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

/**
 * @swagger
 * /messages/block/{userId}:
 *   post:
 *     summary: Block a user from messaging
 *     tags: [Messages]
 *     description: Blocks a user, preventing them from sending messages to the authenticated user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user to block
 *     responses:
 *       200:
 *         description: User blocked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User blocked successfully"
 *                 blockedUserId:
 *                   type: string
 *                   format: uuid
 *                   example: "60d21b4667d0d8992e610c85"
 *       400:
 *         description: Bad request - missing user ID or user already blocked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User ID is required"
 *             examples:
 *               missingId:
 *                 summary: Missing user ID
 *                 value:
 *                   message: "User ID is required"
 *               alreadyBlocked:
 *                 summary: User already blocked
 *                 value:
 *                   message: "User is already blocked"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

/**
 * @swagger
 * /messages/unblock/{userId}:
 *   post:
 *     summary: Unblock a user from messaging
 *     tags: [Messages]
 *     description: Unblocks a previously blocked user, allowing them to send messages to the authenticated user again
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user to unblock
 *     responses:
 *       200:
 *         description: User unblocked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User unblocked successfully"
 *       400:
 *         description: Bad request - missing user ID or user not blocked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User ID is required"
 *             examples:
 *               missingId:
 *                 summary: Missing user ID
 *                 value:
 *                   message: "User ID is required"
 *               notBlocked:
 *                 summary: User not blocked
 *                 value:
 *                   message: "User is not blocked"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

/**
 * @swagger
 * /messages/unread-count:
 *   get:
 *     summary: Get total unread message count
 *     tags: [Messages]
 *     description: Returns the total count of unread messages across all chats for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Total unread count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Total unread count fetched successfully"
 *                 totalUnread:
 *                   type: integer
 *                   description: The total number of unread messages
 *                   example: 15
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

// *********************************** Chat APIs ***************************************//

/**
 * @swagger
 * tags:
 *   name: Chats
 *   description: Chat management APIs
 */

/**
 * @swagger
 * /api/chats/group-chat:
 *   post:
 *     summary: Create a new group chat
 *     description: Creates a new group chat with specified members and the authenticated user as admin
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupName
 *               - goupMembers
 *             properties:
 *               groupName:
 *                 type: string
 *                 description: Name of the group chat
 *               goupMembers:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of user IDs to add to the group
 *             example:
 *               groupName: "Project Team"
 *               goupMembers: ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c86"]
 *     responses:
 *       201:
 *         description: Group chat created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Group chat created successfully"
 *                 groupChat:
 *                   example:
 *                      _id: "60d21b4667d0d8992e610c87"
 *                      groupName: "Project Team"
 *                      members: ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c86"]
 *                      messages: []
 *                      isActive: true
 *                      createdAt: "2023-10-01T12:00:00Z"
 *                      updatedAt: "2023-10-01T12:00:00Z"
 *
 *       400:
 *         description: Invalid input data or validation error
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error or failed to create group chat
 */

/**
 * @swagger
 * /api/chats/direct-chat/{chatId}:
 *   get:
 *     summary: Get a direct chat by ID
 *     description: Retrieves a direct chat by its ID, including message history and other user details. Also marks messages as read for the authenticated user.
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the direct chat to retrieve
 *     responses:
 *       200:
 *         description: Direct chat retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 chat:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       format: uuid
 *                       description: ID of the chat
 *                     members:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: uuid
 *                       description: Array of user IDs in the chat
 *                     conversationHistory:
 *                       type: array
 *                       description: Messages grouped by date
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             example: "Mar 15, 2025"
 *                           messages:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/MessageWithFormatting'
 *                     rawMessages:
 *                       type: array
 *                       description: Flat list of all messages sorted chronologically
 *                       items:
 *                         $ref: '#/components/schemas/MessageWithFormatting'
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 otherUser:
 *                   type: object
 *                   description: Details of the other user in the chat
 *                   properties:
 *                     _id:
 *                       type: string
 *                       format: uuid
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     profilePicture:
 *                       type: string
 *                       format: uri
 *                     headLine:
 *                       type: string
 *                 chatInfo:
 *                   type: object
 *                   properties:
 *                     chatType:
 *                       type: string
 *                       example: "direct"
 *                     lastActive:
 *                       type: string
 *                       format: date-time
 *                     unreadCount:
 *                       type: integer
 *                       example: 0
 *       400:
 *         description: Invalid chat ID format
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Not authorized to access this chat
 *       404:
 *         description: Chat or user not found
 *       500:
 *         description: Internal server error or invalid chat structure
 */

/**
 * @swagger
 * /api/chats/all-chats:
 *   get:
 *     summary: Get all chats for the authenticated user
 *     description: Returns all direct and group chats for the authenticated user, with preview information including latest message and unread counts.
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All chats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 totalChats:
 *                   type: integer
 *                   description: Total number of chats
 *                   example: 5
 *                 totalUnread:
 *                   type: integer
 *                   description: Total number of unread messages across all chats
 *                   example: 8
 *                 chats:
 *                   type: array
 *                   description: List of all chats sorted by last activity (most recent first)
 *                   items:
 *                     oneOf:
 *                       - $ref: '#/components/schemas/DirectChatPreview'
 *                       - $ref: '#/components/schemas/GroupChatPreview'
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/chats/group/{chatId}:
 *   get:
 *     summary: Get a group chat by ID
 *     description: Retrieves a group chat by its ID, including message history and member details
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the group chat to retrieve
 *     responses:
 *       200:
 *         description: Group chat retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dummy data"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/chats/direct/{chatId}:
 *   put:
 *     summary: Update a direct chat
 *     description: Updates direct chat settings such as muting, archiving or starring
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the direct chat to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               muted:
 *                 type: boolean
 *                 description: Whether the chat is muted
 *               archived:
 *                 type: boolean
 *                 description: Whether the chat is archived
 *               starred:
 *                 type: boolean
 *                 description: Whether the chat is starred
 *     responses:
 *       200:
 *         description: Direct chat updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dummy data"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/chats/group/{chatId}:
 *   put:
 *     summary: Update a group chat
 *     description: Updates group chat settings or details such as name, members, or user-specific settings
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the group chat to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the group
 *               muted:
 *                 type: boolean
 *                 description: Whether the chat is muted for the user
 *               archived:
 *                 type: boolean
 *                 description: Whether the chat is archived for the user
 *               starred:
 *                 type: boolean
 *                 description: Whether the chat is starred for the user
 *     responses:
 *       200:
 *         description: Group chat updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dummy data"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/chats/mark-as-read/{chatId}:
 *   patch:
 *     summary: Mark a chat as read
 *     description: Marks all messages in a chat as read for the authenticated user by setting unread count to zero
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the chat to mark as read
 *     responses:
 *       200:
 *         description: Chat marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Chat marked as read successfully"
 *       400:
 *         description: Invalid chat ID format
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: User or chat not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/chats/mark-as-unread/{chatId}:
 *   patch:
 *     summary: Mark a chat as unread
 *     description: Marks a chat as unread for the authenticated user by incrementing the unread count
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the chat to mark as unread
 *     responses:
 *       200:
 *         description: Chat marked as unread successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Chat marked as unread successfully"
 *       400:
 *         description: Invalid chat ID format
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: User or chat not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DirectChat:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the chat
 *         members:
 *           type: array
 *           description: Array of user IDs who are members of this chat
 *           items:
 *             type: string
 *             format: uuid
 *         messages:
 *           type: array
 *           description: Array of message IDs in this chat
 *           items:
 *             type: string
 *             format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the chat was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the chat was last updated
 *       example:
 *         _id: "60d21b4667d0d8992e610c87"
 *         members: ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c86"]
 *         messages: ["60d21b4667d0d8992e610c88", "60d21b4667d0d8992e610c89"]
 *         createdAt: "2025-03-15T10:00:00.000Z"
 *         updatedAt: "2025-03-15T14:30:00.000Z"
 *
 *     GroupChat:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the group chat
 *         name:
 *           type: string
 *           description: Name of the group chat
 *         members:
 *           type: array
 *           description: Array of user IDs who are members of this group
 *           items:
 *             type: string
 *             format: uuid
 *         messages:
 *           type: array
 *           description: Array of message IDs in this group chat
 *           items:
 *             type: string
 *             format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the group chat was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the group chat was last updated
 *       example:
 *         _id: "60d21b4667d0d8992e610c90"
 *         name: "Project Team"
 *         members: ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c86", "60d21b4667d0d8992e610c87"]
 *         messages: ["60d21b4667d0d8992e610c91", "60d21b4667d0d8992e610c92"]
 *         createdAt: "2025-03-15T10:00:00.000Z"
 *         updatedAt: "2025-03-15T14:30:00.000Z"
 *
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the message
 *         sender:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               format: uuid
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             profilePicture:
 *               type: string
 *               format: uri
 *         messageText:
 *           type: string
 *           description: Text content of the message
 *         messageAttachment:
 *           type: array
 *           description: Array of attachment URLs
 *           items:
 *             type: string
 *             format: uri
 *         replyTo:
 *           type: object
 *           description: Reference to the message being replied to (if any)
 *           properties:
 *             _id:
 *               type: string
 *               format: uuid
 *             messageText:
 *               type: string
 *             sender:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   format: uuid
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *             createdAt:
 *               type: string
 *               format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the message was sent
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the message was last updated
 *       example:
 *         _id: "60d21b4667d0d8992e610c88"
 *         sender:
 *           _id: "60d21b4667d0d8992e610c85"
 *           firstName: "John"
 *           lastName: "Doe"
 *           profilePicture: "https://example.com/profiles/john.jpg"
 *         messageText: "Hello, how are you?"
 *         messageAttachment: []
 *         createdAt: "2025-03-15T10:05:00.000Z"
 *         updatedAt: "2025-03-15T10:05:00.000Z"
 *
 *     MessageWithFormatting:
 *       allOf:
 *         - $ref: '#/components/schemas/Message'
 *         - type: object
 *           properties:
 *             isMine:
 *               type: boolean
 *               description: Whether the message was sent by the authenticated user
 *             formattedTime:
 *               type: string
 *               description: Formatted time string (e.g., "10:05 AM")
 *               example: "10:05 AM"
 *             formattedDate:
 *               type: string
 *               description: Formatted date string (e.g., "Mar 15, 2025")
 *               example: "Mar 15, 2025"
 *
 *     DirectChatPreview:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the chat
 *         chatType:
 *           type: string
 *           enum: [direct]
 *           description: Type of chat
 *         name:
 *           type: string
 *           description: Display name for the chat (other user's name)
 *         participants:
 *           type: object
 *           properties:
 *             count:
 *               type: integer
 *               example: 2
 *               description: Number of participants (always 2 for direct chats)
 *             otherUser:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   format: uuid
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 profilePicture:
 *                   type: string
 *                   format: uri
 *                 headLine:
 *                   type: string
 *         unreadCount:
 *           type: integer
 *           description: Number of unread messages in this chat
 *         lastMessage:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               format: uuid
 *             sender:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   format: uuid
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 profilePicture:
 *                   type: string
 *                   format: uri
 *             messageText:
 *               type: string
 *             createdAt:
 *               type: string
 *               format: date-time
 *             formattedTime:
 *               type: string
 *               example: "10:05 AM"
 *             isMine:
 *               type: boolean
 *         lastActive:
 *           type: string
 *           format: date-time
 *           description: When the chat was last active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the chat was created
 *       example:
 *         _id: "60d21b4667d0d8992e610c87"
 *         chatType: "direct"
 *         name: "John Doe"
 *         participants:
 *           count: 2
 *           otherUser:
 *             _id: "60d21b4667d0d8992e610c85"
 *             firstName: "John"
 *             lastName: "Doe"
 *             profilePicture: "https://example.com/profiles/john.jpg"
 *             headLine: "Software Engineer"
 *         unreadCount: 3
 *         lastMessage:
 *           _id: "60d21b4667d0d8992e610c88"
 *           sender:
 *             _id: "60d21b4667d0d8992e610c85"
 *             firstName: "John"
 *             lastName: "Doe"
 *             profilePicture: "https://example.com/profiles/john.jpg"
 *           messageText: "Hello, how are you?"
 *           createdAt: "2025-03-15T10:05:00.000Z"
 *           formattedTime: "10:05 AM"
 *           isMine: false
 *         lastActive: "2025-03-15T10:05:00.000Z"
 *         createdAt: "2025-03-15T09:00:00.000Z"
 *
 *     GroupChatPreview:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the chat
 *         chatType:
 *           type: string
 *           enum: [group]
 *           description: Type of chat
 *         name:
 *           type: string
 *           description: Name of the group chat
 *         participants:
 *           type: object
 *           properties:
 *             count:
 *               type: integer
 *               description: Number of participants in the group
 *             list:
 *               type: array
 *               items:
 *                 type: string
 *                 format: uuid
 *               description: List of participant user IDs
 *         unreadCount:
 *           type: integer
 *           description: Number of unread messages in this chat
 *         lastMessage:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               format: uuid
 *             sender:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   format: uuid
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 profilePicture:
 *                   type: string
 *                   format: uri
 *             messageText:
 *               type: string
 *             createdAt:
 *               type: string
 *               format: date-time
 *             formattedTime:
 *               type: string
 *               example: "10:05 AM"
 *             isMine:
 *               type: boolean
 *         lastActive:
 *           type: string
 *           format: date-time
 *           description: When the chat was last active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the chat was created
 *       example:
 *         _id: "60d21b4667d0d8992e610c90"
 *         chatType: "group"
 *         name: "Project Team"
 *         participants:
 *           count: 2
 *           list: ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c86"]
 *         unreadCount: 10
 *         lastMessage:
 *           _id: "60d21b4667d0d8992e610c91"
 *           sender:
 *             _id: "60d21b4667d0d8992e610c85"
 *             firstName: "John"
 *             lastName: "Doe"
 *             profilePicture: "https://example.com/profiles/john.jpg"
 *           messageText: "Team meeting tomorrow at 10 AM"
 *           createdAt: "2025-03-15T15:30:00.000Z"
 *           formattedTime: "3:30 PM"
 *           isMine: false
 *         lastActive: "2025-03-15T15:30:00.000Z"
 *         createdAt: "2025-03-10T09:00:00.000Z"
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
 *     summary: Create a new job (NOT IMPLEMENTED YET, DON'T USE) 
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
 *     description: |
 *       Retrieves all job listings from the database.
 *       Returns job details along with associated company information.
 *       Jobs are sorted by creation date (newest first).
 *     responses:
 *       200:
 *         description: List of jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Unique identifier for the job
 *                     example: "60d21b4667d0d8992e610c85"
 *                   title:
 *                     type: string
 *                     description: Job title
 *                     example: "Senior Software Engineer"
 *                   companyId:
 *                     type: object
 *                     description: Details of the company offering the job
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c84"
 *                       name:
 *                         type: string
 *                         example: "Tech Solutions Inc."
 *                       logo:
 *                         type: string
 *                         example: "https://example.com/logo.png"
 *                       industry:
 *                         type: string
 *                         example: "Software Development"
 *                       location:
 *                         type: string
 *                         example: "San Francisco, CA"
 *                   workplaceType:
 *                     type: string
 *                     enum: [Onsite, Hybrid, Remote]
 *                     example: "Remote"
 *                   jobLocation:
 *                     type: string
 *                     example: "New York, NY"
 *                   jobType:
 *                     type: string
 *                     enum: [Full Time, Part Time, Contract, Temporary, Other, Volunteer, Internship]
 *                     example: "Full Time"
 *                   description:
 *                     type: string
 *                     example: "We are looking for a talented software engineer..."
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-09-30T14:48:00.000Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-10-05T09:12:00.000Z"
 *                   isActive:
 *                     type: boolean
 *                     example: true
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve jobs"
 *                 error:
 *                   type: string
 *                   example: "Error details"
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
 *     summary: Submit an application for a job
 *     tags: [Jobs]
 *     description: |
 *       Apply for a job by submitting contact information and answers to screening questions.
 *       Applications may be automatically accepted or rejected based on screening question
 *       answers and the job's configuration. Requires user authentication.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: ID of the job to apply for
 *         example: "65fb2a8e7c5721f123456789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contactEmail
 *             properties:
 *               contactEmail:
 *                 type: string
 *                 format: email
 *                 description: Email address to use for this application
 *                 example: "john.doe@example.com"
 *               contactPhone:
 *                 type: string
 *                 description: Phone number to use for this application (optional)
 *                 example: "+1 (555) 123-4567"
 *               answers:
 *                 type: array
 *                 description: Answers to the job's screening questions
 *                 items:
 *                   type: object
 *                   required:
 *                     - question
 *                     - answer
 *                   properties:
 *                     question:
 *                       type: string
 *                       description: The exact question text matching one of the job's screening questions
 *                       example: "Background Check"
 *                     answer:
 *                       type: string
 *                       description: Applicant's answer to the question
 *                       example: "Yes, I consent to a background check"
 *     responses:
 *       200:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Application submitted successfully"
 *                   description: Success message or auto-rejection message
 *                 applicationStatus:
 *                   type: string
 *                   enum: [pending, rejected]
 *                   example: "pending"
 *                   description: Status of the application after submission
 *                 applicationId:
 *                   type: string
 *                   format: ObjectId
 *                   example: "65fb2a8e7c5721f123456795"
 *                   description: ID of the created application record
 *                 jobId:
 *                   type: string
 *                   format: ObjectId
 *                   example: "65fb2a8e7c5721f123456789"
 *                   description: ID of the job applied to
 *                 reason:
 *                   type: string
 *                   example: "Insufficient work experience. Required: 3 years"
 *                   description: Reason for auto-rejection if application was rejected
 *       400:
 *         description: Bad request - Missing required fields, invalid job ID, or already applied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contact email is required for job applications"
 *                   description: Error message explaining the issue
 *                 alreadyApplied:
 *                   type: boolean
 *                   example: true
 *                   description: Indicator that user has already applied (when applicable)
 *                 applicationId:
 *                   type: string
 *                   format: ObjectId
 *                   example: "65fb2a8e7c5721f123456795"
 *                   description: ID of existing application (when already applied)
 *                 applicationStatus:
 *                   type: string
 *                   example: "pending"
 *                   description: Status of existing application (when already applied)
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       404:
 *         description: Job or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Job not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to apply for job"
 *                 error:
 *                   type: string
 *                   example: "Internal server error details"
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
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     description: >
 *       Registers a new user account. Validates input, checks for duplicates, verifies reCAPTCHA, stores optional FCM token,
 *       and sends an email confirmation link. If a deactivated user with the same email exists, it is deleted.
 *     operationId: registerUser
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - recaptchaResponseToken
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123!"
 *                 description: "At least 8 characters, with 1 digit, 1 lowercase, and 1 uppercase letter."
 *               recaptchaResponseToken:
 *                 type: string
 *                 example: "03AFcWeA5..."
 *               fcmToken:
 *                 type: string
 *                 description: "Firebase Cloud Messaging token for push notifications"
 *                 example: "fcm123abc456"
 *     responses:
 *       201:
 *         description: User registered successfully, email confirmation sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "User registered successfully. Please check your email to confirm your account."
 *       400:
 *         description: Missing required fields.
 *         content:
 *           application/json:
 *             example:
 *               message: "all fields are required"
 *       409:
 *         description: User already exists and is active.
 *         content:
 *           application/json:
 *             example:
 *               message: "The User already exist use another email"
 *       422:
 *         description: Invalid email, weak password, or reCAPTCHA failure.
 *         content:
 *           application/json:
 *             examples:
 *               invalidEmail:
 *                 summary: Invalid email format
 *                 value:
 *                   message: "Email not valid, Write a valid email"
 *               weakPassword:
 *                 summary: Weak password
 *                 value:
 *                   message: "Ensure the password contains at least 1 digit, 1 lowercase,1 uppercase letter, and is at least 8 characters long."
 *               captchaFailed:
 *                 summary: reCAPTCHA failure
 *                 value:
 *                   message: "reCAPTCHA verification failed. Please try again."
 *       500:
 *         description: Server error during registration
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Registration failed"
 *               error: "Internal server error message"
 *
 *   delete:
 *     summary: Deactivate a user account
 *     tags: [Users]
 *     description: Marks the authenticated user's account as inactive instead of permanently deleting it.
 *     operationId: deleteUser
 *     responses:
 *       204:
 *         description: User account successfully deactivated. No content returned.
 *       400:
 *         description: Bad request, invalid input.
 *         content:
 *           application/json:
 *             example:
 *               message: "Invalid request parameters."
 *       401:
 *         description: Unauthorized, user must be logged in.
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized. Please log in."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error."
 */

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     description: Authenticate a user using email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: The registered email of the user.
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123!
 *                 description: The password associated with the email.
 *               fcmToken:
 *                 type: string
 *                 example: "fcm123abc456"
 *                 description: Firebase Cloud Messaging token for push notifications.
 *     responses:
 *       200:
 *         description: Successfully logged in, returns JWT token in cookies.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logged in successfully"
 *       400:
 *         description: Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please fill all required fields"
 *       404:
 *         description: Email not found (not registered).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please enter a registered email"
 *       401:
 *         description: Incorrect password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "wrong password"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /user/auth/google:
 *   post:
 *     summary: Login with Google
 *     tags: [Users]
 *     description: Authenticate a user using a Google ID token.
 *     security:
 *       - bearerAuth: []  # Indicates that the request requires a Bearer token
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer <Firebase_token>"
 *         description: "Firebase token obtained from Firebase Authentication."
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 description: "Firebase Cloud Messaging token for push notifications"
 *                 example: "fcm123abc456"
 *     responses:
 *       200:
 *         description: User logged in successfully.
 *         content:
 *           application/json:
 *             example:
 *               message: "Logged in successfully."
 *       201:
 *         description: New user created successfully.
 *         content:
 *           application/json:
 *             example:
 *               message: "Account created successfully."
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               message: "An error occurred during Google authentication."
 */

/**
 * @swagger
 * /user/logout:
 *    get:
 *     summary: Logout user
 *     tags: [Users]
 *     description: Logout a user
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 description: "Firebase Cloud Messaging token for push notifications"
 *                 example: "fcm123abc456"
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
 *   post:
 *     summary: Request a password reset link
 *     tags: [Users]
 *     description: Sends a password reset link to the user's email.
 *     operationId: forgotPassword
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@email.com"
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Forgot password email sent successfully"
 *               email: "user@email.com"
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Please fill all required fields"
 *       422:
 *         description: Invalid email format
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Please enter a valid email"
 *       404:
 *         description: Email is not registered
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "This email is not registered"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal server error"
 */

/**
 * @swagger
 * /user/update-password:
 *   patch:
 *     summary: Update user password
 *     tags: [Users]
 *     description: Updates the user's password after verifying the current password. Requires authentication via middleware.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: The user's current password.
 *                 example: "OldPassword123"
 *               newPassword:
 *                 type: string
 *                 description: The new password that must meet security requirements.
 *                 example: "NewStrongPass1!"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Password updated successfully
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             example:
 *               message: Please fill all required fields
 *       401:
 *         description: Incorrect current password
 *         content:
 *           application/json:
 *             example:
 *               message: Your current password is wrong
 *       422:
 *         description: Weak password that does not meet security requirements
 *         content:
 *           application/json:
 *             example:
 *               message: Ensure the password contains at least 1 digit, 1 lowercase, 1 uppercase letter, and is at least 8 characters long.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Internal server error
 */

/**
 * @swagger
 * /user/reset-password/{token}:
 *   patch:
 *     summary: Reset user password
 *     tags: [Users]
 *     description: Allows a user to reset their password using a valid reset token.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: The password reset token sent via email.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: The new password for the user.
 *                 example: "SecurePass123!"
 *     responses:
 *       200:
 *         description: Password reset successfully.
 *         content:
 *           application/json:
 *             example:
 *               message: "Password reset successfully"
 *       400:
 *         description: Bad request, password is missing.
 *         content:
 *           application/json:
 *             example:
 *               message: "Password is required"
 *       401:
 *         description: Unauthorized, token is invalid or has expired.
 *         content:
 *           application/json:
 *             example:
 *               message: "Token is invalid or has expired"
 *       422:
 *         description: Unprocessable entity, password does not meet security requirements.
 *         content:
 *           application/json:
 *             example:
 *               message: "Ensure the password contains at least 1 digit, 1 lowercase, 1 uppercase letter, and is at least 8 characters long."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error"
 *
 *   get:
 *     summary: Verify the password reset token
 *     tags: [Users]
 *     description: Check if the reset token is valid before allowing the user to proceed with resetting their password.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: The password reset token sent via email.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token is valid.
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               data:
 *                 email: "user@example.com"
 *       400:
 *         description: Token is invalid or has expired.
 *         content:
 *           application/json:
 *             example:
 *               message: "Token is invalid or has expired"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error"
 */

/**
 * @swagger
 * /user/update-email:
 *   patch:
 *     summary: Update user email
 *     description: Allows authenticated users to update their email. Requires password confirmation. The new email must not be already registered.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newEmail
 *               - password
 *             properties:
 *               newEmail:
 *                 type: string
 *                 format: email
 *                 example: "newemail@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "User@1234"
 *     responses:
 *       200:
 *         description: Email updated successfully. User needs to confirm the new email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 message:
 *                   type: string
 *                   example: "Email updated successfully. Please check your email to confirm your account."
 *       400:
 *         description: Bad request. Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please fill all required fields"
 *       401:
 *         description: Unauthorized. Incorrect password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "please enter the correct password"
 *       409:
 *         description: Conflict. Email is already registered.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email is already registered, use another email"
 *       422:
 *         description: Unprocessable Entity. Invalid email format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email not valid, Write a valid email"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

/**
 * @swagger
 * /user/confirm-email:
 *   get:
 *     summary: Resend confirmation email
 *     description: Resends the confirmation email for a user who has not yet confirmed their account.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Email sent successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Email sent successfully.  Please check your email to confirm your account."
 *       400:
 *         description: User is already confirmed.
 *         content:
 *           application/json:
 *             example:
 *               message: "User is already confirmed!!"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal server error"
 */

/**
 * @swagger
 * /user/confirm-email/{emailVerificationToken}:
 *   get:
 *     summary: Confirm user email
 *     description: Confirms a user's email address using the provided email verification token.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: emailVerificationToken
 *         required: true
 *         description: The email verification token sent to the user's email.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email confirmed successfully.
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Email is confirmed successfully"
 *       400:
 *         description: Bad request. Either the token is missing or invalid/expired.
 *         content:
 *           application/json:
 *             examples:
 *               missingToken:
 *                 value:
 *                   success: false
 *                   message: "Verification Token is required"
 *               invalidToken:
 *                 value:
 *                   success: false
 *                   message: "Invalid or expired token"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Internal server error"
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
 * /user/me:
 *   get:
 *     summary: Get logged in user profile
 *     tags: [Users]
 *     description: Retrieves a user's profile
 *     operationId: getMe
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// PROFILE AND COVER PICS DOCUMENTATION //////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @swagger
 * /user/pictures/profile-picture:
 *   post:
 *     summary: Upload or update the user's profile picture
 *     tags: [Users]
 *     description: Uploads a new profile picture for the user, validating file type and size before saving.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The profile picture file to be uploaded.
 *     responses:
 *       200:
 *         description: Profile Picture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile Picture updated successfully"
 *                 profilePicture:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/uploads/profile.jpg"
 *       400:
 *         description: Invalid request due to missing file or incorrect file format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: |
 *                      "No file uploaded" OR
 *                      "File size too large. Maximum allowed size is 5MB." OR
 *                      "Invalid file type. Only JPEG, PNG, GIF, WebP, HEIC, HEIF, BMP, TIFF, and SVG are allowed."
 *       401:
 *         description: Unauthorized access (User not logged in).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "Unexpected failure"
 */

/**
 * @swagger
 * /user/pictures/profile-picture:
 *   get:
 *     summary: Get the user's profile picture
 *     description: Retrieves the URL of the user's profile picture.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile picture retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profilePicture:
 *                   type: string
 *                   example: "https://example.com/uploads/profile-picture.jpg"
 *       401:
 *         description: Unauthorized access (User not logged in).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "Unexpected failure"
 */

/**
 * @swagger
 * /user/pictures/profile-picture:
 *   delete:
 *     summary: Delete the user's profile picture
 *     description: Removes the user's profile picture by setting the profilePicture field to null.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile Picture deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile Picture deleted successfully"
 *       401:
 *         description: Unauthorized access (User not logged in).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "Unexpected failure"
 */

/**
 * @swagger
 * /user/pictures/cover-picture:
 *   post:
 *     summary: Upload or update the user's cover picture
 *     tags: [Users]
 *     description: Uploads a new cover picture for the user, validating file type and size before saving.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The cover picture file to be uploaded.
 *     responses:
 *       200:
 *         description: Cover Picture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cover Picture updated successfully"
 *                 coverPicture:
 *                   type: string
 *                   format: uri
 *                   example: "https://example.com/uploads/cover.jpg"
 *       400:
 *         description: Invalid request due to missing file or incorrect file format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: |
 *                      "No file uploaded" OR
 *                      "File size too large. Maximum allowed size is 5MB." OR
 *                      "Invalid file type. Only JPEG, PNG, GIF, WebP, HEIC, HEIF, BMP, TIFF, and SVG are allowed."
 *       401:
 *         description: Unauthorized access (User not logged in).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "Unexpected failure"
 */

/**
 * @swagger
 * /user/pictures/cover-picture:
 *   get:
 *     summary: Get the user's profile picture
 *     description: Retrieves the URL of the user's cover picture.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cover picture retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 coverPicture:
 *                   type: string
 *                   example: "https://example.com/uploads/cover-picture.jpg"
 *       401:
 *         description: Unauthorized access (User not logged in).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "Unexpected failure"
 */

/**
 * @swagger
 * /user/pictures/cover-picture:
 *   delete:
 *     summary: Delete the user's cover picture
 *     description: Removes the user's cover picture by setting the coverPicture field to null.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cover picture deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cover Picture deleted successfully"
 *       401:
 *         description: Unauthorized access (User not logged in).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "Unexpected failure"
 */

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// RESUME DOCUMENTATION //////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

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

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// EXPERIENCE DOCUMENTATION //////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @swagger
 * /user/experience:
 *   post:
 *     summary: Add a new work experience for the authenticated user.
 *     description: Allows a user to add a new experience entry to their profile, including job details, employment type, location, skills, and optional media uploads.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               jobTitle:
 *                 type: string
 *                 example: "Software Engineer"
 *               companyName:
 *                 type: string
 *                 example: "Google"
 *               fromDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-01-01"
 *               toDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 example: "2024-06-01"
 *               currentlyWorking:
 *                 type: boolean
 *                 example: false
 *               employmentType:
 *                 type: string
 *                 enum: ["Full Time", "Part Time", "Freelance", "Self Employed", "Contract", "Internship", "Apprenticeship", "Seasonal"]
 *                 example: "Full Time"
 *               location:
 *                 type: string
 *                 example: "San Francisco, CA"
 *               locationType:
 *                 type: string
 *                 enum: ["Onsite", "Hybrid", "Remote"]
 *                 example: "Hybrid"
 *               description:
 *                 type: string
 *                 example: "Worked on backend development for a high-scale system."
 *               foundVia:
 *                 type: string
 *                 enum: ["Indeed", "LinkedIn", "Company Website", "Other job sites", "Referral", "Contracted by Recruiter", "Staffing Agency", "Other"]
 *                 example: "LinkedIn"
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["JavaScript", "Node.js", "MongoDB"]
 *               media:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Experience added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Experience added successfully"
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
 *                       example: "2023-01-01"
 *                     toDate:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                       example: "2024-06-01"
 *                     currentlyWorking:
 *                       type: boolean
 *                       example: false
 *                     employmentType:
 *                       type: string
 *                       example: "Full Time"
 *                     location:
 *                       type: string
 *                       example: "San Francisco, CA"
 *                     locationType:
 *                       type: string
 *                       example: "Hybrid"
 *                     description:
 *                       type: string
 *                       example: "Worked on backend development for a high-scale system."
 *                     foundVia:
 *                       type: string
 *                       example: "LinkedIn"
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["JavaScript", "Node.js", "MongoDB"]
 *                     media:
 *                       type: string
 *                       example: "https://example.com/media.jpg"
 *                 sortedWorkExperience:
 *                   type: array
 *                   description: A sorted list of the user's work experiences.
 *                   items:
 *                     type: object
 *                     properties:
 *                       jobTitle:
 *                         type: string
 *                         example: "Senior Developer"
 *                       companyName:
 *                         type: string
 *                         example: "Amazon"
 *                       fromDate:
 *                         type: string
 *                         format: date
 *                         example: "2020-06-01"
 *                       toDate:
 *                         type: string
 *                         format: date
 *                         nullable: true
 *                         example: "2022-08-01"
 *                       currentlyWorking:
 *                         type: boolean
 *                         example: false
 *                       employmentType:
 *                         type: string
 *                         example: "Full Time"
 *                       location:
 *                         type: string
 *                         example: "Seattle, WA"
 *                       locationType:
 *                         type: string
 *                         example: "Onsite"
 *                       description:
 *                         type: string
 *                         example: "Managed backend development for cloud applications."
 *                       foundVia:
 *                         type: string
 *                         example: "Referral"
 *                       skills:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Python", "AWS", "Django"]
 *       400:
 *         description: Invalid request data or failed media upload.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid experience data"
 *       401:
 *         description: Unauthorized - No authentication token provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
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
 */

/**
 * @swagger
 * /user/experience:
 *   get:
 *     summary: Retrieve all work experiences of the authenticated user.
 *     description: Fetches the list of work experiences associated with the authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved experiences.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 experiences:
 *                   type: array
 *                   description: List of work experiences.
 *                   items:
 *                     type: object
 *                     properties:
 *                       jobTitle:
 *                         type: string
 *                         example: "Software Engineer"
 *                       companyName:
 *                         type: string
 *                         example: "Google"
 *                       fromDate:
 *                         type: string
 *                         format: date
 *                         example: "2023-01-01"
 *                       toDate:
 *                         type: string
 *                         format: date
 *                         nullable: true
 *                         example: "2024-06-01"
 *                       currentlyWorking:
 *                         type: boolean
 *                         example: false
 *                       employmentType:
 *                         type: string
 *                         example: "Full Time"
 *                       location:
 *                         type: string
 *                         example: "San Francisco, CA"
 *                       locationType:
 *                         type: string
 *                         example: "Hybrid"
 *                       description:
 *                         type: string
 *                         example: "Worked on backend development for a high-scale system."
 *                       foundVia:
 *                         type: string
 *                         example: "LinkedIn"
 *                       skills:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["JavaScript", "Node.js", "MongoDB"]
 *                       media:
 *                         type: string
 *                         example: "https://example.com/media.jpg"
 *       401:
 *         description: Unauthorized - No authentication token provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

/**
 * @swagger
 * /user/experience/{index}:
 *   get:
 *     summary: Get a specific work experience
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Retrieves a specific work experience entry by index.
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *         description: The index of the work experience entry to retrieve.
 *     responses:
 *       200:
 *         description: Experience retrieved successfully.
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
 *                       example: "Tech Corp"
 *                     fromDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2022-01-01T00:00:00.000Z"
 *                     toDate:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: "2023-06-30T00:00:00.000Z"
 *                     currentlyWorking:
 *                       type: boolean
 *                       example: false
 *                     employmentType:
 *                       type: string
 *                       enum: ["Full Time", "Part Time", "Freelance", "Self Employed", "Contract", "Internship", "Apprenticeship", "Seasonal"]
 *                       example: "Full Time"
 *                     location:
 *                       type: string
 *                       example: "San Francisco, CA"
 *                     locationType:
 *                       type: string
 *                       enum: ["Onsite", "Hybrid", "Remote"]
 *                       example: "Hybrid"
 *                     description:
 *                       type: string
 *                       example: "Developed and maintained web applications."
 *                     foundVia:
 *                       type: string
 *                       enum: ["Indeed", "LinkedIn", "Company Website", "Other job sites", "Referral", "Contracted by Recruiter", "Staffing Agency", "Other"]
 *                       example: "LinkedIn"
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["JavaScript", "React", "Node.js"]
 *                     media:
 *                       type: string
 *                       nullable: true
 *                       example: "http://example.com/image.jpg"
 *       400:
 *         description: Bad request due to an invalid or out-of-range index.
 *       404:
 *         description: User not found.
 *       401:
 *         description: Unauthorized request (missing or invalid token).
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /user/experience/{index}:
 *   patch:
 *     summary: Update a specific work experience entry of the authenticated user.
 *     description: Updates an existing work experience entry using the provided index and request body.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         description: Index of the work experience to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               jobTitle:
 *                 type: string
 *                 example: "Senior Software Engineer"
 *               companyName:
 *                 type: string
 *                 example: "Amazon"
 *               fromDate:
 *                 type: string
 *                 format: date
 *                 example: "2022-03-01"
 *               toDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 example: "2024-01-01"
 *               currentlyWorking:
 *                 type: boolean
 *                 example: false
 *               employmentType:
 *                 type: string
 *                 example: "Full Time"
 *               location:
 *                 type: string
 *                 example: "New York, NY"
 *               locationType:
 *                 type: string
 *                 example: "Remote"
 *               description:
 *                 type: string
 *                 example: "Developed scalable microservices architecture."
 *               foundVia:
 *                 type: string
 *                 example: "Recruiter"
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Python", "AWS", "DynamoDB"]
 *               media:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Experience updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Experience updated successfully"
 *                 experience:
 *                   type: object
 *                   properties:
 *                     jobTitle:
 *                       type: string
 *                       example: "Senior Software Engineer"
 *                     companyName:
 *                       type: string
 *                       example: "Amazon"
 *                     fromDate:
 *                       type: string
 *                       format: date
 *                       example: "2022-03-01"
 *                     toDate:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                       example: "2024-01-01"
 *                     currentlyWorking:
 *                       type: boolean
 *                       example: false
 *                     employmentType:
 *                       type: string
 *                       example: "Full Time"
 *                     location:
 *                       type: string
 *                       example: "New York, NY"
 *                     locationType:
 *                       type: string
 *                       example: "Remote"
 *                     description:
 *                       type: string
 *                       example: "Developed scalable microservices architecture."
 *                     foundVia:
 *                       type: string
 *                       example: "Recruiter"
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Python", "AWS", "DynamoDB"]
 *                     media:
 *                       type: string
 *                       example: "https://example.com/media.jpg"
 *                 sortedWorkExperience:
 *                   type: array
 *                   description: Sorted list of updated work experiences.
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid request (e.g., invalid date format, file upload error).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid Data"
 *       401:
 *         description: Unauthorized - No authentication token provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: User or experience not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

/**
 * @swagger
 * /user/experience/{index}:
 *   delete:
 *     summary: Delete a specific work experience entry of the authenticated user.
 *     description: Removes a work experience entry by index and updates associated skills.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         description: Index of the work experience to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Experience deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Experience deleted successfully"
 *                 deletedExperience:
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
 *                       example: "2021-06-01"
 *                     toDate:
 *                       type: string
 *                       format: date
 *                       example: "2023-07-01"
 *                     employmentType:
 *                       type: string
 *                       example: "Full Time"
 *                     location:
 *                       type: string
 *                       example: "San Francisco, CA"
 *                 updatedSkills:
 *                   type: array
 *                   description: Updated list of skills after experience deletion.
 *                   items:
 *                     type: object
 *                     properties:
 *                       skillName:
 *                         type: string
 *                         example: "JavaScript"
 *                       experience:
 *                         type: array
 *                         items:
 *                           type: integer
 *                         example: [0, 1]
 *                       education:
 *                         type: array
 *                         items:
 *                           type: integer
 *                         example: [0, 1]
 *       400:
 *         description: Invalid request (e.g., invalid index).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid experience index"
 *       401:
 *         description: Unauthorized - No authentication token provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
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
 *                   example: "Unexpected database issue"
 */

//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// EDUCATION DOCUMENTATION //////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

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

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// SKILLS DOCUMENTATION //////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @swagger
 * /user/skills:
 *   post:
 *     summary: Add a new skill to the authenticated user's profile.
 *     description: Adds a skill associated with education and work experience indices.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *               educationIndexes:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [0, 2]
 *               experienceIndexes:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 3]
 *     responses:
 *       200:
 *         description: Skill added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Skill added successfully"
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
 *                       example: []
 *                     education:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [0, 2]
 *                     experience:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [1, 3]
 *       400:
 *         description: Invalid request (e.g., skill already exists or invalid skill name).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Skill already exists"
 *       401:
 *         description: Unauthorized - No authentication token provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
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
 *                   example: "Unexpected database issue"
 */

/**
 * @swagger
 * /user/skills:
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
 *                       education:
 *                         type: array
 *                         items:
 *                           type: integer
 *                         example: [0, 1]
 *                       experience:
 *                         type: array
 *                         items:
 *                           type: integer
 *                         example: [0]
 *       401:
 *         description: Unauthorized - No authentication token provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
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
 *   get:
 *     summary: Get a specific user skill
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Retrieve a specific skill associated with the authenticated user.
 *     parameters:
 *       - in: path
 *         name: skillName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the skill to retrieve (case-insensitive match).
 *     responses:
 *       200:
 *         description: Successfully retrieved the user skill
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
 *                     education:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [0, 1]
 *                     experience:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [0]
 *       401:
 *         description: Unauthorized - No authentication token provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: User or skill not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found or skill not found"
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
 *   patch:
 *     summary: Update an existing skill for the authenticated user.
 *     description: Updates a skill's name, education indices, and work experience indices.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillName
 *         required: true
 *         schema:
 *           type: string
 *         example: "JavaScript"
 *         description: The name of the skill to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newSkillName:
 *                 type: string
 *                 example: "Node.js"
 *               educationIndexes:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [0, 2]
 *               experienceIndexes:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 3]
 *     responses:
 *       200:
 *         description: Skill updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Skill updated successfully"
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       skillName:
 *                         type: string
 *                         example: "Node.js"
 *                       endorsements:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: []
 *                       education:
 *                         type: array
 *                         items:
 *                           type: integer
 *                         example: [0, 2]
 *                       experience:
 *                         type: array
 *                         items:
 *                           type: integer
 *                         example: [1, 3]
 *       400:
 *         description: Invalid request due to incorrect input data..
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: |
 *                      "Some provided experience indexes are invalid" OR
 *                      "Invalid experience indexes format" OR
 *                      "Invalid education indexes format" OR
 *                      "Some provided education indexes are invalid" OR
 *                      "No valid updates provided"
 *       404:
 *         description: Skill or user not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Skill not found"
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
 *                   example: "Unexpected database issue"
 */

/**
 * @swagger
 * /users/skills/{skillName}:
 *   delete:
 *     summary: Delete a skill from the user's profile
 *     tags: [Users]
 *     description: Removes a skill from the user's profile along with any references in education and work experience.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: skillName
 *         in: path
 *         required: true
 *         description: The name of the skill to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Skill deleted successfully.
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
 *       404:
 *         description: Skill or user not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: |
 *                      "Skill not found" OR "User not found"
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
 *                   example: "Unexpected error details here"
 */

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// ENDORSEMENTS DOCUMENTATION //////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @swagger
 * /user/skills/endorsements/add-endorsement:
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
 *                     education:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [0, 1]
 *                     endorsements:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["USER_ID_1", "USER_ID_2"]
 *                     _id:
 *                       type: string
 *                       example: "67cddb9b958aec899dec0116"
 *       400:
 *         description: Bad request (e.g., User cannot endorse themselves, already endorsed)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User or skill not found
 *       500:
 *         description: Internal Server Error
 *
 * /user/skills/endorsements/remove-endorsement/{skillName}:
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
 *                     education:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [0, 1]
 *                     endorsements:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["USER_ID_2"]
 *                     _id:
 *                       type: string
 *                       example: "67cddb9b958aec899dec0116"
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

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// PRIVACY SETTINGS DOCUMENTATION /////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

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
 *         currentPassword:
 *           type: string
 *           example: currentpassword
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
/**
 * @swagger
 * /user/connections/request/{targetUserId}:
 *   post:
 *     summary: Send a connection request
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Connection request sent successfully
 *       400:
 *         description: Invalid request or already connected
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 * 
 * /user/connections/requests:
 *   get:
 *     summary: Get pending connection requests
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending connection requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       profilePicture:
 *                         type: string
 *                       headline:
 *                         type: string
 *
 * /user/connections/requests/{senderId}:
 *   patch:
 *     summary: Accept or decline a connection request
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: senderId
 *         required: true
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
 *     responses:
 *       200:
 *         description: Request handled successfully
 *
 * /user/connections/{connectionId}:
 *   delete:
 *     summary: Remove a connection
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Connection removed successfully
 *
 * /user/follow/{userId}:
 *   post:
 *     summary: Follow a user
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully followed user
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully unfollowed user
 *
 * /user/block/{userId}:
 *   post:
 *     summary: Block a user
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User blocked successfully
 *   delete:
 *     summary: Unblock a user
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unblocked successfully
 *
 * /user/blocked:
 *   get:
 *     summary: Get list of blocked users
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of blocked users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blockedUsers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       profilePicture:
 *                         type: string
 *
 * /user/message-requests:
 *   get:
 *     summary: Get message requests
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of message requests
 *   post:
 *     summary: Send a message request
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetUserId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message request sent successfully
 *
 * /user/message-requests/{requestId}:
 *   patch:
 *     summary: Accept or decline a message request
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
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
 *     responses:
 *       200:
 *         description: Message request handled successfully
 */

// *********************************** Notifications APIs ******************************************//

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Endpoints for managing user notifications
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications
 *     tags: [Notifications]
 *     description: Retrieve all notifications for the logged-in user, with filtering, sorting, field limiting, and pagination.
 *     responses:
 *       200:
 *         description: List of notifications retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               notifications: [
 *                 {
 *                   _id: "67f6fcb4f4276632a73d295e",
 *                   from: "67f3e4b8cca3c5a20c729ca3",
 *                   to: "67e7e99bf3748823be551756",
 *                   subject: "impression",
 *                   content: "omar elshereef reacted with like to your comment",
 *                   resourceId: "67f6fcb4f4276632a73d2957",
 *                   relatedPostId: "67f3e4c5cca3c5a20c729ca8",
 *                   relatedCommentId: "67f6fc59f4276632a73d2940",
 *                   isRead: false,
 *                   createdAt: "2025-04-09T23:03:16.525Z",
 *                   updatedAt: "2025-04-10T13:12:46.142Z",
 *                   sendingUser: {
 *                     email: "omarelshereef@gmail.com",
 *                     firstName: "omar",
 *                     lastName: "elshereef",
 *                     profilePicture: null
 *                   }
 *                 }
 *               ]
 *       404:
 *         description: No notifications found
 */

/**
 * @swagger
 * /notifications/mark-read/{id}:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     description: Mark a specific notification as read.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       403:
 *         description: Unauthorized to update this notification
 *       404:
 *         description: Notification not found
 */

/**
 * @swagger
 * /notifications/mark-unread/{id}:
 *   patch:
 *     summary: Mark a notification as unread
 *     tags: [Notifications]
 *     description: Mark a specific notification as unread.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as unread
 *       403:
 *         description: Unauthorized to update this notification
 *       404:
 *         description: Notification not found
 */

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get count of unread notifications
 *     tags: [Notifications]
 *     description: Retrieve the number of unread notifications for the logged-in user.
 *     responses:
 *       200:
 *         description: Count retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               unreadCount: 3
 */

/**
 * @swagger
 * /notifications/pause-notifications:
 *   patch:
 *     summary: Pause receiving notifications
 *     tags: [Notifications]
 *     description: Temporarily pause notifications for a specific duration.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               duration:
 *                 type: string
 *                 example: "1h"
 *     responses:
 *       200:
 *         description: Notifications paused
 *       400:
 *         description: Duration is required or invalid
 */

/**
 * @swagger
 * /notifications/resume-notifications:
 *   patch:
 *     summary: Resume receiving notifications
 *     tags: [Notifications]
 *     description: Resume notifications after they were paused.
 *     responses:
 *       200:
 *         description: Notifications resumed
 */

/**
 * @swagger
 * /notifications/restore-notification/{id}:
 *   patch:
 *     summary: Restore a deleted notification
 *     tags: [Notifications]
 *     description: Restore a notification that was previously marked as deleted.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification restored
 *       400:
 *         description: Notification is not deleted
 *       403:
 *         description: Unauthorized to restore this notification
 *       404:
 *         description: Notification not found
 */

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Soft delete a notification
 *     tags: [Notifications]
 *     description: Mark a notification as deleted for the user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       204:
 *         description: Notification deleted
 *       403:
 *         description: Unauthorized to delete this notification
 *       404:
 *         description: Notification not found
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
 * /user/search:
 *   get:
 *     summary: Search for users
 *     tags: [Connections & Networking]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: General search query
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Filter by company name
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: Filter by industry
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Results per page
 *     responses:
 *       200:
 *         description: List of users matching search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       company:
 *                         type: string
 *                       industry:
 *                         type: string
 *                       profilePicture:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     pages:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /user/profile:
 *   patch:
 *     summary: Update user profile intro information
 *     tags: [Users]
 *     description: Updates basic profile information for the authenticated user
 *     operationId: editIntro
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - location
 *               - industry
 *               - mainEducation
 *               - headLine
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               additinalName:
 *                 type: string
 *                 example: "Robert"
 *               headLine:
 *                 type: string
 *                 example: "Senior Software Engineer at Tech Corp"
 *               website:
 *                 type: string
 *                 example: "https://johndoe.com"
 *               location:
 *                 type: string
 *                 example: "San Francisco, CA"
 *               mainEducation:
 *                 type: string
 *                 example: "Stanford University"
 *               industry:
 *                 type: string
 *                 example: "Software Development"
 *     responses:
 *       200:
 *         description: Profile information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Intro updated successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     headLine:
 *                       type: string
 *                       example: "Senior Software Engineer at Tech Corp"
 *                     additionalName:
 *                       type: string
 *                       example: "Robert"
 *                     website:
 *                       type: string
 *                       example: "https://johndoe.com"
 *                     location:
 *                       type: string
 *                       example: "San Francisco, CA"
 *                     industry:
 *                       type: string
 *                       example: "Software Development"
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields"
 *                 missingFields:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["firstName", "industry"]
 *       401:
 *         description: Unauthorized, user must be logged in
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
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to update profile"
 *                 details:
 *                   type: string
 *                   example: "Error message details"
 */

/**
 * @swagger
 * /user/contact-info:
 *   patch:
 *     summary: Update user contact information
 *     tags: [Users]
 *     description: Update a user's contact information including phone, address, birthday, and website
 *     operationId: editContactInfo
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 example: "+1 555-123-4567"
 *               phoneType:
 *                 type: string
 *                 enum: [Home, Work, Mobile, null]
 *                 nullable: true
 *                 example: "Mobile"
 *               address:
 *                 type: string
 *                 nullable: true
 *                 example: "123 Main Street, San Francisco, CA 94105"
 *               birthDay:
 *                 type: object
 *                 properties:
 *                   day:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 31
 *                     nullable: true
 *                     example: 15
 *                   month:
 *                     type: string
 *                     enum: [January, February, March, April, May, June, July, August, September, October, November, December, null]
 *                     nullable: true
 *                     example: "June"
 *               website:
 *                 type: object
 *                 properties:
 *                   url:
 *                     type: string
 *                     nullable: true
 *                     example: "https://johndoe.com"
 *                   type:
 *                     type: string
 *                     enum: [Personal, Company, Blog, RSS Feed, Portfolio, Other, null]
 *                     nullable: true
 *                     example: "Personal"
 *     responses:
 *       200:
 *         description: Contact information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contact information updated successfully"
 *                 contactInfo:
 *                   type: object
 *                   properties:
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                       example: "+1 555-123-4567"
 *                     phoneType:
 *                       type: string
 *                       nullable: true
 *                       example: "Mobile"
 *                     address:
 *                       type: string
 *                       nullable: true
 *                       example: "123 Main Street, San Francisco, CA 94105"
 *                     birthDay:
 *                       type: object
 *                       properties:
 *                         day:
 *                           type: integer
 *                           nullable: true
 *                           example: 15
 *                         month:
 *                           type: string
 *                           nullable: true
 *                           example: "June"
 *                     website:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                           nullable: true
 *                           example: "https://johndoe.com"
 *                         type:
 *                           type: string
 *                           nullable: true
 *                           example: "Personal"
 *       400:
 *         description: Validation error or no fields provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid phoneType"
 *                 validValues:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Home", "Work", "Mobile"]
 *       401:
 *         description: Unauthorized, user must be logged in
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/about:
 *   patch:
 *     summary: Update user about section
 *     tags: [Users]
 *     description: Update a user's about section including description and skills (limited to 5 skills)
 *     operationId: editAbout
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - about
 *             properties:
 *               about:
 *                 type: object
 *                 properties:
 *                   description:
 *                     type: string
 *                     nullable: true
 *                     example: "Full-stack developer with 5+ years experience building scalable web applications."
 *                   skills:
 *                     type: array
 *                     items:
 *                       type: string
 *                     maxItems: 5
 *                     example: ["React", "Node.js", "MongoDB", "Express", "TypeScript"]
 *     responses:
 *       200:
 *         description: About section updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "About section updated successfully"
 *                 about:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                       example: "Full-stack developer with 5+ years experience building scalable web applications."
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["React", "Node.js", "MongoDB", "Express", "TypeScript"]
 *                 skillsAdded:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       skillName:
 *                         type: string
 *                         example: "React"
 *                       endorsements:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: []
 *                       education:
 *                         type: array
 *                         items:
 *                           type: integer
 *                         example: []
 *       400:
 *         description: Validation error or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Skills array cannot contain more than 5 items"
 *       401:
 *         description: Unauthorized, user must be logged in
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
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to update about section"
 *                 details:
 *                   type: string
 *                   example: "Error message details"
 */

/**
 * @swagger
 * /search/users:
 *   get:
 *     summary: Search for users by name
 *     tags: [Search]
 *     description: Search for users by first or last name and return a paginated list of matching users with their basic profile information. Useful for finding users to tag in comments or posts.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Name or partial name to search for (minimum 2 characters)
 *         example: "john"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of users per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Users found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Users found successfully"
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "65fb2a8e7c5721f123456788"
 *                       firstName:
 *                         type: string
 *                         example: "John"
 *                       lastName:
 *                         type: string
 *                         example: "Smith"
 *                       headline:
 *                         type: string
 *                         example: "Software Engineer at Tech Company"
 *                       profilePicture:
 *                         type: string
 *                         example: "https://res.cloudinary.com/example/image/upload/profile.jpg"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                       example: 25
 *                     totalPages:
 *                       type: number
 *                       example: 3
 *                     currentPage:
 *                       type: number
 *                       example: 1
 *                     pageSize:
 *                       type: number
 *                       example: 10
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Bad request - search term too short (less than 2 characters)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Search term must be at least 2 characters"
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to search users"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

/**
 * @swagger
 * /posts/{postId}/like:
 *   get:
 *     summary: Get users who reacted to a post
 *     tags: [Posts]
 *     description: |
 *       Retrieve a paginated list of users who reacted to a specific post, with optional filtering by impression type.
 *       This endpoint provides similar functionality to LinkedIn's reaction panel, offering the ability to view all reactions
 *       or filter by specific types (like, celebrate, support, etc.). Results include user profile information and
 *       are sorted by most recent first.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to get impressions for
 *         example: "65fb2a8e7c5721f123456789"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [like, support, celebrate, love, insightful, funny]
 *         description: Filter by impression type (optional). Omit to get all types (equivalent to the "All" tab)
 *         example: "love"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of results per page
 *         example: 10
 *     responses:
 *       200:
 *         description: List of users who reacted to the post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Impressions retrieved successfully"
 *                 impressions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       impressionId:
 *                         type: string
 *                         example: "65fb2a8e7c5721f123456790"
 *                         description: Unique identifier for this impression/reaction
 *                       userId:
 *                         type: string
 *                         example: "65fb2a8e7c5721f123456788"
 *                         description: ID of the user who created this impression
 *                       type:
 *                         type: string
 *                         enum: [like, support, celebrate, love, insightful, funny]
 *                         example: "love"
 *                         description: Type of impression/reaction
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-20T14:30:45.123Z"
 *                         description: Timestamp when the impression was created
 *                       firstName:
 *                         type: string
 *                         example: "John"
 *                         description: First name of the user
 *                       lastName:
 *                         type: string
 *                         example: "Smith"
 *                         description: Last name of the user
 *                       headline:
 *                         type: string
 *                         example: "Software Engineer at Tech Company"
 *                         description: Professional headline of the user
 *                       profilePicture:
 *                         type: string
 *                         example: "https://res.cloudinary.com/example/image/upload/profile.jpg"
 *                         description: URL to the user's profile picture
 *                 counts:
 *                   type: object
 *                   description: Count of each impression type for this post
 *                   properties:
 *                     like:
 *                       type: number
 *                       example: 42
 *                       description: Number of "like" impressions
 *                     support:
 *                       type: number
 *                       example: 15
 *                       description: Number of "support" impressions
 *                     celebrate:
 *                       type: number
 *                       example: 8
 *                       description: Number of "celebrate" impressions
 *                     love:
 *                       type: number
 *                       example: 23
 *                       description: Number of "love" impressions
 *                     insightful:
 *                       type: number
 *                       example: 19
 *                       description: Number of "insightful" impressions
 *                     funny:
 *                       type: number
 *                       example: 7
 *                       description: Number of "funny" impressions
 *                     total:
 *                       type: number
 *                       example: 114
 *                       description: Total number of impressions across all types
 *                 pagination:
 *                   type: object
 *                   description: Pagination metadata
 *                   properties:
 *                     totalImpressions:
 *                       type: number
 *                       example: 114
 *                       description: Total number of impressions (filtered by type if applicable)
 *                     totalPages:
 *                       type: number
 *                       example: 12
 *                       description: Total number of pages available
 *                     currentPage:
 *                       type: number
 *                       example: 1
 *                       description: Current page number
 *                     pageSize:
 *                       type: number
 *                       example: 10
 *                       description: Number of results per page
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                       description: Whether there is a next page available
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *                       description: Whether there is a previous page available
 *       400:
 *         description: Bad request - missing post ID or invalid impression type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post ID is required"
 *                 validTypes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["like", "support", "celebrate", "love", "insightful", "funny"]
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       404:
 *         description: Post not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post not found or inactive"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to get impressions"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

/**
 * @swagger
 * /comments/{commentId}/like:
 *   get:
 *     summary: Get users who reacted to a comment
 *     tags: [Comments]
 *     description: |
 *       Retrieve a paginated list of users who reacted to a specific comment, with optional filtering by impression type.
 *       This endpoint provides similar functionality to LinkedIn's reaction panel, offering the ability to view all reactions
 *       or filter by specific types (like, celebrate, support, etc.). Results include user profile information and
 *       are sorted by most recent first.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment to get impressions for
 *         example: "65fb2a8e7c5721f123456789"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [like, support, celebrate, love, insightful, funny]
 *         description: Filter by impression type (optional). Omit to get all types (equivalent to the "All" tab)
 *         example: "love"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of results per page
 *         example: 10
 *     responses:
 *       200:
 *         description: List of users who reacted to the comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Impressions retrieved successfully"
 *                 impressions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       impressionId:
 *                         type: string
 *                         example: "65fb2a8e7c5721f123456790"
 *                         description: Unique identifier for this impression/reaction
 *                       userId:
 *                         type: string
 *                         example: "65fb2a8e7c5721f123456788"
 *                         description: ID of the user who created this impression
 *                       type:
 *                         type: string
 *                         enum: [like, support, celebrate, love, insightful, funny]
 *                         example: "love"
 *                         description: Type of impression/reaction
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-20T14:30:45.123Z"
 *                         description: Timestamp when the impression was created
 *                       firstName:
 *                         type: string
 *                         example: "John"
 *                         description: First name of the user
 *                       lastName:
 *                         type: string
 *                         example: "Smith"
 *                         description: Last name of the user
 *                       headline:
 *                         type: string
 *                         example: "Software Engineer at Tech Company"
 *                         description: Professional headline of the user
 *                       profilePicture:
 *                         type: string
 *                         example: "https://res.cloudinary.com/example/image/upload/profile.jpg"
 *                         description: URL to the user's profile picture
 *                 counts:
 *                   type: object
 *                   description: Count of each impression type for this comment
 *                   properties:
 *                     like:
 *                       type: number
 *                       example: 12
 *                       description: Number of "like" impressions
 *                     support:
 *                       type: number
 *                       example: 5
 *                       description: Number of "support" impressions
 *                     celebrate:
 *                       type: number
 *                       example: 3
 *                       description: Number of "celebrate" impressions
 *                     love:
 *                       type: number
 *                       example: 7
 *                       description: Number of "love" impressions
 *                     insightful:
 *                       type: number
 *                       example: 8
 *                       description: Number of "insightful" impressions
 *                     funny:
 *                       type: number
 *                       example: 4
 *                       description: Number of "funny" impressions
 *                     total:
 *                       type: number
 *                       example: 39
 *                       description: Total number of impressions across all types
 *                 pagination:
 *                   type: object
 *                   description: Pagination metadata
 *                   properties:
 *                     totalImpressions:
 *                       type: number
 *                       example: 39
 *                       description: Total number of impressions (filtered by type if applicable)
 *                     totalPages:
 *                       type: number
 *                       example: 4
 *                       description: Total number of pages available
 *                     currentPage:
 *                       type: number
 *                       example: 1
 *                       description: Current page number
 *                     pageSize:
 *                       type: number
 *                       example: 10
 *                       description: Number of results per page
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                       description: Whether there is a next page available
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *                       description: Whether there is a previous page available
 *       400:
 *         description: Bad request - missing comment ID or invalid impression type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment ID is required"
 *                 validTypes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["like", "support", "celebrate", "love", "insightful", "funny"]
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       404:
 *         description: Comment not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment not found or inactive"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to get impressions"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

/**
 * @swagger
 * /posts/{postId}/reposts:
 *   get:
 *     summary: Get reposts of a specific post
 *     tags: [Posts]
 *     description: |
 *       Retrieve a paginated list of reposts for a specific post, including user information
 *       and repost content. Returns data in the same format as the main feed for consistency.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to get reposts for
 *         example: "65fb2a8e7c5721f123456789"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of results per page
 *         example: 10
 *     responses:
 *       200:
 *         description: List of reposts formatted like feed posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       postId:
 *                         type: string
 *                         example: "65fb2a8e7c5721f123456789"
 *                         description: ID of the original post
 *                       userId:
 *                         type: string
 *                         example: "65fb2a8e7c5721f123456777"
 *                         description: ID of the original post author
 *                       firstName:
 *                         type: string
 *                         example: "Jane"
 *                         description: First name of the original post author
 *                       lastName:
 *                         type: string
 *                         example: "Doe"
 *                         description: Last name of the original post author
 *                       headline:
 *                         type: string
 *                         example: "Product Manager"
 *                         description: Headline of the original post author
 *                       profilePicture:
 *                         type: string
 *                         example: "https://res.cloudinary.com/example/image/upload/profile.jpg"
 *                         description: Profile picture of the original post author
 *                       postDescription:
 *                         type: string
 *                         example: "Original post content here"
 *                         description: Content of the original post
 *                       attachments:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["https://res.cloudinary.com/example/image/upload/post1.jpg"]
 *                         description: Attachments from the original post
 *                       impressionCounts:
 *                         type: object
 *                         properties:
 *                           like:
 *                             type: number
 *                             example: 42
 *                           support:
 *                             type: number
 *                             example: 15
 *                           celebrate:
 *                             type: number
 *                             example: 8
 *                           love:
 *                             type: number
 *                             example: 23
 *                           insightful:
 *                             type: number
 *                             example: 19
 *                           funny:
 *                             type: number
 *                             example: 7
 *                           total:
 *                             type: number
 *                             example: 114
 *                         description: Impression counts from the original post
 *                       commentCount:
 *                         type: number
 *                         example: 12
 *                         description: Comment count from the original post
 *                       repostCount:
 *                         type: number
 *                         example: 8
 *                         description: Repost count from the original post
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-20T14:30:45.123Z"
 *                         description: When the original post was created
 *                       taggedUsers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             userId:
 *                               type: string
 *                               example: "65fb2a8e7c5721f123456700"
 *                             userType:
 *                               type: string
 *                               enum: ["User", "Company"]
 *                               example: "User"
 *                             firstName:
 *                               type: string
 *                               example: "Alex"
 *                             lastName:
 *                               type: string
 *                               example: "Johnson"
 *                             companyName:
 *                               type: string
 *                               example: null
 *                         description: Users tagged in the original post
 *                       isRepost:
 *                         type: boolean
 *                         example: true
 *                         description: Flag indicating this is a repost (always true for this endpoint)
 *                       isSaved:
 *                         type: boolean
 *                         example: false
 *                         description: Flag indicating if the current user has saved this post
 *                       repostId:
 *                         type: string
 *                         example: "65fb2a8e7c5721f123456790"
 *                         description: ID of the repost
 *                       reposterId:
 *                         type: string
 *                         example: "65fb2a8e7c5721f123456788"
 *                         description: ID of the user who reposted
 *                       reposterFirstName:
 *                         type: string
 *                         example: "John"
 *                         description: First name of the reposter
 *                       reposterLastName:
 *                         type: string
 *                         example: "Smith"
 *                         description: Last name of the reposter
 *                       reposterProfilePicture:
 *                         type: string
 *                         example: "https://res.cloudinary.com/example/image/upload/reposter.jpg"
 *                         description: Profile picture of the reposter
 *                       reposterHeadline:
 *                         type: string
 *                         example: "Software Engineer at Tech Company"
 *                         description: Headline of the reposter
 *                       repostDescription:
 *                         type: string
 *                         example: "Great post about coding best practices!"
 *                         description: Comment added by the reposter
 *                       repostDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-21T09:15:30.123Z"
 *                         description: When the repost was created
 *                 pagination:
 *                   type: object
 *                   description: Pagination metadata
 *                   properties:
 *                     total:
 *                       type: number
 *                       example: 25
 *                       description: Total number of reposts for this post
 *                     page:
 *                       type: number
 *                       example: 1
 *                       description: Current page number
 *                     limit:
 *                       type: number
 *                       example: 10
 *                       description: Number of results per page
 *                     pages:
 *                       type: number
 *                       example: 3
 *                       description: Total number of pages available
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                       description: Whether there is a next page available
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *                       description: Whether there is a previous page available
 *       400:
 *         description: Bad request - missing post ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post ID is required"
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       404:
 *         description: Post not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post not found or inactive"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to get reposts"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

/**
 * @swagger
 * /user/{userId}/activity:
 *   get:
 *     summary: Get posts that a user has posted, reposted, or commented on
 *     tags: [Users, Posts]
 *     description: |
 *       Retrieve a paginated list of posts that a user has created, reposted, or commented on.
 *       Results include all post details in the same format as the main feed for consistency,
 *       with additional activity information to indicate what action the user took.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose activity to retrieve
 *         example: "65fb2a8e7c5721f123456789"
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, posts, reposts, comments]
 *           default: all
 *         description: Filter to include only specific activity types
 *         example: "all"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of results per page
 *         example: 10
 *     responses:
 *       200:
 *         description: List of posts the user has interacted with
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       postId:
 *                         type: string
 *                         example: "65fb2a8e7c5721f123456790"
 *                         description: ID of the post
 *                       userId:
 *                         type: string
 *                         example: "65fb2a8e7c5721f123456777"
 *                         description: ID of the post author
 *                       firstName:
 *                         type: string
 *                         example: "Jane"
 *                         description: First name of the post author
 *                       lastName:
 *                         type: string
 *                         example: "Doe"
 *                         description: Last name of the post author
 *                       headline:
 *                         type: string
 *                         example: "Product Manager"
 *                         description: Headline of the post author
 *                       profilePicture:
 *                         type: string
 *                         example: "https://res.cloudinary.com/example/image/upload/profile.jpg"
 *                         description: Profile picture of the post author
 *                       postDescription:
 *                         type: string
 *                         example: "Post content here"
 *                         description: Content of the post
 *                       attachments:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["https://res.cloudinary.com/example/image/upload/post1.jpg"]
 *                         description: Post attachments
 *                       impressionCounts:
 *                         type: object
 *                         properties:
 *                           like:
 *                             type: number
 *                             example: 42
 *                           support:
 *                             type: number
 *                             example: 15
 *                           celebrate:
 *                             type: number
 *                             example: 8
 *                           love:
 *                             type: number
 *                             example: 23
 *                           insightful:
 *                             type: number
 *                             example: 19
 *                           funny:
 *                             type: number
 *                             example: 7
 *                           total:
 *                             type: number
 *                             example: 114
 *                         description: Counts of different impression types
 *                       commentCount:
 *                         type: number
 *                         example: 12
 *                         description: Number of comments on this post
 *                       repostCount:
 *                         type: number
 *                         example: 8
 *                         description: Number of reposts of this post
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-20T14:30:45.123Z"
 *                         description: When the post was created
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-21T09:15:30.123Z"
 *                         description: When the post was last updated
 *                       taggedUsers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             userId:
 *                               type: string
 *                               example: "65fb2a8e7c5721f123456700"
 *                             userType:
 *                               type: string
 *                               enum: ["User", "Company"]
 *                               example: "User"
 *                             firstName:
 *                               type: string
 *                               example: "Alex"
 *                             lastName:
 *                               type: string
 *                               example: "Johnson"
 *                             companyName:
 *                               type: string
 *                               example: null
 *                         description: Users tagged in the post
 *                       whoCanSee:
 *                         type: string
 *                         enum: [anyone, connections, group]
 *                         example: "anyone"
 *                         description: Privacy setting for post visibility
 *                       whoCanComment:
 *                         type: string
 *                         enum: [anyone, connections]
 *                         example: "anyone"
 *                         description: Setting for who can comment on the post
 *                       isRepost:
 *                         type: boolean
 *                         example: false
 *                         description: Whether this post is a repost
 *                       isSaved:
 *                         type: boolean
 *                         example: false
 *                         description: Whether the current user has saved this post
 *                       activityType:
 *                         type: string
 *                         enum: [post, repost, comment]
 *                         example: "post"
 *                         description: Type of activity the user performed on this post
 *                       activityDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-20T14:30:45.123Z"
 *                         description: When the user performed this activity
 *                       repostId:
 *                         type: string
 *                         example: "65fb2a8e7c5721f123456795"
 *                         description: ID of the repost (if activityType is repost)
 *                       reposterId:
 *                         type: string
 *                         example: "65fb2a8e7c5721f123456789"
 *                         description: ID of the user who reposted (if activityType is repost)
 *                       reposterFirstName:
 *                         type: string
 *                         example: "John"
 *                         description: First name of the reposter (if activityType is repost)
 *                       reposterLastName:
 *                         type: string
 *                         example: "Smith"
 *                         description: Last name of the reposter (if activityType is repost)
 *                       reposterProfilePicture:
 *                         type: string
 *                         example: "https://res.cloudinary.com/example/image/upload/reposter.jpg"
 *                         description: Profile picture of the reposter (if activityType is repost)
 *                       reposterHeadline:
 *                         type: string
 *                         example: "Software Developer"
 *                         description: Headline of the reposter (if activityType is repost)
 *                       repostDescription:
 *                         type: string
 *                         example: "Great insights in this post!"
 *                         description: Description added when reposting (if activityType is repost)
 *                       repostDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-21T09:15:30.123Z"
 *                         description: When the repost was created (if activityType is repost)
 *                       commentId:
 *                         type: string
 *                         example: "65fb2a8e7c5721f123456799"
 *                         description: ID of the comment (if activityType is comment)
 *                       commentText:
 *                         type: string
 *                         example: "This is a very insightful post. Thanks for sharing!"
 *                         description: Text of the comment (if activityType is comment)
 *                       commentDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-21T10:45:20.123Z"
 *                         description: When the comment was created (if activityType is comment)
 *                       commenterId:
 *                         type: string
 *                         example: "65fb2a8e7c5721f123456789"
 *                         description: ID of the user who commented (if activityType is comment)
 *                       commenterFirstName:
 *                         type: string
 *                         example: "John"
 *                         description: First name of the commenter (if activityType is comment)
 *                       commenterLastName:
 *                         type: string
 *                         example: "Smith"
 *                         description: Last name of the commenter (if activityType is comment)
 *                       commenterProfilePicture:
 *                         type: string
 *                         example: "https://res.cloudinary.com/example/image/upload/commenter.jpg"
 *                         description: Profile picture of the commenter (if activityType is comment)
 *                       commenterHeadline:
 *                         type: string
 *                         example: "Software Developer"
 *                         description: Headline of the commenter (if activityType is comment)
 *                 pagination:
 *                   type: object
 *                   description: Pagination metadata
 *                   properties:
 *                     total:
 *                       type: number
 *                       example: 35
 *                       description: Total number of activities matching the filter
 *                     page:
 *                       type: number
 *                       example: 1
 *                       description: Current page number
 *                     limit:
 *                       type: number
 *                       example: 10
 *                       description: Number of results per page
 *                     pages:
 *                       type: number
 *                       example: 4
 *                       description: Total number of pages available
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                       description: Whether there is a next page available
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *                       description: Whether there is a previous page available
 *       400:
 *         description: Bad request - missing user ID or invalid filter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User ID is required"
 *                 validFilters:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["all", "posts", "reposts", "comments"]
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       403:
 *         description: Forbidden - user doesn't have permission to access this user's activity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not connected with this user"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to get user activity"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

/**
 * @swagger
 * /search/jobs:
 *   get:
 *     summary: Search for jobs with advanced filters
 *     tags: [Search, Jobs]
 *     description: |
 *       Search for jobs using multiple filter criteria including keyword search, location,
 *       industry, company, and minimum work experience requirements. Results are sorted
 *       by newest first and include company details.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: |
 *           General search term that matches against job title, description, industry,
 *           workplace type, job type, or company industry
 *         example: "developer"
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Location search term to filter jobs by location
 *         example: "New York"
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: Filter jobs by specific industry (exact match)
 *         example: "Technology"
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: MongoDB ObjectId of company to filter jobs by
 *         example: "65fb2a8e7c5721f123456700"
 *       - in: query
 *         name: minExperience
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum years of work experience required
 *         example: 3
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of results per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Jobs found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Jobs found successfully"
 *                   description: Success message or no results message
 *                 jobs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       jobId:
 *                         type: string
 *                         format: ObjectId
 *                         example: "65fb2a8e7c5721f123456789"
 *                         description: Unique identifier for the job
 *                       company:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: ObjectId
 *                             example: "65fb2a8e7c5721f123456700"
 *                             description: Company ID
 *                           name:
 *                             type: string
 *                             example: "Tech Corp"
 *                             description: Company name
 *                           logo:
 *                             type: string
 *                             example: "https://res.cloudinary.com/example/image/upload/logo.jpg"
 *                             description: Company logo URL
 *                           industry:
 *                             type: string
 *                             example: "Technology"
 *                             description: Company industry
 *                           location:
 *                             type: string
 *                             example: "San Francisco, CA"
 *                             description: Company location
 *                       title:
 *                         type: string
 *                         example: "Senior Software Engineer"
 *                         description: Job title
 *                       industry:
 *                         type: string
 *                         example: "Technology"
 *                         description: Job industry
 *                       workplaceType:
 *                         type: string
 *                         enum: ["Onsite", "Hybrid", "Remote"]
 *                         example: "Hybrid"
 *                         description: Job workplace type
 *                       jobLocation:
 *                         type: string
 *                         example: "New York, NY"
 *                         description: Job location
 *                       jobType:
 *                         type: string
 *                         enum: ["Full Time", "Part Time", "Contract", "Temporary", "Other", "Volunteer", "Internship"]
 *                         example: "Full Time"
 *                         description: Job type
 *                       description:
 *                         type: string
 *                         example: "We are seeking an experienced software engineer..."
 *                         description: Job description
 *                       applicationEmail:
 *                         type: string
 *                         example: "jobs@techcorp.com"
 *                         description: Email for job applications
 *                       screeningQuestions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             question:
 *                               type: string
 *                               example: "Work Experience"
 *                               description: Screening question title
 *                             specification:
 *                               type: string
 *                               example: "Years of experience in software development"
 *                               description: Additional details about the question
 *                             mustHave:
 *                               type: boolean
 *                               example: true
 *                               description: Whether this is a required qualification
 *                         description: Job screening questions (without ideal answers)
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-15T14:30:00Z"
 *                         description: Job posting date
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-16T09:45:00Z"
 *                         description: Last update date
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalJobs:
 *                       type: number
 *                       example: 45
 *                       description: Total number of jobs matching the search criteria
 *                     totalPages:
 *                       type: number
 *                       example: 5
 *                       description: Total number of pages available
 *                     currentPage:
 *                       type: number
 *                       example: 1
 *                       description: Current page number
 *                     pageSize:
 *                       type: number
 *                       example: 10
 *                       description: Number of results per page
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                       description: Whether there are more pages available
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *                       description: Whether there are previous pages available
 *                 filters:
 *                   type: object
 *                   properties:
 *                     q:
 *                       type: string
 *                       nullable: true
 *                       example: "developer"
 *                       description: General search term used
 *                     location:
 *                       type: string
 *                       nullable: true
 *                       example: "New York"
 *                       description: Location filter used
 *                     industry:
 *                       type: string
 *                       nullable: true
 *                       example: "Technology"
 *                       description: Industry filter used
 *                     companyId:
 *                       type: string
 *                       nullable: true
 *                       example: "65fb2a8e7c5721f123456700"
 *                       description: Company filter used
 *                     minExperience:
 *                       type: number
 *                       nullable: true
 *                       example: 3
 *                       description: Minimum experience filter used
 *       400:
 *         description: Bad request - invalid search parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid companyId format"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to search jobs"
 *                 error:
 *                   type: string
 *                   example: "Internal server error details"
 */

/**
 * @swagger
 * /jobs/{jobId}/save:
 *   post:
 *     summary: Save a job for the authenticated user
 *     tags: [Jobs]
 *     description: Adds a job to the user's saved jobs list for easy reference and later application
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the job to save
 *         example: "65fb2a8e7c5721f123456789"
 *     responses:
 *       200:
 *         description: Job saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Job saved successfully"
 *                 savedJobId:
 *                   type: string
 *                   format: ObjectId
 *                   example: "65fb2a8e7c5721f123456789"
 *       400:
 *         description: Bad request - Invalid job ID format or job already saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "This job is already in your saved list"
 *                 alreadySaved:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       404:
 *         description: Job or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Job not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to save job"
 *                 error:
 *                   type: string
 *                   example: "Internal server error details"
 *   delete:
 *     summary: Remove a job from saved jobs list
 *     tags: [Jobs]
 *     description: Removes a previously saved job from the user's saved jobs list
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the job to remove from saved list
 *         example: "65fb2a8e7c5721f123456789"
 *     responses:
 *       200:
 *         description: Job removed from saved list successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Job removed from saved list successfully"
 *                 removedJobId:
 *                   type: string
 *                   format: ObjectId
 *                   example: "65fb2a8e7c5721f123456789"
 *       400:
 *         description: Bad request - Invalid job ID format or job not in saved list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "This job is not in your saved list"
 *                 alreadyRemoved:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to remove job from saved list"
 *                 error:
 *                   type: string
 *                   example: "Internal server error details"
 *
 * /jobs/saved:
 *   get:
 *     summary: Get all saved jobs for the authenticated user
 *     tags: [Jobs, Users]
 *     description: Retrieves a paginated list of jobs that the authenticated user has saved, including company details
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of results per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Saved jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Saved jobs retrieved successfully"
 *                 jobs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       jobId:
 *                         type: string
 *                         format: ObjectId
 *                         example: "65fb2a8e7c5721f123456789"
 *                       title:
 *                         type: string
 *                         example: "Senior Software Engineer"
 *                       company:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: ObjectId
 *                             example: "65fb2a8e7c5721f123456700"
 *                           name:
 *                             type: string
 *                             example: "Tech Corp"
 *                           logo:
 *                             type: string
 *                             example: "https://res.cloudinary.com/example/image/upload/logo.jpg"
 *                           industry:
 *                             type: string
 *                             example: "Technology"
 *                           location:
 *                             type: string
 *                             example: "San Francisco, CA"
 *                       industry:
 *                         type: string
 *                         example: "Technology"
 *                       workplaceType:
 *                         type: string
 *                         enum: ["Onsite", "Hybrid", "Remote"]
 *                         example: "Hybrid"
 *                       jobLocation:
 *                         type: string
 *                         example: "New York, NY"
 *                       jobType:
 *                         type: string
 *                         enum: ["Full Time", "Part Time", "Contract", "Temporary", "Other", "Volunteer", "Internship"]
 *                         example: "Full Time"
 *                       description:
 *                         type: string
 *                         example: "We are seeking an experienced software engineer..."
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-15T14:30:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-16T09:45:00Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalJobs:
 *                       type: number
 *                       example: 25
 *                     totalPages:
 *                       type: number
 *                       example: 3
 *                     currentPage:
 *                       type: number
 *                       example: 1
 *                     pageSize:
 *                       type: number
 *                       example: 10
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve saved jobs"
 *                 error:
 *                   type: string
 *                   example: "Internal server error details"
 */

/**
 * @swagger
 * /jobs/my-applications:
 *   get:
 *     summary: Get all job applications for the authenticated user
 *     tags: [Jobs, Users]
 *     description: |
 *       Retrieve all job applications submitted by the authenticated user, with
 *       status updates and job details. Applications are sorted by most recent first
 *       and can be filtered by status.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, viewed, rejected, accepted]
 *         description: Filter applications by status (optional)
 *         example: "pending"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of results per page
 *         example: 10
 *     responses:
 *       200:
 *         description: User's job applications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Applications retrieved successfully"
 *                   description: Success message or no results message
 *                 applications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       applicationId:
 *                         type: string
 *                         format: ObjectId
 *                         example: "65fb2a8e7c5721f123456790"
 *                         description: Unique identifier for the application
 *                       status:
 *                         type: string
 *                         enum: [pending, viewed, rejected, accepted]
 *                         example: "pending"
 *                         description: Current status of the application
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-15T14:30:00Z"
 *                         description: When the application was submitted
 *                       job:
 *                         type: object
 *                         properties:
 *                           jobId:
 *                             type: string
 *                             format: ObjectId
 *                             example: "65fb2a8e7c5721f123456789"
 *                             description: ID of the job applied to
 *                           title:
 *                             type: string
 *                             example: "Senior Software Engineer"
 *                             description: Job title
 *                           workplaceType:
 *                             type: string
 *                             enum: [Onsite, Hybrid, Remote]
 *                             example: "Remote"
 *                             description: Type of workplace arrangement
 *                           jobLocation:
 *                             type: string
 *                             example: "New York, NY"
 *                             description: Location of the job
 *                           jobType:
 *                             type: string
 *                             enum: [Full Time, Part Time, Contract, Temporary, Other, Volunteer, Internship]
 *                             example: "Full Time"
 *                             description: Type of employment
 *                           company:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: ObjectId
 *                                 example: "65fb2a8e7c5721f123456700"
 *                                 description: ID of the company
 *                               name:
 *                                 type: string
 *                                 example: "Tech Corp"
 *                                 description: Name of the company
 *                               logo:
 *                                 type: string
 *                                 example: "https://res.cloudinary.com/example/image/upload/logo.jpg"
 *                                 description: URL to company logo
 *                               industry:
 *                                 type: string
 *                                 example: "Technology"
 *                                 description: Industry sector
 *                               location:
 *                                 type: string
 *                                 example: "San Francisco, CA"
 *                                 description: Company location
 *                       contactEmail:
 *                         type: string
 *                         example: "john.doe@example.com"
 *                         description: Contact email used for this application
 *                       screeningAnswers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             question:
 *                               type: string
 *                               example: "Work Experience"
 *                               description: Screening question
 *                             answer:
 *                               type: string
 *                               example: "5 years"
 *                               description: Applicant's answer
 *                         description: Answers provided to screening questions
 *                       rejectionReason:
 *                         type: string
 *                         nullable: true
 *                         example: "The position has been filled"
 *                         description: Reason for rejection if application was rejected
 *                       autoRejected:
 *                         type: boolean
 *                         example: false
 *                         description: Whether the application was automatically rejected
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalApplications:
 *                       type: number
 *                       example: 12
 *                       description: Total number of applications matching the filter
 *                     totalPages:
 *                       type: number
 *                       example: 2
 *                       description: Total number of pages available
 *                     currentPage:
 *                       type: number
 *                       example: 1
 *                       description: Current page number
 *                     pageSize:
 *                       type: number
 *                       example: 10
 *                       description: Number of results per page
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                       description: Whether there are more pages available
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *                       description: Whether there are previous pages available
 *                 filters:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "all"
 *                       description: Status filter used in the request
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve job applications"
 *                 error:
 *                   type: string
 *                   example: "Internal server error details"
 */

/**
 * @swagger
 * /jobs/{jobId}/apply:
 *   get:
 *     summary: Get all applications for a specific job
 *     tags: [Jobs, Applications]
 *     description: |
 *       Returns all applications submitted for a specific job. This endpoint is restricted
 *       to company representatives who own the job posting. Includes applicant information
 *       and screening answers.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: ID of the job to get applications for
 *         example: "65fb2a8e7c5721f123456789"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, viewed, rejected, accepted]
 *         description: Filter applications by status (optional)
 *         example: "pending"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of results per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Job applications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Applications retrieved successfully"
 *                   description: Success message or no results message
 *                 jobTitle:
 *                   type: string
 *                   example: "Senior Software Engineer"
 *                   description: Title of the job
 *                 applications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       applicationId:
 *                         type: string
 *                         format: ObjectId
 *                         example: "65fb2a8e7c5721f123456790"
 *                         description: Unique identifier for the application
 *                       status:
 *                         type: string
 *                         enum: [pending, viewed, rejected, accepted]
 *                         example: "pending"
 *                         description: Current status of the application
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-15T14:30:00Z"
 *                         description: When the application was submitted
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-03-16T09:45:00Z"
 *                         description: When the application was last updated
 *                       lastViewed:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: "2025-03-16T09:45:00Z"
 *                         description: When the application was last viewed by the company
 *                       applicant:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             format: ObjectId
 *                             example: "65fb2a8e7c5721f123456791"
 *                             description: Applicant's user ID
 *                           firstName:
 *                             type: string
 *                             example: "John"
 *                             description: Applicant's first name
 *                           lastName:
 *                             type: string
 *                             example: "Doe"
 *                             description: Applicant's last name
 *                           email:
 *                             type: string
 *                             example: "john.doe@example.com"
 *                             description: Applicant's email
 *                           profilePicture:
 *                             type: string
 *                             example: "https://res.cloudinary.com/example/image/upload/profile.jpg"
 *                             description: URL to applicant's profile picture
 *                           headline:
 *                             type: string
 *                             example: "Senior Software Engineer"
 *                             description: Applicant's professional headline
 *                       contactEmail:
 *                         type: string
 *                         example: "john.doe@example.com"
 *                         description: Email provided for contact in this application
 *                       contactPhone:
 *                         type: string
 *                         example: "+1 (555) 123-4567"
 *                         description: Phone number provided for contact in this application
 *                       screeningAnswers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             question:
 *                               type: string
 *                               example: "Work Experience"
 *                               description: Screening question
 *                             questionType:
 *                               type: string
 *                               example: "Work Experience"
 *                               description: Type of screening question
 *                             answer:
 *                               type: string
 *                               example: "5 years"
 *                               description: Applicant's answer
 *                             meetsCriteria:
 *                               type: boolean
 *                               nullable: true
 *                               example: true
 *                               description: Whether the answer meets the criteria
 *                       rejectionReason:
 *                         type: string
 *                         nullable: true
 *                         example: "Insufficient work experience"
 *                         description: Reason for rejection if application was rejected
 *                       autoRejected:
 *                         type: boolean
 *                         example: false
 *                         description: Whether the application was automatically rejected
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalApplications:
 *                       type: number
 *                       example: 45
 *                       description: Total number of applications matching the criteria
 *                     totalPages:
 *                       type: number
 *                       example: 5
 *                       description: Total number of pages available
 *                     currentPage:
 *                       type: number
 *                       example: 1
 *                       description: Current page number
 *                     pageSize:
 *                       type: number
 *                       example: 10
 *                       description: Number of results per page
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                       description: Whether there are more pages available
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *                       description: Whether there are previous pages available
 *                 filters:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "all"
 *                       description: Status filter used in the request
 *       400:
 *         description: Bad request - invalid job ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid job ID format"
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized, no token"
 *       403:
 *         description: Forbidden - User doesn't have permission to view these applications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized. You can only view applications for your company's jobs."
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Job not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve job applications"
 *                 error:
 *                   type: string
 *                   example: "Internal server error details"
 */
// Add after your existing documentation sections, before any closing comments
// Look for sections like "PRIVACY SETTINGS DOCUMENTATION" or similar

///////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// ADMIN DOCUMENTATION ////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: API endpoints for admin operations including reports, jobs, and analytics
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65fb2a8e7c5721f123456789"
 *         userId:
 *           type: string
 *           description: ID of the user who reported
 *         reportedId:
 *           type: string
 *           description: ID of the reported content (post, comment, etc.)
 *         reportedType:
 *           type: string
 *           enum: [Post, Comment, Job, User]
 *         reason:
 *           type: string
 *           example: "Inappropriate content"
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           default: pending
 *         adminFeedback:
 *           type: string
 *           example: "Content violates community guidelines"
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /admin/reports:
 *   get:
 *     summary: Get all reports
 *     tags: [Admin]
 *     description: Retrieve all user reports for content moderation
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User is not an admin
 */

/**
 * @swagger
 * /admin/reports/{reportId}:
 *   get:
 *     summary: Get a specific report
 *     tags: [Admin - Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the report to retrieve
 *     responses:
 *       200:
 *         description: Report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   description: The report data, containing either reportedUser or reportedPost along with the report
 *                   oneOf:
 *                     - type: object
 *                       properties:
 *                         report:
 *                           type: object
 *                           description: The report object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               description: The ID of the report
 *                               example: "64b8e3499b594928f8a934a2"
 *                             userId:
 *                               type: string
 *                               description: The ID of the user who created the report
 *                               example: "64b8e3499b594928f8a934a1"
 *                             reportedType:
 *                               type: string
 *                               description: The type of content reported (User or Post)
 *                               example: "User"
 *                             reportedId:
 *                               type: string
 *                               description: The ID of the reported user or post
 *                               example: "64b8e3499b594928f8a934a3"
 *                             policy:
 *                               type: string
 *                               description: The policy that was violated
 *                               example: "Harassment"
 *                             status:
 *                               type: string
 *                               description: The status of the report (pending, approved, rejected)
 *                               example: "pending"
 *                         reportedUser:
 *                           type: object
 *                           description: The reported user object (if reportedType is User)
 *                           properties:
 *                             _id:
 *                               type: string
 *                               description: The ID of the reported user
 *                               example: "64b8e3499b594928f8a934a3"
 *                             firstName:
 *                               type: string
 *                               example: "Jane"
 *                             lastName:
 *                               type: string
 *                               example: "Smith"
 *                             email:
 *                               type: string
 *                               example: "jane.smith@example.com"
 *                     - type: object
 *                       properties:
 *                         report:
 *                           type: object
 *                           description: The report object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               description: The ID of the report
 *                               example: "64b8e3499b594928f8a934a2"
 *                             userId:
 *                               type: string
 *                               description: The ID of the user who created the report
 *                               example: "64b8e3499b594928f8a934a1"
 *                             reportedType:
 *                               type: string
 *                               description: The type of content reported (User or Post)
 *                               example: "Post"
 *                             reportedId:
 *                               type: string
 *                               description: The ID of the reported user or post
 *                               example: "64b8e3499b594928f8a934a3"
 *                             policy:
 *                               type: string
 *                               description: The policy that was violated
 *                               example: "Harassment"
 *                             status:
 *                               type: string
 *                               description: The status of the report (pending, approved, rejected)
 *                               example: "pending"
 *                         reportedPost:
 *                           type: object
 *                           description: The reported post object (if reportedType is Post)
 *                           properties:
 *                             _id:
 *                               type: string
 *                               description: The ID of the reported post
 *                               example: "64b8e3499b594928f8a934a4"
 *                             description:
 *                               type: string
 *                               example: "This is the description of the reported post."
 *                             attachments:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["url_to_attachment1", "url_to_attachment2"]
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 *
 *   patch:
 *     summary: Handle report
 *     tags: [Admin]
 *     description: Update report status and provide admin feedback
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the report to handle
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approved, rejected]
 *               reason:
 *                 type: string
 *                 example: "Content violates community guidelines"
 *     responses:
 *       200:
 *         description: Report handled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *
 *   delete:
 *     summary: Delete report
 *     tags: [Admin]
 *     description: Remove a report from the system
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the report to delete
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *       404:
 *         description: Report not found
 */

/**
 * @swagger
 * /admin/jobs:
 *   get:
 *     summary: Get flagged jobs
 *     tags: [Admin]
 *     description: Retrieve all flagged job postings for moderation
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Flagged jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 */

/**
 * @swagger
 * /admin/jobs/{jobId}:
 *   delete:
 *     summary: Remove job
 *     tags: [Admin]
 *     description: Delete a job posting
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the job to remove
 *     responses:
 *       200:
 *         description: Job removed successfully
 *       404:
 *         description: Job not found
 */

/**
 * @swagger
 * /admin/analytics/overview:
 *   get:
 *     summary: Get analytics overview (Admin only)
 *     tags: [Admin]
 *     description: Retrieve platform-wide analytics overview including user, post, job, and company statistics. Requires admin privileges.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics overview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                   description: Status of the request
 *                 data:
 *                   type: object
 *                   properties:
 *                     userStats:
 *                       type: object
 *                       description: Statistics about users
 *                       properties:
 *                         totalUsers:
 *                           type: number
 *                           example: 1000
 *                           description: Total number of users
 *                         activeUsers:
 *                           type: number
 *                           example: 800
 *                           description: Number of active users
 *                         premiumUsers:
 *                           type: number
 *                           example: 200
 *                           description: Number of premium users
 *                         usersByIndustry:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "Technology"
 *                                 description: Industry name
 *                               count:
 *                                 type: number
 *                                 example: 300
 *                                 description: Number of users in the industry
 *                           description: Distribution of users across different industries
 *                         averageConnections:
 *                           type: number
 *                           example: 50
 *                           description: Average number of connections per user
 *                         usersByProfilePrivacy:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "public"
 *                                 description: Profile privacy setting
 *                               count:
 *                                 type: number
 *                                 example: 600
 *                                 description: Number of users with this privacy setting
 *                           description: Distribution of users based on profile privacy settings
 *                         usersByConnectionRequestPrivacy:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "everyone"
 *                                 description: Connection request privacy setting
 *                               count:
 *                                 type: number
 *                                 example: 700
 *                                 description: Number of users with this connection request privacy setting
 *                           description: Distribution of users based on connection request privacy settings
 *                         usersByDefaultMode:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "light"
 *                                 description: Default mode (light or dark)
 *                               count:
 *                                 type: number
 *                                 example: 750
 *                                 description: Number of users with this default mode
 *                           description: Distribution of users based on default mode
 *                         employmentTypeCounts:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "Full Time"
 *                                 description: Employment type
 *                               count:
 *                                 type: number
 *                                 example: 500
 *                                 description: Number of users with this employment type
 *                           description: Distribution of users based on employment type
 *                     postStats:
 *                       type: object
 *                       description: Statistics about posts
 *                       properties:
 *                         totalPosts:
 *                           type: number
 *                           example: 5000
 *                           description: Total number of posts
 *                         activePosts:
 *                           type: number
 *                           example: 4500
 *                           description: Number of active posts
 *                         totalImpressions:
 *                           type: number
 *                           example: 50000
 *                           description: Total number of impressions on all posts
 *                         averageEngagement:
 *                           type: object
 *                           description: Average engagement metrics for posts
 *                           properties:
 *                             impressions:
 *                               type: number
 *                               example: 10
 *                               description: Average number of impressions per post
 *                             comments:
 *                               type: number
 *                               example: 5
 *                               description: Average number of comments per post
 *                             reposts:
 *                               type: number
 *                               example: 2
 *                               description: Average number of reposts per post
 *                     jobStats:
 *                       type: object
 *                       description: Statistics about jobs
 *                       properties:
 *                         totalJobs:
 *                           type: number
 *                           example: 200
 *                           description: Total number of jobs
 *                         activeJobs:
 *                           type: number
 *                           example: 150
 *                           description: Number of active jobs
 *                         jobsByType:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "Full Time"
 *                                 description: Job type
 *                               count:
 *                                 type: number
 *                                 example: 120
 *                                 description: Number of jobs of this type
 *                           description: Distribution of jobs by type
 *                         jobsByWorkplaceType:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "Remote"
 *                                 description: Workplace type
 *                               count:
 *                                 type: number
 *                                 example: 80
 *                                 description: Number of jobs with this workplace type
 *                           description: Distribution of jobs by workplace type
 *                         averageApplications:
 *                           type: number
 *                           example: 10
 *                           description: Average number of applications per job
 *                     companyStats:
 *                       type: object
 *                       description: Statistics about companies
 *                       properties:
 *                         totalCompanies:
 *                           type: number
 *                           example: 150
 *                           description: Total number of companies
 *                         activeCompanies:
 *                           type: number
 *                           example: 130
 *                           description: Number of active companies
 *                         companiesBySize:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "1-10"
 *                                 description: Company size
 *                               count:
 *                                 type: number
 *                                 example: 50
 *                                 description: Number of companies of this size
 *                           description: Distribution of companies by size
 *                         companiesByIndustry:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "Technology"
 *                                 description: Industry
 *                               count:
 *                                 type: number
 *                                 example: 60
 *                                 description: Number of companies in this industry
 *                           description: Distribution of companies by industry
 *                         averageFollowers:
 *                           type: number
 *                           example: 25
 *                           description: Average number of followers per company
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized, Admin access required"
 */
