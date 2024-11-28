const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const { cloudinary } = require('../config/cloudinary');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// GET route to fetch all songs
router.get('/', async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 }); // Get latest songs first
    res.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ message: 'Error fetching songs' });
  }
});

// POST route to add a new song
router.post('/add', 
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      if (!req.files || !req.files.image || !req.files.audio) {
        console.log('Missing files in request');
        return res.status(400).json({ message: 'Both image and audio files are required' });
      }

      // Convert buffer to base64 for Cloudinary
      const imageBase64 = `data:${req.files.image[0].mimetype};base64,${req.files.image[0].buffer.toString('base64')}`;
      const audioBase64 = `data:${req.files.audio[0].mimetype};base64,${req.files.audio[0].buffer.toString('base64')}`;

      // Upload to cloudinary
      const imageResult = await cloudinary.uploader.upload(imageBase64, {
        folder: 'puzzle-game/images'
      });

      const audioResult = await cloudinary.uploader.upload(audioBase64, {
        folder: 'puzzle-game/audio',
        resource_type: 'auto'
      });

      const newSong = new Song({
        title: req.body.title,
        album: req.body.album,
        image: imageResult.secure_url,
        audio: audioResult.secure_url
      });

      const savedSong = await newSong.save();
      res.status(201).json(savedSong);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: error.message });
    }
});

// Add DELETE route
router.delete('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Extract public_id from Cloudinary URLs
    const getPublicId = (url) => {
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      return `puzzle-game/${filename.split('.')[0]}`;
    };

    // Delete image from Cloudinary
    if (song.image) {
      try {
        await cloudinary.uploader.destroy(getPublicId(song.image));
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }

    // Delete audio from Cloudinary
    if (song.audio) {
      try {
        await cloudinary.uploader.destroy(getPublicId(song.audio), { 
          resource_type: 'video' 
        });
      } catch (error) {
        console.error('Error deleting audio from Cloudinary:', error);
      }
    }

    // Delete song from database
    await Song.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting song' });
  }
});

module.exports = router;
