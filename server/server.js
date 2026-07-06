// --- IMPORTS ---
// This line must be at the very top to load your .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Imports the cors package
const reportRoutes = require('./routes/reports'); // Imports your API routes for reports
const userRoutes = require('./routes/users'); // Imports your new API routes for users

// 👤 Import the custom authentication middleware and User Model for our profile route
const customAuth = require('./middleware/auth'); // Make sure this path matches your auth middleware file!
const User = require('./models/User'); // Make sure this path matches your User model schema file!

// --- APP INITIALIZATION ---
const app = express();
const PORT = process.env.PORT || 5001;

// --- MIDDLEWARE ---
// Middleware runs for every request that comes into your server
app.use(cors()); // This fixes the CORS error by allowing requests from other origins
app.use(express.json()); // This allows your server to read JSON data from requests

// --- DATABASE CONNECTION ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully!');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1); // Exit the server if the database connection fails
  }
};

// --- EXTRA PRODUCTION ROUTES ---

// ✅ NEW USER ACCOUNT ENDPOINT FOR PROFILE PAGE
// This responds to GET requests at: http://localhost:5001/api/reports/account/me
app.get('/api/reports/account/me', customAuth, async (req, res) => {
  try {
    // req.user.id is securely extracted from the token by your customAuth middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User record not found in database' });
    }
    res.json(user); // Sends back the user object containing { name, email, ... }
  } catch (err) {
    console.error("Profile endpoint error:", err.message);
    res.status(500).send('Server Profile Error');
  }
});

// --- ROUTES ---
// This tells the app which router to use for different URL paths
app.use('/api/reports', reportRoutes); // Handles all URLs starting with /api/reports
app.use('/api/users', userRoutes); // ✅ Handles all URLs starting with /api/users

// --- START SERVER ---
// This code first connects to the database, and only after a successful
// connection, it starts the web server to listen for requests.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});