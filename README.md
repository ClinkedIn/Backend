# 🔐 LockedIn Backend <img alt="LockedIn Logo" src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" width="24" height="24">
LockedIn Backend powers the core services of the LockedIn cross-platform application. Built using Node.js, it handles authentication, user data, job listings, media uploads, and payment processing, enabling a seamless and secure professional networking experience.

## ✨ Features
### 🔐 Authentication & Security
- JWT-based Authentication: Secure, stateless user sessions

- Firebase OAuth: Google sign-in via Firebase

- Password Management: Encrypted reset and update

- Role-based Access Control

- Input Validation: Ensures secure and clean data

### 👤 User Profiles
- User CRUD: Create, retrieve, update, delete users

- Experience & Education: Add professional milestones

- Skills Management: Showcase technical abilities

- Media Upload: Upload avatars, resumes via Cloudinary

### 🔗 Networking
- Connection Requests: Request/accept/reject connections

- Followers: Follow professionals without direct connections

- Activity Feed: Track updates and posts

### 💼 Job Features
- Job Management: Post, edit, and delete job listings

- Application Submission: Apply to jobs directly

- Application Tracking: View job status and history

- Company Profiles: View details of employers

### 💬 Notifications
- Real-time Notifications via Firebase Cloud Messaging

- Custom Notification Channels

- Activity-based Alerts

### 💳 Payments (Stripe)
- Stripe Integration: Payments and subscriptions

- Checkout Sessions: Secure checkout for premium features

- Webhook Events: Handle updates from Stripe in real-time

## 🛠️ Technologies
### Backend Core
- Node.js – JavaScript runtime

- Express.js – Web framework

- MongoDB + Mongoose – NoSQL database and schema modeling

- Firebase Admin SDK – OAuth and messaging

- Cloudinary – Media storage and transformations

- Stripe API – Payment processing

- JWT – Token-based authentication

### Utility
- dotenv – Environment configuration

- Multer – File upload middleware

- CORS – Cross-Origin Resource Sharing

## 🚀 Getting Started
### ✅ Prerequisites
- Node.js (v18+ recommended)

- MongoDB Atlas or local instance

- Firebase Project

- Stripe Account

- Cloudinary Account

### 📦 Installation
<pre># Clone the repository
git clone https://github.com/tahaaa22/ClinkedIn/Backend.git
cd Backend</pre>


# Install dependencies
npm install
🔐 Environment Setup
Create a .env file in the root directory:
<pre> <code>
  # 🧠 reCAPTCHA
  RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
  # 🍃 MongoDB
  MONGO_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster.mongodb.net/LockedIn
  MONGODB_CONNECTION=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster.mongodb.net/LockedIn
  # 🔥 Firebase Admin SDK 
  FIREBASE_TYPE=service_account
  FIREBASE_PROJECT_ID=your-project-id
  FIREBASE_PRIVATE_KEY_ID=your-private-key-id
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR-PRIVATE-KEY\n-----END PRIVATE KEY-----\n"
  FIREBASE_CLIENT_EMAIL=your-client-email
  FIREBASE_CLIENT_ID=your-client-id
  FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
  FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
  FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
  FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk@your-project-id.iam.gserviceaccount.com
  FIREBASE_UNIVERSE_DOMAIN=googleapis.com
  # 🔐 JWT Tokens
  ACCESS_TOKEN_SECRET=your-access-token-secret
  REFRESH_TOKEN_SECRET=your-refresh-token-secret
  REFRESH_TOKEN_PATH=/refresh_token
  # ☁️ Cloudinary
  CLOUDINARY_CLOUD_NAME=your-cloud-name
  CLOUDINARY_API_KEY=your-cloudinary-api-key
  CLOUDINARY_API_SECRET=your-cloudinary-api-secret
  # 🌐 App Base URL BASE_URL=http://localhost:3000
  # 📧 Email Service LOCKEDIN_EMAIL=your-email@example.com
  EMAIL_PASSWORD=your-email-app-password
</code>
</pre>
⚠️ Important: Make sure FIREBASE_PRIVATE_KEY is properly escaped or use a JSON key file.
## ▶️ Run the App
<pre>
  <code>
   npm run devStart 
  </code>
</pre>
The server will start on http://localhost:3000 (or your configured port).

## 📁 Project Structure
LockedIn-Backend/
├── controllers/       # Request handlers
├── models/            # Mongoose schemas
├── routes/            # API endpoints
├── middlewares/       # Auth, validation, error handling
├── utils/             # Helper functions
└── server.js          # App entry point
## 🔄 API Workflow
- Authentication – Register/login (email or Google OAuth)

- Profile Setup – Users complete professional details

- Networking – Follow or connect with other users

- Job Exploration – Discover and apply to jobs

- Payment & Upgrade – Purchase premium plans

- Notifications – Get real-time updates via FCM

## 📡 API Endpoints (Preview)

| Method | Endpoint                                | Description                        |
|--------|------------------------------------------|------------------------------------|
| POST   | `/api/user/register`                     | Email/password registration        |
| GET    | `/api/user/:id`                          | Get user profile                   |
| POST   | `/api/jobs/`                             | Create a new job post              |
| POST   | `/api/stripe/create-checkout-session`    | Create Stripe checkout session     |

📘 Full API documentation via Swagger on /api/docs.

## 🧪 Testing
<pre>
  npm run test
</pre>
Use Jest for unit/integration testing.
## 🤝 Contributing
Contributions are welcome!
Feel free to fork the repo, create a new branch, and submit a Pull Request.

---

<p align="center">
  <strong>LockedIn Backend</strong> – Powering meaningful professional connections.<br>
  Built with ❤️ using Node.js and open-source technologies.
</p>
