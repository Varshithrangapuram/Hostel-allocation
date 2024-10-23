const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    bookedBy: { type: String, required: false }, // Change to String
});

const BookedRoom = mongoose.model('BookedRoom', roomSchema);

