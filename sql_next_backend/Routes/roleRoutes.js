const express = require('express');
const Role = require('../models/Role');
const router = express.Router();

// Get all roles
router.get('/get-role', async (req, res) => {
    try {
        const roles = await Role.find({ role_name: { $ne: 'ADMIN' } }, '_id role_name');
        res.status(200).json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ message: 'Error fetching roles.' });
    }
});

// Create a new role
//router.post('/', async (req, res) => {
    //try {
      //const { role_name, description } = req.body;
      //const role = new Role({ role_name, description });
      //await role.save();
      //res.status(201).json({ message: 'Role created successfully', role });
    //} catch (error) {
      //res.status(500).json({ error: error.message });
   //}
  //});


module.exports = router;
