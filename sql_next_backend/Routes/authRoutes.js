const express = require('express');
const crypto = require('crypto');
const Otp = require('../models/otp');
const User = require('../models/user');
const sendEmail = require('../middleware/emailService');
const router = express.Router();
const bcrypt = require('bcrypt');

// Send OTP
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    const otp = crypto.randomInt(1000, 9999).toString();

    try {
        // Check if a user exists for the email
        let user = await User.findOne({ email });
        if (user) {
            //console.log('user found for email:', email);
            return res.status(200).json({ message: 'User already exists. No need to send OTP.' });
        }
        else {
            // Create or update OTP
            await Otp.findOneAndUpdate(
                { email },
                { otp, otpExpires: Date.now() + 10 * 60 * 1000 },
                { upsert: true, new: true }
            );

            // Send OTP via email
            await sendEmail(email, 'OTP for Email Verification - SQL Automation', `Your Email Validation OTP is: ${otp}. It is valid for 10 minutes.\n\nPlease DO NOT SHARE this OTP with anyone.\n\nRegards,\nSQL Automation Team.`);
            res.status(200).json({ message: 'OTP sent successfully!' });
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Error sending OTP.' });
    }
});

// Validate OTP
router.post('/validate-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const otpRecord = await Otp.findOne({ email, otp, otpExpires: { $gt: Date.now() } });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        res.status(200).json({ message: 'OTP verified successfully!' });
    } catch (error) {
        console.error('Error validating OTP:', error);
        res.status(500).json({ message: 'Error validating OTP.' });
    }
});


router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const otp = crypto.randomInt(1000, 9999).toString();

    try {
        // Check if a user exists for the email
        let user = await User.findOne({
            email
        });
        if (!user) {
            return res.status(400).json({
                message: 'User not found'
            });
        }

        // Create or update OTP
        await Otp.findOneAndUpdate({
            email
        }, {
            otp,
            otpExpires: Date.now() + 10 * 60 * 1000
        }, {
            upsert: true,
            new: true
        });

        // Send OTP via email
        await sendEmail(email, 'OTP for Password Reset - SQL Automation', `Your Password Reset OTP is: ${otp}. It is valid for 10 minutes.\n\nPlease DO NOT SHARE this OTP with anyone.\n\nRegards,\nSQL Automation Team.`);
        res.status(200).json({
            message: 'OTP sent successfully!'
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({
            message: 'Error sending OTP.'
        });
    }

}
);

// Reset Password   
// Reset Password
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        // Find the OTP in the database and validate it
        const otpRecord = await Otp.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() } // Check if OTP is still valid
        });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        await User.findOneAndUpdate({ email }, { password: hashedPassword });

        // Remove the OTP record after successful reset
        await Otp.deleteOne({ email });

        res.status(200).json({ message: 'Password reset successfully!' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});


module.exports = router;
