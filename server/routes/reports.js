// File: server/routes/reports.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Report = require('../models/Report');
const axios = require('axios');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// ... (your cloudinary config is correct) ...
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const upload = multer({ storage: multer.memoryStorage() });

// --- All Your Existing Routes ---

// 1. POST /api/reports (Create Report)
// This is your existing code, no changes.
router.post('/', [auth, upload.single('photo')], async (req, res) => {
    const { name, age, gender, lastSeenLocation, description } = req.body;
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
            msg: 'Last Seen Location not found. Please try a more specific address (e.g., "New Bus Stand, Salem, Tamil Nadu").' 
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

// 2. GET /api/reports - Get all reports (Your code, fixed)
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

// 3. GET /api/reports/myreports - Get user's reports (Your code, no change)
router.get('/myreports', auth, async (req, res) => {
    try {
      const reports = await Report.find({ user: req.user.id }).sort({ createdAt: -1 });
      res.json(reports);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// 4. GET /api/reports/nearme - Find reports near a specific location (Your code, fixed)
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

// 5. GET /api/reports/found - (Your new "Found" route, no change)
router.get('/found', async (req, res) => {
  try {
    const reports = await Report.find({ status: 'Found' }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 6. GET /api/reports/:id - Get a single report (Your code, no change)
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }
    res.json(report);
  } catch (err) {
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Report not found' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 7. PUT /api/reports/:id/status (Update Only Status)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (status !== 'Missing' && status !== 'Found') {
      return res.status(400).json({ msg: 'Invalid status' });
    }
    let report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }
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

// 8. PUT /api/reports/:id (Update Full Report)
router.put('/:id', [auth, upload.single('photo')], async (req, res) => {
    const { name, age, gender, lastSeenLocation, description } = req.body;
    try {
        let report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ msg: 'Report not found' });
        if (report.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        const updatedFields = { name, age, gender, lastSeenLocation, description };
        if(lastSeenLocation && lastSeenLocation !== report.lastSeenLocation) {
            const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(lastSeenLocation)}&key=${process.env.OPENCAGE_API_KEY}`;
            try {
              const geoResponse = await axios.get(geoUrl);
              if (geoResponse.data.results.length > 0) {
                const { lat, lng } = geoResponse.data.results[0].geometry;
                updatedFields.location = { type: 'Point', coordinates: [lng, lat] };
              } else {
                return res.status(400).json({ 
                  msg: 'Last Seen Location not found. Please try a more specific address.' 
                });
              }
            } catch (geoError) {
              console.error("Geocoding failed for update:", geoError.message);
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
        console.error(err.message);
        if (err.response) {
            return res.status(err.response.status).json({ msg: err.response.data.msg });
        }
        res.status(500).send('Server Error');
    }
});

// 9. DELETE /api/reports/:id - Delete a report
// ✅ --- THIS IS THE FIXED CODE --- ✅
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
    console.error(err.message); // This is the corrected line
    res.status(500).send('Server Error');
  }
});


// 10. Your "MIGRATE-DATA-NOW" script (Your code, no change)
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
      const newLocation = {
        type: 'Point',
        coordinates: [0, 0]
      };
      
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

      await Report.updateOne(
        { _id: report._id }, 
        { $set: { location: newLocation } }
      );
      updatedCount++;
    }

    res.json({ 
      message: `Migration complete! ${updatedCount} reports were updated to the new format.`
    });

  } catch (err) {
    console.error("Migration failed:", err.message);
    res.status(500).json({ message: "Migration failed", error: err.message });
  }
});


module.exports = router;