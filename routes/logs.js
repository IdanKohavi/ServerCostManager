/**
 * @fileoverview Logs API routes
 * @requires express
 * @requires ../models/logs
 */

//Import required dependencies
const express = require('express');
const router = express.Router();
const Log = require('../models/logs');

/**
 * Get all logs
 * @route GET /api/logs
 * @returns {Array<Object>} 200 - Array of all logs
 * @returns {Object} 500 - Server error
 */
router.get('/', async (req, res) => {
    try{
        // Find the logs, sort by newest first
        const logs = await Log.find({}).sort({ timestamp: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

module.exports = router;