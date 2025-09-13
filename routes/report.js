/**
 * @fileoverview Cost report API routes
 * @requires express
 * @requires ../models/costs
 */

// Import required dependencies
const express = require('express');
const router = express.Router();
const Cost = require('../models/costs');

/**
 * Get cost report for a user in a specific month
 * @route GET /api/report
 * @param {string} id.query.required - User ID
 * @param {number} year.query.required - Year of the report
 * @param {number} month.query.required - Month of the report (1-12)
 * @returns {Object} 200 - Report data with costs grouped by category
 * @returns {Object} 400 - Missing or invalid parameters
 * @returns {Object} 500 - Server error
 */
router.get('/', async (req, res) => {
    try {
        // Extract and validate query parameters
        const { id, year, month } = req.query;

        // Ensure all required parameters are present
        if (!id || !year || !month) {
            return res.status(400).json({ error: 'Missing required query parameters: id, year, month' });
        }

        // Create date range for the specified month
        // Note: JavaScript months are 0-indexed, so we subtract 1 from the month
        const startDate = new Date(year, month - 1, 1);  // First day of the month
        const endDate = new Date(year, month, 1);        // First day of next month

        // Query the database for costs within the date range
        const costs = await Cost.find({
            userid: parseInt(id),
            date: { $gte: startDate, $lt: endDate }
        });

        // Define the list of supported cost categories
        const categories = ['food', 'health', 'housing', 'sports', 'education'];

        // Group costs by category and format the data
        const grouped = categories.map(cat => {
            return {
                [cat]: costs
                    .filter(c => c.category === cat)  // Filter costs for this category
                    .map(c => ({                      // Format each cost item
                        sum: parseFloat(c.sum.toString()), // Convert Double to number
                        description: c.description,
                        day: new Date(c.date).getDate()  // Extract day of month
                    }))
            };
        });

        // Return the formatted report
        res.json({
            userid: parseInt(id),
            year: parseInt(year),
            month: parseInt(month),
            costs: grouped
        });

    } catch (err) {
        // Handle any unexpected errors
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
