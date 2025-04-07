const express = require('express');
const Log = require('../models/logModel'); // Adjust path as needed
const router = express.Router();

let cachedRankings = [];
let lastUpdated = null;

const teamMembersEmail = [
  'kshit1503150@mastek.com',
  'Abhilasha@mastek.com',
  'karan1503750@mastek.com',
  'dwarke163107@mastek.com',
  'sarth163142@mastek.com',
  'bhaskar14914@mastek.com',
];

// Background job logic
const updateTopUsers = async () => {
  try {
    console.log("Updating top users...");
    const logs = await Log.find({});

    const userCounts = logs.reduce((acc, log) => {
      const upn = log.userPrincipalName;
      if (!upn) return acc;
      acc[upn] = (acc[upn] || 0) + 1;
      return acc;
    }, {});

    teamMembersEmail.forEach(email => delete userCounts[email]);

    cachedRankings = Object.entries(userCounts)
      .map(([userPrincipalName, interactions]) => {
        const user = logs.find(log => log.userPrincipalName === userPrincipalName);
        return {
          userPrincipalName,
          displayName: user?.displayName || "Unknown",
          officeLocation: user?.officeLocation || "Unknown",
          interactions
        };
      })
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 2);

    lastUpdated = new Date();
    console.log("Top users updated at:", lastUpdated);
  } catch (error) {
    console.error("Error updating top users:", error);
  }
};

// Start background job (initial + interval)
updateTopUsers(); // Run once at startup
setInterval(updateTopUsers, 23 * 60 * 60 * 1000); // Then every 23 hours

// Endpoint
router.get('/', (req, res) => {
  res.json({ lastUpdated, users: cachedRankings });
});

module.exports = router;
