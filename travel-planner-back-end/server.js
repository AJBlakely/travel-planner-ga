// environment configuration
const dotenv = require('dotenv');
dotenv.config();

// Core
const express = require('express');
const mongoose = require('mongoose');
const {google} = require('googleapis')

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

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

app.use(cors());
app.use(express.json());
app.use(logger('dev'));

// Routes go here
app.use('/test-jwt', testJwtRouter)
app.use('/auth', authRouter)
app.use('/users', userRouter)
app.use('/trips', tripsRouter)
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`Listening on port: ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
