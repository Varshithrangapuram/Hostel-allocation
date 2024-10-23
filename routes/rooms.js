const express = require('express');
const Room = require('../models/Room'); // Import Room model
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/Users');

// Show All the Rooms
router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find();
        res.send(rooms.map(room => ({
            id: room.id,
            roomNumber: room.roomNumber,
            floorNumber: room.floorNumber, // Include the floorNumber
            isAvailable: room.isAvailable,
        })));
    } catch (err) {
        res.status(500).send('Error fetching rooms: ' + err.message);
    }
});

// In your user routes file to check who is the user that booked the room
router.get('/checkRoom/:roomId', async (req, res) => {
    const roomId = req.params.roomId;
    try {
        // Find the room to get its roomNumber
        const room = await Room.findById(roomId);
        console.log(room);
        if (!room) {
            return res.status(404).send('Room not found');
        }

        // Now, find a user who has booked the roomNumber
        const user = await User.findOne({ bookedRoom: room.roomNumber });
        console.log(user);
        if (user) {
            // Room is booked by a user
            return res.send({ isBooked: true, bookedBy: user.email }); // Optionally return who booked it
        } else {
            // Room is not booked by any user
            return res.send({ isBooked: false });
        }
    } catch (err) {
        res.status(500).send('Error checking room booking: ' + err.message);
    }
});

//book the room
router.post('/book/:roomId/:userId', async (req, res) => {
    const roomId = req.params.roomId;
    const userId = req.params.userId;

    try {
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).send('Room not found');
        }

        // Check availability
        if (room.isAvailable) {
            return res.status(400).send('Room already booked');
        }

        // Increment the version to ensure the room state is updated
        const updatedRoom = await Room.findOneAndUpdate(
            { _id: roomId, version: room.version }, // Match the current version
            { $set: { isAvailable: true, version: room.version + 1 } }, // Update room availability and increment version
            { new: true } // Return the updated room
        );

        if (!updatedRoom) {
            return res.status(409).send('Conflict: Room has already been booked by another user');
        }

        // Find the user by ID and update their bookedRoom
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        user.bookedRoom = room.roomNumber; // Update user's booked room
        await user.save();

        res.send('Room booked successfully');
    } catch (err) {
        console.error('Error details:', err);
        res.status(500).send('Error booking room: ' + err.message);
    }
});



module.exports = router;