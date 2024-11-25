const express = require("express");
const multer = require("multer");
const Song = require("../models/Song");
const mongoose = require('mongoose'); // Add this import
const { uploadCloud } = require('../config/cloudinary');

const router = express.Router();

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, "uploads/images");
    } else if (file.mimetype.startsWith("audio/")) {
      cb(null, "uploads/audio");
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const uploadCloud = uploadCloud.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]);

// Add new song route
router.post("/add", uploadCloud, async (req, res) => {
  try {
    const { title, album } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title are required" });
    }

    const imageUrl = req.files.image[0].path;
    const audioPath = req.files.audio[0].path; // This will still be local storage

    const newSong = new Song({ title, album, imageUrl, audioPath });
    await newSong.save();

    res.status(201).json({ message: "Song added successfully!", song: newSong });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error. Try again later." });
  }
});

// DELETE route to remove a song
router.delete('/songs/:id', async (req, res) => {
  try {
    const songId = req.params.id;
    console.log('Attempting to delete song with ID:', songId); // Debug log

    // Check if songId is valid
    if (!mongoose.Types.ObjectId.isValid(songId)) {
      console.log('Invalid song ID format'); // Debug log
      return res.status(400).json({ message: 'Invalid song ID format' });
    }

    const deletedSong = await Song.findByIdAndDelete(songId);
    console.log('Deleted song result:', deletedSong); // Debug log
    
    if (!deletedSong) {
      console.log('Song not found in database'); // Debug log
      return res.status(404).json({ message: 'Song not found' });
    }
    
    console.log('Song deleted successfully'); // Debug log
    res.status(200).json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error in delete route:', error); // Debug log
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
