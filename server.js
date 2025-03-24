require("dotenv").config();
const yaml = require("js-yaml"); // Add this import at the top
const process = require("process");
const express = require("express");
const swaggerUI = require("swagger-ui-express");
const { swaggerSpec } = require("./swagger");

const userRouter = require("./routes/userRoutes");
const userProfileRouter = require("./routes/userProfileRouter");
const postRouter = require("./routes/postRoutes");
const reportRouter = require("./routes/reportRoutes");
const commentRouter = require("./routes/commentRoutes");
const chatRouter = require("./routes/chatRoutes");
const messageRouter = require("./routes/messageRoutes");
const jobRouter = require("./routes/jobRoutes");
const companyRouter = require("./routes/companyRoutes");
//to be removed
const uploadRouter = require("./routes/uploadRoutes");
const connectDB = require("./models/db");
const cookieParser = require("cookie-parser");

const app = express();
connectDB();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRouter);
app.use("/user", userProfileRouter);
app.use("/posts", postRouter);
app.use("/report", reportRouter);
app.use("/comments", commentRouter);
app.use("/chats", chatRouter);
app.use("/messages", messageRouter);
app.use("/jobs", jobRouter);
app.use("/company", companyRouter);
app.use("/upload", uploadRouter);

app.use(
  "/api-docs",
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
});

// Serve Swagger spec as YAML
app.get("/swagger.yaml", (req, res) => {
  const yamlString = yaml.dump(swaggerSpec);
  res.setHeader("Content-Type", "text/yaml");
  res.send(yamlString);
});

app.listen(3000, () => {
  console.log(`server started: http://localhost:3000`);
});
