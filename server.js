require('dotenv').config();
const process = require('process');
const express = require('express');
const swaggerUI = require('swagger-ui-express');
const { swaggerSpec } = require('./swagger');

const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');
const reportRouter = require('./routes/reportRoutes');
const repostRouter = require('./routes/repostRoutes');
const commentRouter = require('./routes/commentRoutes');
const chatRouter = require('./routes/chatRoutes');
const messageRouter = require('./routes/messageRoutes');

const jobRouter = require('./routes/jobRoutes');
const companyRouter = require('./routes/companyRoutes');

const connectDB = require('./models/db');

const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/user', userRouter);
app.use('/posts', postRouter);
app.use('/report', reportRouter);
app.use('/repost', repostRouter);
app.use('/comments', commentRouter);
app.use('/chats', chatRouter);
app.use('/messages', messageRouter);
app.use('/jobs', jobRouter);
app.use('/company', companyRouter);


app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.listen(3000, () => {
  console.log('server started');
});
