/**
 * @fileoverview Cost report API routes
 * @requires express
 * @requires ../models/costs
 * @requires ../models/reports
 */

// Import required dependencies
const express = require('express');
const router = express.Router();
const Cost = require('../models/costs');
const Report = require('../models/reports');

/**
 * Get cost report for a user in a specific month
 * Caches report for past months
 * @route GET /api/report
 * @param {number} id.query.required - User ID
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

        const userId = parseInt(id);
        const reportYear = parseInt(year);
        const reportMonth = parseInt(month);

        /**
         * Check if report already exists in cache for past months
         * If exists, return cached version; otherwise generate and cache new report
         */

        const currentDate = new Date();
        const reportDate = new Date(reportYear, reportMonth - 1, 1);

        if (reportDate < currentDate){
            const existingReport = await Report.findOne({
                userid: userId,
                year: reportYear,
                month: reportMonth,
            });

            if (existingReport) {
                return res.json({
                    userid: existingReport.userid,
                    year: existingReport.year,
                    month: existingReport.month,
                    costs: existingReport.costs
                });
            }
        }

        //Generate a new report:
        const startDate = new Date(reportYear, reportMonth - 1, 1);  // First day of the month
        const endDate = new Date(reportYear, reportMonth, 1);        // First day of next month

        // Query the database for costs within the date range
        const costs = await Cost.find({
            userid: userId,
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

        const report = {
            userid: userId,
            year: reportYear,
            month: reportMonth,
            costs: grouped
        }

        //Cache the new report
        if (reportDate < currentDate){
            try {
                const savedReport = new Report(report);
                await savedReport.save();
                console.log(`Report cached successfully for user ${userId}, ${reportYear}-${reportMonth}`);
            } catch (saveError) {
                console.log("Report caching failed: ", saveError.message);
                console.log("Report data: ", report); // Add this to see what data is being saved
            }
        }

        res.json(report);

    } catch (err) {
        // Handle any unexpected errors
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
