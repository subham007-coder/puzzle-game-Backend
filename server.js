const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const songsRouter = require('./routes/songs');

const app = express();

// Middleware
app.use(cors({
  origin: ['https://f-end-puzzle-game-admin-panel.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/songs', songsRouter);  // This line is important

// Serve static files
app.use('/uploads', express.static('uploads'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
