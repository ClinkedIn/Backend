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
 *                   properties:
 *                     total:
 *                       type: number
 *                       description: Total number of posts matching the criteria
 *                       example: 45
 *                     page:
 *                       type: number
 *                       description: Current page number
 *                       example: 1
 *                     limit:
 *                       type: number
 *                       description: Number of posts per page
 *                       example: 10
 *                     pages:
 *                       type: number
 *                       description: Total number of pages
 *                       example: 5
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
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     description: Creates a new user account, sends an email confirmation link, and returns authentication tokens in cookies.
 *     operationId: createUser
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
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123!"
 *                 description: "Must contain at least 1 digit, 1 lowercase, 1 uppercase letter, and be at least 8 characters long."
 *               recaptchaResponseToken:
 *                 type: string
 *                 description: "Google reCAPTCHA response token"
 *                 example: "03AFcWeA5..."
 *     responses:
 *       201:
 *         description: User registered successfully, email confirmation sent.
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
 *                   example: "User registered successfully. Please check your email to confirm your account."
 *       400:
 *         description: Bad Request - Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All fields are required."
 *       409:
 *         description: Conflict - User already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "The User already exists, use another email."
 *       422:
 *         description: Unprocessable Entity - Invalid email, weak password, or CAPTCHA failure.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ensure the password contains at least 1 digit, 1 lowercase, 1 uppercase letter, and is at least 8 characters long."
 *       500:
 *         description: Internal Server Error - Registration failed.
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
 *                   example: "Registration failed"
 *                 error:
 *                   type: string
 *                   example: "Internal server error message."
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
 *           example: "Bearer <GOOGLE_ID_TOKEN>"
 *         description: "Google ID token obtained from Firebase Authentication."
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
 * /user/profile-picture:
 *   get:
 *     summary: Get profile picture
 *     tags: [Users]
 *     description: Retrieve the user's profile picture
 *     responses:
 *       200:
 *         description: Profile picture retrieved successfully
 *       400:
 *         description: Profile picture not set
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 *
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
 * /user/cover-picture:
 *   get:
 *     summary: Get cover photo
 *     tags: [Users]
 *     description: Retrieve the user's cover photo
 *     responses:
 *       200:
 *         description: Cover photo retrieved successfully
 *       400:
 *         description: Cover photo not set
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 *
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - jobTitle
 *               - companyName
 *               - fromDate
 *               - employmentType
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
 *                 default: false
 *               employmentType:
 *                 type: string
 *                 enum: ["Full Time", "Part Time", "Freelance", "Self Employed", "Contract", "Internship", "Apprenticeship", "Seasonal"]
 *               location:
 *                 type: string
 *                 example: "New York, USA"
 *               locationType:
 *                 type: string
 *                 enum: ["Onsite", "Hybrid", "Remote"]
 *               description:
 *                 type: string
 *                 example: "Developed web applications using React and Node.js."
 *               foundVia:
 *                 type: string
 *                 example: "LinkedIn"
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["JavaScript", "React", "Node.js"]
 *               media:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Experience added successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *
 *   get:
 *     summary: Get all work experiences
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Retrieves all work experiences of the user.
 *     responses:
 *       200:
 *         description: Experiences retrieved successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *
 *
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
 *     responses:
 *       200:
 *         description: Experience retrieved successfully
 *       400:
 *         description: Invalid index
 *       404:
 *         description: User or experience not found
 *       500:
 *         description: Internal server error
 *
 *   patch:
 *     summary: Update a work experience
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Updates a work experience entry at the specified index.
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
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
 *               foundVia:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               media:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Experience updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: User or experience not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete a work experience
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Deletes a work experience entry at the specified index.
 *     parameters:
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Experience deleted successfully
 *       400:
 *         description: Invalid index
 *       404:
 *         description: User or experience not found
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
 *     summary: Add a new skill to the user's profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Adds a skill to the authenticated user's profile and associates it with their education and work experience records. The skill must be unique for the user and linked to at least one education or work experience entry.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - skillName
 *             properties:
 *               skillName:
 *                 type: string
 *                 example: "JavaScript"
 *                 description: "The name of the skill to be added. It is case-insensitive and must not already exist in the user's skills."
 *               educationIndexes:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [0, 1]
 *                 description: "Array of indexes referring to the user's education records. Must be valid indexes within the user's education list."
 *               experienceIndexes:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [0]
 *                 description: "Array of indexes referring to the user's work experience records. Must be valid indexes within the user's work experience list."
 *     responses:
 *       200:
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
 *                       example: [0, 1]
 *                     experience:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [0]
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Skill already exists or invalid indexes provided"
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
 *     summary: Update a user's skill
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Update the skill name, associated education indexes, or experience indexes for a given skill.
 *     parameters:
 *       - in: path
 *         name: skillName
 *         required: true
 *         schema:
 *           type: string
 *           example: "JavaScript"
 *         description: The current name of the skill to be updated.
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
 *                 description: The new name for the skill (optional).
 *               educationIndexes:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [0, 1]
 *                 description: List of education indexes to associate with the skill (optional).
 *               experienceIndexes:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [2, 3]
 *                 description: List of experience indexes to associate with the skill (optional).
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
 *                         example: [2, 3]
 *       400:
 *         description: Invalid request or duplicate skill
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Skill name is the same"
 *       404:
 *         description: User or skill not found
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
 * /user/skills/{skillName}:
 *   delete:
 *     summary: Delete a user's skill
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     description: Remove a skill from the authenticated user's profile.
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
 *                     education:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [0, 1]
 *                     experience:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [2, 3]
 *       404:
 *         description: Skill not found
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
