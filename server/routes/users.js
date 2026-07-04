// File: server/routes/users.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- 1. REGISTRATION ROUTE ---
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    // Create new user instance
    user = new User({ name, email, password });

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.status(201).json({ msg: 'User registered successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// --- 2. LOGIN ROUTE ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // If credentials are correct, create and return a JWT
    const payload = {
      user: {
        id: user.id, // This payload will be encoded in the token
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' }, // Token expires in 5 hours
      (err, token) => {
        if (err) throw err;
        res.json({ token }); // Send token back to client
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

// Add this route at the bottom of server/routes/users.js (above module.exports)
router.post('/forgot-password-reset', async (req, res) => {
  try {
    const { email, name, newPassword } = req.body;

    // 1. Look for a user matching BOTH the exact email and name
    const user = await User.findOne({ email, name });
    if (!user) {
      return res.status(404).json({ message: "Verification failed. Incorrect Email or Name." });
    }

    // 2. Hash the brand new password before saving it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 3. Update the user document and save
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successful! You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Server error during reset", error: error.message });
  }
});