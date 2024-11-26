const express = require("express");
const multer = require("multer");
const Song = require("../models/Song");
const mongoose = require('mongoose');
const { uploadCloud } = require('../config/cloudinary');

const router = express.Router();

// Configure Multer for audio files only
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/audio");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const audioUpload = multer({ storage: audioStorage });

// Add new song route
router.post("/add", 
  uploadCloud.single('image'),
  audioUpload.single('audio'), 
  async (req, res) => {
    try {
      const { title, album } = req.body;

      if (!title || !album) {
        return res.status(400).json({ error: "Title and album are required" });
      }

      const newSong = new Song({
        title,
        album,
        image: {
          url: req.file.path, // Cloudinary URL
          public_id: req.file.filename // Cloudinary public_id
        },
        audio: req.file.path // Local audio path
      });

      await newSong.save();
      res.status(201).json({ 
        message: "Song added successfully!", 
        song: newSong 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error. Try again later." });
    }
  }
);

// Add delete route with Cloudinary image deletion
router.delete('/songs/:id', async (req, res) => {
  try {
    const songId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(songId)) {
      return res.status(400).json({ message: 'Invalid song ID format' });
    }

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Delete image from Cloudinary
    if (song.image.public_id) {
      await cloudinary.uploader.destroy(song.image.public_id);
    }

    // Delete song from database
    await Song.findByIdAndDelete(songId);
    
    res.status(200).json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error in delete route:', error);
    res.status(500).json({ message: 'Error deleting song', error: error.message });
  }
});

// Get all songs route
router.get("/", async (req, res) => {
  try {
    const songs = await Song.find(); // Fetch all songs from MongoDB
    res.status(200).json(songs); // Send them as JSON response
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({ error: "Server error. Try again later." });
  }
});

module.exports = router;
