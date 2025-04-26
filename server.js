require("dotenv").config();
const yaml = require("js-yaml"); // Add this import at the top
const process = require("process");
const express = require("express");
const cors = require('cors');
const swaggerUI = require("swagger-ui-express");
const { swaggerSpec } = require("./swagger");

const userRouter = require("./routes/userRoutes");
const userProfileRouter = require("./routes/userProfileRouter");
const postRouter = require("./routes/postRoutes");
const reportRouter = require("./routes/reportRoutes");
const commentRouter = require("./routes/commentRoutes");
const chatRouter = require("./routes/chatRoutes");
const notificationRouter = require("./routes/notificationRoutes");
const messageRouter = require("./routes/messageRoutes");
const jobRouter = require("./routes/jobRoutes");
const companyRouter = require("./routes/companyRoutes");
const searchRouter = require("./routes/searchRoutes");
const adminRouter = require("./routes/adminRoutes");
const uploadRouter = require("./routes/uploadRoutes");
const stripeRouter = require("./routes/stripeRoutes");
const connectDB = require("./models/db");
const cookieParser = require("cookie-parser");
const stripeController = require("./controllers/stripeController"); // Import the controller
const app = express();
connectDB();
const corsOptions = {
  origin: "https://www.lockedin-cufe.me", // Allow all origins
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
};

app.use(cors(corsOptions));
// Add these lines BEFORE any JSON body parsing middleware:
app.post('/server/stripe/webhook', 
  express.raw({ type: 'application/json' }),
  stripeController.handleWebhook  // Direct reference to the controller
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/api/user", userRouter);
app.use("/api/user", userProfileRouter);
app.use("/api/posts", postRouter);
app.use("/api/report", reportRouter);
app.use("/api/comments", commentRouter);
app.use("/api/chats", chatRouter);
app.use("/api/messages", messageRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/companies", companyRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/search", searchRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/admin", adminRouter);
app.use("/api/stripe", stripeRouter);
app.use(
  "/api/docs",
  swaggerUI.serve,
  swaggerUI.setup(swaggerSpec, {
    swaggerOptions: {
      dom_id: "#swagger-ui",
      displayRequestDuration: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
      persistAuthorization: true,
      displayOperationId: true,
      filter: true,
      supportedSubmitMethods: [
        "get",
        "put",
        "post",
        "delete",
        "options",
        "head",
        "patch",
        "trace",
      ],
      // Add download options
      defaultModelsExpandDepth: -1,
      defaultModelExpandDepth: -1,
      docExpansion: "none",
      // Enable export
      deepLinking: true,
      layout: "StandaloneLayout",
    },
    customCss: ".swagger-ui .topbar { display: flex !important; }",
    customSiteTitle: "Your API Documentation",
  })
);

app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
}); // <-- Properly close this route handler

// Serve Swagger spec as YAML
app.get("/swagger.yaml", (req, res) => {
  const yamlString = yaml.dump(swaggerSpec);
  res.setHeader("Content-Type", "text/yaml");
  res.send(yamlString);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
