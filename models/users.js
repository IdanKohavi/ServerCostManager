/**
 * @fileoverview Mongoose schema for users
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} User
 * @property {number} id - Unique identifier for the user
 * @property {string} first_name - User's first name
 * @property {string} last_name - User's last name
 * @property {Date} birthday - User's date of birth
 * @property {('single'|'married'|'divorced'|'widowed')} marital_status - User's marital status
 */

/**
 * Mongoose schema for users
 * @type {mongoose.Schema}
 */
const userSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    birthday: {
        type: Date,
        required: true
    },
    marital_status: {
        type: String,
        enum: ['single', 'married', 'divorced', 'widowed'],
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);
