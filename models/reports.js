/**
 * @fileoverview Mongoose schema for cached reports
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} Report
 * @property {number} userid - user ID
 * @property {number} year - Year of the report
 * @property {number} month - Month of the report
 * @property {Array} costs - Array of costs by category
 */

/**
 * Mongoose schema for cached report
 * @type {mongoose.Schema}
 */
const reportSchema = new mongoose.Schema({
    userid: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    costs: {
        type: Array,
        required: true
    }
} , {
    timestamps: true
});

reportSchema.index({userid: 1, year: 1, month: 1}, {unique: true});
module.exports = mongoose.model('Report', reportSchema);