const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  album: { type: String, required: true },
  image: { 
    url: { type: String, required: true }, // Cloudinary URL
    public_id: { type: String, required: true } // Cloudinary public_id for deletion
  },
  audio: { type: String, required: true }, // Path to the uploaded audio file
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Song", songSchema);
