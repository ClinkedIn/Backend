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

const app = express();
  
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('connected to database'));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/user', userRouter);
app.use('/posts', postRouter);
app.use('/report', reportRouter);
app.use('/repost', repostRouter);
app.use('/comments', commentRouter);


app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.listen(3000, () => {
  console.log('server started');
});
