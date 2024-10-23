const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    bookedRoom: {
        type: String, // Change this to String
        required: false,
    },
});

module.exports = mongoose.model('User', userSchema);
