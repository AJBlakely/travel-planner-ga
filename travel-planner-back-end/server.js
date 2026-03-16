// environment configuration
const dotenv = require('dotenv');
dotenv.config();

// Core
const express = require('express');
const mongoose = require('mongoose');

// middleware
const cors = require('cors');
const logger = require('morgan');

//Route imports
const testJwtRouter = require('./controllers/test-jwt')
const authRouter = require('./controllers/auth')
const userRouter = require('./controllers/users')
const tripsRouter = require('./controllers/trips')

//App setup
const app = express();
const PORT = process.env.PORT || 3000

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(cors());
app.use(express.json());
app.use(logger('dev'));

// Routes go here
app.use('/test-jwt', testJwtRouter)
app.use('/auth', authRouter)
app.use('/users', userRouter)
app.use('/trips', tripsRouter)


app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});