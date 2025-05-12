🔐 LockedIn Backend <img alt="LockedIn Logo" src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" width="24" height="24">
LockedIn Backend powers the core services of the LockedIn cross-platform application. Built using Node.js, it handles authentication, user data, job listings, media uploads, and payment processing, enabling a seamless and secure professional networking experience.

✨ Features
🔐 Authentication & Security
JWT-based Authentication: Secure, stateless user sessions

Firebase OAuth: Google sign-in via Firebase

Password Management: Encrypted reset and update

Role-based Access Control

Input Validation: Ensures secure and clean data

Rate Limiting: Prevents abuse and spamming

👤 User Profiles
User CRUD: Create, retrieve, update, delete users

Experience & Education: Add professional milestones

Skills Management: Showcase technical abilities

Media Upload: Upload avatars, resumes via Cloudinary

🔗 Networking
Connection Requests: Request/accept/reject connections

Followers: Follow professionals without direct connections

Activity Feed: Track updates and posts

💼 Job Features
Job Management: Post, edit, and delete job listings

Application Submission: Apply to jobs directly

Application Tracking: View job status and history

Company Profiles: View details of employers

💬 Notifications
Real-time Notifications via Firebase Cloud Messaging

Custom Notification Channels

Activity-based Alerts

💳 Payments (Stripe)
Stripe Integration: Payments and subscriptions

Checkout Sessions: Secure checkout for premium features

Webhook Events: Handle updates from Stripe in real-time

🛠️ Technologies
Backend Core
Node.js – JavaScript runtime

Express.js – Web framework

MongoDB + Mongoose – NoSQL database and schema modeling

Firebase Admin SDK – OAuth and messaging

Cloudinary – Media storage and transformations

Stripe API – Payment processing

JWT – Token-based authentication

Utility
dotenv – Environment configuration

Multer – File upload middleware

Zod / Joi – Validation libraries

CORS – Cross-Origin Resource Sharing

Morgan – HTTP request logging

🚀 Getting Started
✅ Prerequisites
Node.js (v18+ recommended)

MongoDB Atlas or local instance

Firebase Project

Stripe Account

Cloudinary Account

📦 Installation
# Clone the repository
git clone https://github.com/tahaaa22/ClinkedIn/Backend.git
cd Backend

# Install dependencies
npm install
🔐 Environment Setup
Create a .env file in the root directory:

PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_email
FIREBASE_PRIVATE_KEY=your_private_key
STRIPE_SECRET_KEY=your_stripe_key
FRONTEND_URL=https://lockedin.app
⚠️ Important: Make sure FIREBASE_PRIVATE_KEY is properly escaped or use a JSON key file.

▶️ Run the App
npm run devStart
The server will start on http://localhost:5000 (or your configured port).

📁 Project Structure
LockedIn-Backend/
├── controllers/       # Request handlers
├── models/            # Mongoose schemas
├── routes/            # API endpoints
├── middlewares/       # Auth, validation, error handling
├── utils/             # Helper functions
└── server.js          # App entry point
🔄 API Workflow
Authentication – Register/login (email or Google OAuth)

Profile Setup – Users complete professional details

Networking – Follow or connect with other users

Job Exploration – Discover and apply to jobs

Payment & Upgrade – Purchase premium plans

Notifications – Get real-time updates via FCM

📡 API Endpoints (Preview)
Method	Endpoint	Description
POST	/api/user/register	Email/password registratio
GET	/api/user/:id	Get user profile
POST	/api/jobs/	Create a new job post
POST	/api/stripe/create-checkout-session	Create Stripe checkout session

📘 Full API documentation via Swagger on /api/docs.

🧪 Testing
npm run test
Use Jest for unit/integration testing.
