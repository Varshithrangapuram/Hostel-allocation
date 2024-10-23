const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: String,
    isAvailable: { type: Boolean, default: false },
    floorNumber: { type: String, required: true },
    version: { type: Number, default: 0 }, // Changed to String type
});

module.exports = mongoose.model('Room', roomSchema);
