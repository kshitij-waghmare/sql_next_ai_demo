const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Otp = require('../models/otp');
const Role = require('../models/Role');
const DeletionRequest = require('../models/DeletionRequest');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const ActivityType = require('../models/activityType');
const UserActivity = require('../models/userActivity');
const sendEmail = require('../middleware/emailService');
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
const terminatedSession = new Set(); 
// Secret keys
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = '1h';

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in the environment variables.");
}

// Create User
router.post('/createuser', async (req, res) => {
    const { firstName, lastName, email, password, role_id } = req.body;

    if (!email || !password || !firstName || !role_id) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {

        // Hash the password for security
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user record in the User model
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role_id,
        });

        await newUser.save();
        res.status(200).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user.' });
    }
});

// Register User
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, role_id } = req.body;

    if (!email || !password || !firstName || !role_id) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check if the email exists in the OTP model
        const otpRecord = await Otp.findOne({ email });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Email not verified.' });
        }

        // Hash the password for security
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user record in the User model
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role_id,
        });

        await newUser.save();

        // Optionally: Remove the OTP record after successful registration
        await Otp.deleteOne({ email });

        res.status(200).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user.' });
    }
});


// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Find role details based on user's role_id
        const roleDetails = await Role.findOne({ _id: user.role_id }); // Using `_id` for querying
        if (!roleDetails) {
            return res.status(404).json({ message: 'Role not found for the user.' });
        }
        const roleName = roleDetails.role_name;

        // Verify the password using bcrypt.compare
        const isPasswordValid = await bcrypt.compare(password, user.password); // compare plaintext with hashed
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

     
        // Generate JWT token
        const token = jwt.sign({ email, sub: user._id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

        // Find or create "session start" activity type
        let sessionStartActivity = await ActivityType.findOne({ activity_name: 'session start' });
        if (!sessionStartActivity) {
            sessionStartActivity = await ActivityType.create({ activity_name: 'session start' });
        }
        
        // Log "session start" in UserActivity
        await UserActivity.create({
            user_id: user._id,
            activity_id: sessionStartActivity._id,
            user_created: user._id,
        });

        res.json({
            message: 'Login successful!',
            token,
            role: roleName,
            passwordHash: user.password,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


// Function to generate a random temporary password
const generateTempPassword = (length = 8) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    return Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)])
        .join('');
};

router.post('/temp-password', async (req, res) => {
    const { email } = req.body;

    // Log the incoming email for debugging
    //console.log("Received email:", email);

    try {
        // Check if the email exists in the User model
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            //console.log('User already exists in User model:', email); // Log user existence in User model
            return res.status(400).json({ success: false, message: 'User already exists.' });
        }

        // If no user is found, proceed to generate a temporary password
        const tempPassword = generateTempPassword();
        //console.log('Generated temporary password:', tempPassword); // Log the generated password

        // Send email with the temporary password
        const emailSent = await sendEmail(
            email,
            "Temporary Password - SQL Automation",
            `Your temporary password is: ${tempPassword}. Please change your password as soon as possible.\n\nDO NOT SHARE this password with anyone.\n\nRegards,\nSQL Automation Team.`
        );

        if (emailSent) {
            //console.log('Temporary password sent successfully to:', email);  // Log if email was sent successfully
            return res.status(200).json({
                success: true,
                message: 'Temporary password has been sent to your email.',
                tempPassword,
            });
        } else {
            console.error('Failed to send email to:', email); // Log failure to send email
            return res.status(500).json({
                success: false,
                message: 'Failed to send email. Please try again later.',
            });
        }
    } catch (error) {
        // Log any unexpected errors that occur during the process
        console.error('Error in temp-password route:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while generating the temporary password.',
        });
    }
});


router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email }).populate('role_id');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        
        const roles = user.role_id;
        //console.log(roles);
        const roleDetails = await Role.findOne({ _id: user.role_id }); // Use `_id` to query the Role model
        //console.log(roleDetails);
        const name = roleDetails.role_name;
        //console.log(name);
        res.status(200).json({
            user_id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            roleName: name,
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


// Fetch all users with role names
router.get('/all-users', async (req, res) => {
    try {
        // Fetch all users
        const users = await User.find().select('-password'); // Exclude password for security

        // Fetch all roles (to map role_id to role_name)
        const roles = await Role.find();

        // Map user role_id to role_name
        const usersWithRoleNames = users.map(user => {
            const role = roles.find(r => r._id.toString() === user.role_id);
            return {
                ...user._doc, // Spread user details
                role_name: role ? role.role_name : 'Unknown' // Assign role name
            };
        });

        // Filter out admin users
        const filteredUsers = usersWithRoleNames.filter(user => user.role_name !== 'ADMIN');

        res.json(filteredUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// delete user
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;

// update user
router.put('/:id', async (req, res) => {
    try {
        const { firstName, lastName, email, role_name } = req.body;

        // Find the role_id from the Role model based on role_name
        const role = await Role.findOne({ role_name });
        if (!role) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { firstName, lastName, email, role_id: role._id, sys_update_date: new Date() },
            { new: true } // Return updated user
        );

        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// Fetch all role names
router.get('/roles', async (req, res) => {
    try {
        const roles = await Role.find().select('role_name -_id'); // Fetch only role_name field
        const roleNames = roles.map(role => role.role_name);
        res.json(roleNames);
    } catch (error) {
        console.error("Error fetching role names:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete request API
router.post('/delete-request', authMiddleware, async (req, res) => {
    const { userId } = req.body;

    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find the role name using role_id
        const role = await Role.findById(user.role_id);
        const roleName = role ? role.role_name : "Unknown";

        // Save the deletion request with user details
        const newRequest = new DeletionRequest({
            userId,
            firstName: user.firstName,
            lastName: user.lastName || "",
            email: user.email,
            role: roleName,
            requestedAt: new Date(),
            deleteAt: new Date(Date.now() + 1 * 60 * 1000), // Delete after 1 min
            status: "pending",
        });

        await newRequest.save();

        // Send email to confirm deletion request
        await sendEmail(
            user.email,
            "Delete Account Request - SQL Automation",
            `You have requested to delete your account. Your account will be deleted after 1 minute. 
            If you did not make this request, please contact support immediately.\n\nRegards,\nSQL Automation Team.`
        );

        // Schedule user deletion after 1 minute
        setTimeout(async () => {
            try {
                await User.findByIdAndDelete(userId);
                await DeletionRequest.findByIdAndUpdate(newRequest._id, { status: "deleted" });

                // Send final confirmation email after deletion
                await sendEmail(
                    user.email,
                    "Account Deletion Confirmation - SQL Automation",
                    `Your account has been successfully deleted. \n
                    If this was a mistake, please contact support immediately.\n\nRegards,\nSQL Automation Team.`
                );

                // console.log(`User ${user.email} deleted and email notification sent.`);

            } catch (error) {
                console.error("Error deleting user and sending confirmation email:", error);
            }
        }, 1 * 60 * 1000); // Delete after 1 min

        res.json({ message: "Delete request saved successfully." });

    } catch (error) {
        console.error("Error processing delete request:", error);
        res.status(500).json({ message: "Server error" });
    }
});



// show details of deleted users name, email, role, deletedAt, requestedAt, status from two tables users and deletion requesttable
router.get('/deleted-users', async (req, res) => {
    try {
        const deletedUsers = await DeletionRequest.find().select("-_id userId firstName lastName email role requestedAt deleteAt status");
        res.json(deletedUsers);
    } catch (error) {
        console.error("Error fetching deleted users:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/search", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const roleDetails = await Role.findOne({ _id: user.role_id }); // Use `_id` to query the Role model
        //console.log(roleDetails);
        const name = roleDetails.role_name;
        res.status(200).json({
            firstName: user.firstName,
            lastName: user.lastName,
            roleName: name,
            email: user.email
        });
    } catch (error) {
        console.error("Error searching user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.post("/resetadmin", async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ message: "Email and new password are required" });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        
        res.status(200).json({ message: "Password reset successful" });
        await sendEmail(email, 'Password Reset by Admin - SQL Automation', `Your Password is: ${newPassword}.Please change the password as soon as possible.\n\nPlease DO NOT SHARE this with anyone.\n\nRegards,\nSQL Automation Team.`);
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post('/session-end', async (req, res) => {
    try {
        const { user_id } = req.body; 

        if (!user_id) {
            return res.status(400).json({ message: "User ID is required." });
        }

        // Fetch session-related activity types
        const sessionActiveActivity = await ActivityType.findOne({ activity_name: 'session active' });
        const sessionInactiveActivity = await ActivityType.findOne({ activity_name: 'session inactive' });
        let sessionEndActivity = await ActivityType.findOne({ activity_name: 'session end' });

        if (!sessionEndActivity) {
            sessionEndActivity = await ActivityType.create({ activity_name: 'session end' });
        }

        if (!sessionActiveActivity || !sessionInactiveActivity) {
            return res.status(400).json({ message: "Session activity types not found." });
        }

        // Remove all 'session active' and 'session inactive' records for the user
        const deleteResult = await UserActivity.deleteMany({
            user_id,
            activity_id: { $in: [sessionActiveActivity._id, sessionInactiveActivity._id] }
        });

        //console.log(`Deleted ${deleteResult.deletedCount} session active/inactive records for user ${user_id}`);

        // **Verify if all active/inactive sessions were removed**
        const remainingSessionRecords = await UserActivity.find({
            user_id,
            activity_id: { $in: [sessionActiveActivity._id, sessionInactiveActivity._id] }
        });

        if (remainingSessionRecords.length > 0) {
            //console.log(`Session active/inactive records still exist, skipping session end logging.`);
            return res.status(400).json({ message: "Failed to clear all active/inactive sessions." });
        }

        // If no active/inactive sessions exist, log 'session end'
        await UserActivity.create({
            user_id,
            activity_id: sessionEndActivity._id,
            user_created: user_id
        });

        //console.log(`Session end successfully recorded for user ${user_id}`);
        res.json({ message: 'Session marked as ended, previous session records deleted.' });

    } catch (error) {
        console.error('Error marking session end:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});




// Mark session active
router.post("/session-active", async (req, res) => {
    //console.log("active...");
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        const activityType1 = await ActivityType.findOne({ activity_name: "session inactive" });
        if (!activityType1) {
            return res.status(404).json({ message: "Activity type not found" });
        }
        // First, we delete any inactive sessions
        await UserActivity.deleteMany({ user_id, activity_id: activityType1._id });

        // Mark the session as active (by referencing activity_id)
        const activityType = await ActivityType.findOne({ activity_name: "session active" });
        if (!activityType) {
            return res.status(404).json({ message: "Activity type not found" });
        }

        await UserActivity.updateOne(
            { user_id, activity_id: activityType._id }, // Use the activity_id here
            { $set: { timestamp: new Date() } },
            { upsert: true }
        );

        res.json({ message: "Session marked active" });
        //console.log('success a');
    } catch (error) {
        console.error("Error marking session active:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Mark session inactive
router.post("/session-inactive", async (req, res) => {
    //console.log("inactive...");
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        const activityType2 = await ActivityType.findOne({ activity_name: "session inactive" });
        if (!activityType2) {
            return res.status(404).json({ message: "Activity type not found" });
        }
        // Delete active sessions if present
        await UserActivity.deleteMany({ user_id, activity_name: "session active" });

        // Mark the session as inactive (by referencing activity_id)
        const activityType = await ActivityType.findOne({ activity_name: "session inactive" });
        if (!activityType) {
            return res.status(404).json({ message: "Activity type not found" });
        }

        await UserActivity.updateOne(
            { user_id, activity_id: activityType._id }, // Use the activity_id here
            { $set: { timestamp: new Date() } },
            { upsert: true }
        );

        res.json({ message: "Session marked inactive" });
        //console.log('success ina');
    } catch (error) {
        console.error("Error marking session inactive:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



router.get('/all', async (req, res) => {
    try {
        const users = await User.find({}, "firstName lastName email role_id").lean();

        // Fetch role names for each user
        const usersWithRoles = await Promise.all(users.map(async (user) => {
            const roleDetails = await Role.findOne({ _id: user.role_id }, "role_name").lean();
            return {
                ...user,
                roleName: roleDetails ? roleDetails.role_name : "Unknown",
            };
        }));

        res.json(usersWithRoles);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});


router.post('/searchdata', async (req, res) => {
    try {
        const { email, searchQuery } = req.body;

        // Construct the search query dynamically
        let query = {};
        if (email) {
            query.email = email;
        } else if (searchQuery) {
            query.$or = [
                { firstName: new RegExp(searchQuery, "i") }, // Case-insensitive match
                { lastName: new RegExp(searchQuery, "i") }
            ];
        }

        // Find users matching the query
        const users = await User.find(query, "firstName lastName email role_id").lean();

        if (users.length === 0) return res.status(404).json({ message: "User not found" });

        // Fetch roles for all users and attach role names
        const userResponses = await Promise.all(
            users.map(async (user) => {
                const roleDetails = await Role.findOne({ _id: user.role_id }, "role_name").lean();
                return {
                    ...user,
                    roleName: roleDetails ? roleDetails.role_name : "Unknown",
                };
            })
        );

        res.json(userResponses);
    } catch (error) {
        console.error("Error searching user:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});




router.get('/activity/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;

        // Fetch user activity and populate activity_id
        const logs = await UserActivity.find({ user_id })
            .populate("activity_id", "activity_name")
            .sort({ timestamp: -1 });

        // Filter only 'session start' and 'session end' activities
        const filteredLogs = logs.filter(log => 
            log.activity_id.activity_name === "session start" || 
            log.activity_id.activity_name === "session end"
        );

        res.json(filteredLogs.map(log => ({
            _id: log._id,
            activity_name: log.activity_id.activity_name,
            timestamp: log.timestamp
        })));
    } catch (error) {
        console.error("Error fetching user logs:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

router.get("/sessions", async (req, res) => {
    try {
        // Fetch latest activity for each user, sorted by timestamp
        const sessions = await UserActivity.find()
            .populate("user_id", "firstName lastName role_id") // Include role_id for filtering
            .populate("activity_id", "activity_name") // Include activity_name for session status
            .sort({ timestamp: -1 })
            .lean();

        const adminRoleId = "678a92c33791acacbb08a687"; // Replace with actual admin role ID
        const userSessions = {};

       

        sessions.forEach(session => {
            if (!session.user_id) {
                return; 
            }
            const userId = session.user_id._id.toString();
            const userRole = session.user_id.role_id?.toString();
            const activity = session.activity_id.activity_name;

            // Skip admin users
            if (userRole === adminRoleId) return;

            // Ensure session end is not present for this user
            if (activity === "session end") return;

            // If user is already in userSessions, update their latest activity
            if (!userSessions[userId] || session.timestamp > userSessions[userId].startTimestamp) {
                const isActive = activity === "session active";
                const isInactive = activity === "session inactive";

                // Exclude sessions where both isActive and isInactive are false
                if (!isActive && !isInactive) return;

                userSessions[userId] = {
                    userId,
                    name: `${session.user_id.firstName} ${session.user_id.lastName}`,
                    startTimestamp: session.timestamp,
                    isActive,
                    isInactive,
                };
            }
        });

        res.json(Object.values(userSessions)); // Return filtered sessions
    } catch (error) {
        console.error("Error fetching sessions:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});





router.get("/session-timestamp/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        //console.log(`Fetching latest session start timestamp for user: ${userId}`);

        // Fetch all activities for this user, sorted from latest to oldest
        const userActivities = await UserActivity.find({ user_id: userId })
            .populate("activity_id", "activity_name")
            .sort({ timestamp: -1 }) // Get most recent activities first
            .lean();

        //console.log(`All activities for ${userId}:`, userActivities);

        // Find the most recent "session start" in the list
        const latestSessionStart = userActivities.find(activity => 
            activity.activity_id.activity_name === "session start"
        );

        if (!latestSessionStart) {
            console.warn(`No valid "session start" found for user: ${userId}`);
            return res.json({ sessionStartTimestamp: null });
        }

        //console.log(`Latest "session start" timestamp for user ${userId}:`, latestSessionStart.timestamp);
        res.json({ sessionStartTimestamp: latestSessionStart.timestamp });

    } catch (error) {
        console.error("Error fetching session start timestamp:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


router.post("/terminate", (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    terminatedSession.add(userId); // Mark session as terminated

    return res.json({ success: true, message: "Session marked for termination" });
});

router.get("/terminate/:userId", (req, res) => {
    const { userId } = req.params;

    if (terminatedSession.has(userId)) {
        terminatedSession.delete(userId);
        return res.json({ terminate: true });
        
    } else {
        return res.json({ terminate: false });
    }
});

router.get("/remove-sessions/:userId", async (req, res) => {
    const { userId } = req.params;
    

    // Fetch session-related activity types
    const sessionActiveActivity = await ActivityType.findOne({ activity_name: 'session active' });
    const sessionInactiveActivity = await ActivityType.findOne({ activity_name: 'session inactive' });
    // Remove all 'session active' and 'session inactive' records for the user
    const deleteResult = await UserActivity.deleteMany({
        user_id: userId,
        activity_id: { $in: [sessionActiveActivity._id, sessionInactiveActivity._id] }
    });

        res.json({ message: "Sessions cleared successfully!", deletedCount: deleteResult.deletedCount });
});

module.exports = router;