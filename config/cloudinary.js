const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage configuration for images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'puzzle-game/images',
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});

// Storage configuration for audio
const audioStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'puzzle-game/audio',
    resource_type: 'raw',
    allowed_formats: ['mp3', 'wav']
  }
});

const uploadImage = multer({ storage: imageStorage });
const uploadAudio = multer({ storage: audioStorage });

module.exports = { uploadImage, uploadAudio, cloudinary }; 