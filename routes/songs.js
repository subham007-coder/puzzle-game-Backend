const express = require("express");
const multer = require("multer");
const Song = require("../models/Song");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

const router = express.Router();

const storage = multer.memoryStorage(); // Store files in memory for Cloudinary upload
const upload = multer({ storage });

// Add new song route
router.post(
  "/add",
  upload.fields([{ name: "image" }, { name: "audio" }]),
  async (req, res) => {
    try {
      const { title, album } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      let imageUrl = null;
      let audioUrl = null;

      // Upload image to Cloudinary
      if (req.files.image) {
        const imageFile = req.files.image[0];
        const uploadResult = await cloudinary.uploader.upload_stream({
          folder: "songs/images",
          resource_type: "image",
        }, (error, result) => {
          if (error) {
            throw error;
          }
          imageUrl = result.secure_url;
        }).end(imageFile.buffer);
      }

      // Upload audio to Cloudinary
      if (req.files.audio) {
        const audioFile = req.files.audio[0];
        const uploadResult = await cloudinary.uploader.upload_stream({
          folder: "songs/audio",
          resource_type: "video", // Cloudinary treats audio as "video"
        }, (error, result) => {
          if (error) {
            throw error;
          }
          audioUrl = result.secure_url;
        }).end(audioFile.buffer);
      }

      // Save song to MongoDB
      const newSong = new Song({
        title,
        album,
        image: imageUrl,
        audio: audioUrl,
      });

      await newSong.save();
      res.status(201).json({ message: "Song added successfully!", song: newSong });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error. Try again later." });
    }
  }
);

module.exports = router;
