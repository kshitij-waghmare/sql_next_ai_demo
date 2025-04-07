const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Create a transporter using environment variables for sensitive info
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "sqlautomate@gmail.com",  // Use environment variable for email
        pass: "liom fsgs gzdq gbjz",  // Use environment variable for password
    },
});

const sendEmail = async (to, subject, text) => {
    try {
        const info = await transporter.sendMail({
            from: "sqlautomate@gmail.com", // Using environment variable for sender email
            to,
            subject,
            text,
        });
        //console.log("Email sent: " + info.response);
        return true;  // Return true if email is successfully sent
    } catch (error) {
        //console.error("Error sending email:", error);
        return false; // Return false in case of error
    }
};

module.exports = sendEmail;