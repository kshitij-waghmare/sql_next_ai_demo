const express = require('express');
const router = express.Router();
const ActivityType = require('../models/activityType');

router.post('/activity-type', async (req, res) => {
    try {
        const { activity_name } = req.body;

        if (!activity_name) {
            return res.status(400).json({ message: "Activity name is required." });
        }

        const existingActivity = await ActivityType.findOne({ activity_name });
        if (existingActivity) {
            return res.status(400).json({ message: "Activity already exists." });
        }

        const newActivity = new ActivityType({ activity_name });
        await newActivity.save();

        res.status(201).json({ message: "Activity added successfully", data: newActivity });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
