/**
 * @fileoverview Cost addition API routes
 * @requires express
 * @requires ../models/costs
 * @requires ../models/users
 */

// Import required dependencies
const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const Cost = require('../models/costs');
const User = require('../models/users');


/**
 * Add a new cost item or user
 * @route POST /api/add
 * @param {Object} request.body.required - Cost item or user details
 * @returns {Object} 201 - Created cost item
 * @returns {Object} 400 - Invalid input
 * @returns {Object} 500 - Server error
 */
router.post('/', async (req, res) => {
    try {
        const body = req.body;

        //Users
        if (body.first_name && body.last_name && body.id && body.birthday) {
            const {id, first_name, last_name, birthday, marital_status} = body;
            const existingUser = await User.findOne({id: id});
            if (existingUser) {
                return res.status(400).json({error: "User with this ID already exists"});
            }

            //Creating new user
            const newUser = new User({
                id,
                first_name,
                last_name,
                birthday: new Date(birthday),
                marital_status: marital_status || "single"
            });

            await newUser.save();
            res.status(201).json(newUser);

        } else if (body.description && body.category && body.userid && body.sum){
            //Costs
            const { description, category, userid, sum, date} = body;
            const user = await User.findOne({id: userid});
            if (!user) {
                return res.status(400).json({error: "User not found"})
            }

            // Convert Sum to decimal
            const sumDecimal = mongoose.Types.Decimal128.fromString(sum.toString());

            //Create new cost
            const newCost = new Cost({
                description,
                category,
                userid,
                sum: sumDecimal,
                date: date || Date.now()
            });

            await newCost.save();

            const response = {
                _id: newCost._id,
                description: newCost.description,
                category: newCost.category,
                userid: newCost.userid,
                sum: parseFloat(newCost.sum.toString()), //Converting double to number
                date: newCost.date
            }

            res.status(201).json(newCost);
        } else {
            return res.status(400).json({
                error: "Invalid request, Provide user data(id, first_name, last_name, birthday) or cost data(description, category, userid, sum)"
            });
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

module.exports = router;
