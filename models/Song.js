const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  album: { type: String, required: true },
  image: { type: String, required: true }, // Path to the uploaded image
  audio: { type: String, required: true }, // Path to the uploaded audio file
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Song", songSchema);
