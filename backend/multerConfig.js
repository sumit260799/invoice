const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up the uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Save files to 'uploads' folder
  },
  filename: (req, file, cb) => {
    console.log('file', file);
    cb(null, Date.now() + '-' + file.originalname); // Avoid filename conflicts
  },
});

// Configure multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Set file size limit per file
}).array('files', 10); // Set field name and max number of files

const uploadFiles = (req, res, next) => {
  upload(req, res, err => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    // Check if files are present
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }

    const totalSize = req.files.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 100 * 1024 * 1024) {
      // Check total size limit (100 MB)
      return res
        .status(400)
        .json({ message: 'Total file size exceeds 100 MB' });
    }

    next();
  });
};

module.exports = { uploadFiles };
