/**
 * @fileoverview About API routes
 * @requires express
 */

// Import required dependencies
const express = require('express');
const router = express.Router();

/**
 * Get team members information
 * @route GET /api/about
 * @returns {Array<Object>} 200 - Array of team members
 * @returns {Object} teamMember.first_name - Team member's first name
 * @returns {Object} teamMember.last_name - Team member's last name
 */
router.get('/', (req, res) => {
    // Return hardcoded team member information
    res.json([
        { first_name: "Eldar", last_name: "Azan" },
        { first_name: "Idan", last_name: "Kohavi" }
    ]);
});

module.exports = router;
