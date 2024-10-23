const mongoose = require('mongoose');
const Room = require('./models/Room'); // Adjust the path based on your directory structure

const mongoURI = 'mongodb://localhost:27017/booking_db'; // Replace with your actual MongoDB connection string

mongoose.connect(mongoURI)
    .then(async () => {
        console.log('MongoDB connected successfully');

        // Check if rooms already exist
        const existingRooms = await Room.find();
        if (existingRooms.length === 0) {
            const roomsToInsert = [];
            
            // Loop through floors 1 to 5
            for (let floor = 1; floor <= 5; floor++) {
                // Loop through room numbers 1 to 16 on each floor
                for (let room = 1; room <= 16; room++) {
                    // Create roomNumber by combining floor number and room number (zero-padded if necessary)
                    const roomNumber = `${floor}${room.toString().padStart(2, '0')}`; // e.g., 101, 102, 203, 515

                    roomsToInsert.push({
                        roomNumber: roomNumber,
                        floorNumber: floor.toString(),  // Store the floor number separately as a string
                        isAvailable: false,
                        version:0              // Set rooms as available initially
                    });
                }
            }

            // Insert initial room documents
            await Room.insertMany(roomsToInsert);
            console.log('Rooms inserted successfully');
        } else {
            console.log('Rooms already exist, skipping insertion');
        }

        mongoose.disconnect();
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        mongoose.disconnect();
    });
