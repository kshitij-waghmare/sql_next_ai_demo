const express = require('express');
const router = express.Router();
const Log = require('../models/logModel'); // Adjust path if needed

// Route to log user action
router.post('/', async (req, res) => {
  const { userId, action, details, userInfo } = req.body;

  if (!userId || !action || !details || !userInfo) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const log = new Log({
      userId,
      displayName: userInfo.displayName,
      action,
      givenName: userInfo.givenName,
      surname: userInfo.surname,
      details,
      jobTitle: userInfo.jobTitle,
      mail: userInfo.mail,
      officeLocation: userInfo.officeLocation,
      preferredLanguage: userInfo.preferredLanguage,
      businessPhones: userInfo.businessPhones || [],
      mobilePhone: userInfo.mobilePhone,
      userPrincipalName: userInfo.userPrincipalName,
    });

    await log.save();
    res.status(200).json({ message: 'User action logged successfully' });
  } catch (error) {
    console.error('Error logging user action:', error);
    res.status(500).json({ message: 'Error logging user action' });
  }
});

module.exports = router;
