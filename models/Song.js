const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  album: { type: String, required: true },
  image: { type: String, required: true },
  imagePublicId: { type: String },
  audio: { type: String, required: true },
  audioPublicId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Song", songSchema);