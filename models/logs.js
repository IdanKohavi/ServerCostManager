/**
 * @fileoverview Mongoose schema for logs
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * @typedef {object} Log
 * @property {string} level - Log level (info, error, warning, debug)
 * @property {string} message - Log message
 * @property {string} method - HTTP method
 * @property {string} url - Request URL
 * @property {number} statusCode - HTTP status code
 * @property {Date} timestamp - When the log was created
 * @property {object} [req] - Request details
 * @property {object} [res] - Response details
 */

/**
 * Mongoose schema for logs
 * @type {mongoose.Schema}
 */
const logSchema = new mongoose.Schema({
    level: {
        type: String,
        required: true,
        enum: ["info", "error", "warning", "debug"]
    },
    message: {
        type: String,
        required: true
    },
    method: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    statusCode: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    req: {
        type: Object,
        required: false,
    },
    res: {
        type: Object,
        required: false
    }
});

module.exports = mongoose.model("Log", logSchema)