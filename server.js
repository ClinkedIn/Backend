require('dotenv').config();


const express = require('express');
const app = express();
const mongoose = require('mongoose');  

const userRouter = require('./routes/User');
const postRouter = require('./routes/Post');
const reportRouter = require('./routes/Report');
const repostRouter = require('./routes/Repost');


mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('connected to database'));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/user', userRouter);
app.use('/post', postRouter);
app.use('/report', reportRouter);
app.use('/repost', repostRouter);
app.listen(3000, () => {
  console.log('server started');
});
