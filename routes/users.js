/**
 * @fileoverview User-related API routes
 * @requires express
 * @requires ../models/users
 * @requires ../models/costs
 */

// Import required dependencies
const express = require('express');
const router = express.Router();
const User = require('../models/users');
const Cost = require('../models/costs');

/**
 * Get all users
 * @route GET /api/users
 * @returns {Array<Object>} 200 - array of all users
 * @returns {object} 500 - Server error
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.find({});

    res.json(users);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

/**
 * Get user details by ID
 * @route GET /api/users/:id
 * @param {string} id.path.required - User ID
 * @returns {Object} 200 - User details with total costs
 * @returns {Object} 404 - User not found
 * @returns {Object} 500 - Server error
 */
router.get('/:id', async (req, res) => {
  try {
    // Convert string ID to number
    const userId = parseInt(req.params.id);

    // Find user document by ID
    const user = await User.findOne({ id: userId });

    // If user not found, return 404 error
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find all cost items for the given user ID
    const userCosts = await Cost.find({ userid: userId });

    // Calculate the total sum of costs for the user
    const total = userCosts.reduce((acc, item) => acc + parseFloat(item.sum.toString()), 0);

    // Return the required fields in the JSON response
    res.json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      total
    });

  } catch (err) {
    // Handle unexpected errors with a 500 status
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
