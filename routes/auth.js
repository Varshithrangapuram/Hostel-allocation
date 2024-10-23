const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/Users'); // Import User model
const router = express.Router();

const dotenv = require('dotenv');
dotenv.config();




const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Replace with your email
        pass: process.env.EMAIL_PASS, // Replace with your email password
    },
});

const otpStore = {};

// Route to register user and send OTP
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).send('Name, email, and password are required');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Email is already registered');
        }

        // Generate a random OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Store the OTP temporarily
        otpStore[email] = otp;
        // Send OTP via email
        const mailOptions = {
            from: process.env.EMAIL_USER, // Replace with your email
            to: email,
            subject: 'OTP for Email Verification',
            text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
        };
        console.log(mailOptions);
        await transporter.sendMail(mailOptions);

        res.status(200).send('OTP sent to your email. Complete verification.');

    } catch (err) {
        res.status(400).send('Error registering user: ' + err.message);
    }
});

// OTP verification route
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    // Check if OTP matches
    if (otpStore[email] === otp) {
        // Create the user after OTP verification
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        const newUser = new User({ name: req.body.name, email, password: hashedPassword, bookedRoom: '0' });

        try {
            await newUser.save();
            // Clear the OTP after successful registration
            delete otpStore[email];
            res.status(201).send('User Registered');
        } catch (err) {
            res.status(400).send('Error completing registration: ' + err.message);
        }
    } else {
        res.status(400).send('Invalid OTP or OTP expired.');
    }
});

// User Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).send('Invalid credentials');
    }
    console.log(user);
    const token = jwt.sign({ email: user.email }, 'secret');
    res.send({
        name: user.name,
        id: user._id, // Ensure you send the _id as a string

        token // Include the user's name in the response
    });
 
});

// In your user routes file
router.get('/checkRoom/:userId', async (req, res) => {
    const userId = req.params.userId; // Get user ID from token (ensure you have middleware for auth)
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        //console.log(user);
        const isBooked = (user.bookedRoom !== '0'); // Check if the user has a bookedRoom
        console.log(user.bookedRoom);
        res.send({ isBooked });
    } catch (err) {
        res.status(500).send('Error checking room booking: ' + err.message);
    }
});

// Route to fetch user details by ID
router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Send user details as response (excluding password)
        res.json({
            name: user.name,
            email: user.email,
            bookedRoom: user.bookedRoom // Assuming this field exists in the user schema
        });
    } catch (err) {
        res.status(500).send('Error fetching user details: ' + err.message);
    }
});


module.exports = router;
