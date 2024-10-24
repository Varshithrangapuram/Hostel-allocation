const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth'); // Import auth routes
const roomRoutes = require('./routes/rooms'); // Import room routes
const cors = require('cors');

const path = require('path');


const app = express();
app.use(express.json());
app.use(cors());
const mongoURI = process.env.MONGO_URI// Replace with your actual database name

// Connect to MongoDB
mongoose.connect(mongoURI)
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Use routes
app.use('/auth', authRoutes); // Prefix for authentication routes
app.use('/rooms', roomRoutes); // Prefix for room-related routes


app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
})



// Start the server
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
