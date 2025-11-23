const express = require('express');
const multer = require('multer');
const Image = require('../models/Image');
const fs = require('fs').promises;
const deleteImageByName = require('../helpers/deleteImage');
const path = require('path');

const router = express.Router();

const uploadDirectory = 'uploads/images/';

// Ensure the directory exists, or create it
fs.mkdir(uploadDirectory, { recursive: true }).catch(err => {
    console.error(`Error creating upload directory: ${err}`);
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectory);
    },
    filename: function (req, file, cb) {
        const fileExtension = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + fileExtension);
    }
});

const upload = multer({ storage: storage });

router.post('/image', upload.single('image'), async (req, res) => {
    try {
        // Check if an image file was uploaded
        if (!req.file) {
            return res.status(400).json({ status: false, error: 'Please upload an image file' });
        }

        const newImage = new Image({
            filename: req.file.filename,
            path: process.env.BACKEND_URL + '/images/' + req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        const image = await newImage.save();

        res.status(201).json({ status: true, message: 'Image uploaded successfully', data: image });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, error: 'Image upload failed' });
    }
});

router.delete('/delete/:filename', async (req, res) => {
    const filename = req.params.filename;

    const deletionResult = await deleteImageByName(filename);

    if (deletionResult.success) {
        res.status(200).json({ status: true, message: deletionResult.message });
    } else {
        res.status(500).json({ status: false, error: deletionResult.error });
    }
});

module.exports = router;
