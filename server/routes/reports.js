// File: server/routes/reports.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Report = require('../models/Report');
const User = require('../models/User'); // ✅ Imported User model to verify isAdmin flag
const axios = require('axios');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// --- Cloudinary Configuration ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const upload = multer({ storage: multer.memoryStorage() });

// --- 🛠️ INTERNAL ADMIN PROTECTION MIDDLEWARE ---
// This safely checks if the logged-in user has isAdmin: true inside MongoDB
const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ msg: 'Access denied. Administrator clearance required.' });
    }
    next();
  } catch (err) {
    res.status(500).send('Admin verification server error');
  }
};


// ==========================================
//          EXISTING PUBLIC ROUTES            
// ==========================================

// 1. POST /api/reports (Create Report)
router.post('/', [auth, upload.single('photo')], async (req, res) => {
    const { name, age, gender, lastSeenLocation, description, contactPhone } = req.body; 
    try {
        if (!req.file) return res.status(400).json({ msg: 'Photo is required' });
        let locationData = null;
        const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(lastSeenLocation)}&key=${process.env.OPENCAGE_API_KEY}`;
        try {
          const geoResponse = await axios.get(geoUrl);
          if (geoResponse.data.results.length > 0) {
            const { lat, lng } = geoResponse.data.results[0].geometry;
            locationData = { type: 'Point', coordinates: [lng, lat] }; 
          }
        } catch (geoError) {
          console.error("Geocoding failed:", geoError.message);
          return res.status(500).json({ msg: 'Map service failed' });
        }
        if (!locationData) {
          return res.status(400).json({ 
            msg: 'Last Seen Location not found. Please try a more specific address.' 
          });
        }
        const uniqueFilename = `${name.replace(/\s+/g, '_')}-${Date.now()}`;
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ folder: 'missing_persons', public_id: uniqueFilename }, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
            uploadStream.end(req.file.buffer);
        });
        const newReport = new Report({
            user: req.user.id, name, age, gender,
            photoURL: uploadResult.secure_url,
            lastSeenLocation,
            location: locationData,
            description,
            contactPhone 
        });
        const report = await newReport.save();
        res.status(201).json(report);
    } catch (err) {
        console.error(err.message);
        if (err.response) {
            return res.status(err.response.status).json({ msg: err.response.data.msg });
        }
        res.status(500).send('Server Error');
    }
});

// 2. GET /api/reports - Get all active missing reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find({
      $or: [
        { status: 'Missing' },
        { status: { $exists: false } }
      ]
    }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 3. GET /api/reports/myreports - Get logged-in user's reports
router.get('/myreports', auth, async (req, res) => {
    try {
      const reports = await Report.find({ user: req.user.id }).sort({ createdAt: -1 });
      res.json(reports);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// 4. GET /api/reports/nearme - Find nearby locations
router.get('/nearme', async (req, res) => {
  try {
    const { lat, lng, distance } = req.query;
    const maxDistance = (distance || 20) * 1000;
    
    const reports = await Report.find({
      $or: [
        { status: 'Missing' },
        { status: { $exists: false } }
      ],
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: maxDistance
        }
      }
    });
    res.json(reports);
  } catch (err) {
    console.error("Error in /nearme route:", err.message);
    res.status(500).send('Server Error');
  }
});

// 5. GET /api/reports/found - Get found listings
router.get('/found', async (req, res) => {
  try {
    const reports = await Report.find({ status: 'Found' }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 6. GET /api/reports/:id - Individual profile check
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ msg: 'Report not found' });
    res.json(report);
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Report not found' });
    res.status(500).send('Server Error');
  }
});

// 7. PUT /api/reports/:id/status (Standard User Status Change)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (status !== 'Missing' && status !== 'Found') {
      return res.status(400).json({ msg: 'Invalid status' });
    }
    let report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ msg: 'Report not found' });
    if (report.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    report.status = status;
    await report.save();
    res.json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 8. PUT /api/reports/:id (Standard User Modification Update)
router.put('/:id', [auth, upload.single('photo')], async (req, res) => {
    const { name, age, gender, lastSeenLocation, description, contactPhone } = req.body; 
    try {
        let report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ msg: 'Report not found' });
        if (report.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        const updatedFields = { name, age, gender, lastSeenLocation, description, contactPhone };
        if(lastSeenLocation && lastSeenLocation !== report.lastSeenLocation) {
            const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(lastSeenLocation)}&key=${process.env.OPENCAGE_API_KEY}`;
            try {
              const geoResponse = await axios.get(geoUrl);
              if (geoResponse.data.results.length > 0) {
                const { lat, lng } = geoResponse.data.results[0].geometry;
                updatedFields.location = { type: 'Point', coordinates: [lng, lat] };
              } else {
                return res.status(400).json({ msg: 'Last Seen Location not found.' });
              }
            } catch (geoError) {
              return res.status(500).json({ msg: 'Map service failed' });
            }
        }
        if (req.file) {
            const uniqueFilename = `${name.replace(/\s+/g, '_')}-${Date.now()}`;
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({ folder: 'missing_persons', public_id: uniqueFilename }, (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                });
                uploadStream.end(req.file.buffer);
            });
            updatedFields.photoURL = uploadResult.secure_url;
        }
        report = await Report.findByIdAndUpdate(req.params.id, { $set: updatedFields }, { new: true });
        res.json(report);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// 9. DELETE /api/reports/:id (Standard User Delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    let report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ msg: 'Report not found' });
    if (report.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    await Report.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Report removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});


// ==========================================
//          👑 BRAND NEW ADMIN ROUTES         
// ==========================================

// ✅ A. GET /api/reports/admin/all - Admin view to fetch EVERYTHING (Missing + Found together)
router.get('/admin/all', [auth, adminOnly], async (req, res) => {
  try {
    const allReports = await Report.find().sort({ createdAt: -1 });
    res.json(allReports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ✅ B. PUT /api/reports/admin/status/:id - Admin can mark ANY profile case as 'Found'
router.put('/admin/status/:id', [auth, adminOnly], async (req, res) => {
  try {
    const { status } = req.body;
    if (status !== 'Missing' && status !== 'Found') {
      return res.status(400).json({ msg: 'Invalid status format' });
    }
    
    let report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ msg: 'Report record not found' });

    report.status = status;
    await report.save();
    res.json({ msg: `Administrative update: Case status changed to ${status}`, report });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ✅ C. DELETE /api/reports/admin/delete/:id - Admin master delete override button
router.delete('/admin/delete/:id', [auth, adminOnly], async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ msg: 'Report record not found' });

    await Report.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Administrative action: Report permanently removed from index.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// 10. Your "MIGRATE-DATA-NOW" script (No change)
router.get('/utils/MIGRATE-DATA-NOW', async (req, res) => {
  try {
    const oldReports = await Report.find({ 
      "location.lat": { $exists: true },
      "location.type": { $exists: false }
    });
    if (oldReports.length === 0) {
      return res.json({ message: "No old reports found to migrate. All data is up to date." });
    }
    let updatedCount = 0;
    for (let report of oldReports) {
      const newLocation = { type: 'Point', coordinates: [0, 0] };
      try {
        const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(report.lastSeenLocation)}&key=${process.env.OPENCAGE_API_KEY}`;
        const geoResponse = await axios.get(geoUrl);
        if (geoResponse.data.results.length > 0) {
          const { lat, lng } = geoResponse.data.results[0].geometry;
          newLocation.coordinates = [lng, lat];
        }
      } catch (e) {
        console.error("Failed to re-geocode report:", report._id);
      }
      await Report.updateOne({ _id: report._id }, { $set: { location: newLocation } });
      updatedCount++;
    }
    res.json({ message: `Migration complete! ${updatedCount} reports were updated.` });
  } catch (err) {
    res.status(500).json({ message: "Migration failed", error: err.message });
  }
});

module.exports = router;