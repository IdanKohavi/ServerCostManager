/**
 * @fileoverview Mongoose schema for cost items
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} Cost
 * @property {string} description - Description of the cost item
 * @property {('food'|'health'|'housing'|'sports'|'education')} category - Category of the cost
 * @property {number} userid - ID of the user who made the cost
 * @property {double} sum - Amount of the cost
 * @property {Date} date - Date when the cost was made
 */

/**
 * Mongoose schema for cost items
 * @type {mongoose.Schema}
 */
const costSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['food', 'health', 'housing', 'sports', 'education'],
        required: true
    },
    userid: {
        type: Number,
        required: true
    },
    sum: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Cost', costSchema);
