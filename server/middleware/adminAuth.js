// File: server/middleware/adminAuth.js
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    // req.user.id comes from your regular login validation middleware
    const user = await User.findById(req.user.id);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ msg: "Access denied. Administrator clearance required." });
    }
    
    next(); // User is admin! Proceed to the operation.
  } catch (err) {
    res.status(500).json({ msg: "Server admin verification error" });
  }
};

module.exports = adminAuth;