/**
 * @fileoverview Test setup and cleanup
 */

const mongoose = require('mongoose');
const User = require('../models/users');
const Cost = require('../models/costs');

// Setup before all tests
beforeAll(async () => {
    // Load environment variables
    require('dotenv').config();

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
        console.log('Connecting to MongoDB for tests...');
        await mongoose.connect(process.env.MONGO);
        console.log('Connected to MongoDB for tests');
    }

    // Wait a bit for connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Setting up test database...');

    // Ensure the default user exists
    let defaultUser = await User.findOne({ id: 123123 });
    if (!defaultUser) {
        console.log('Creating default user...');
        defaultUser = await User.create({
            id: 123123,
            first_name: 'mosh',
            last_name: 'israeli',
            birthday: new Date('1990-01-01'),
            marital_status: 'single'
        });
        console.log('Default user created with ID:', defaultUser.id);
    } else {
        console.log('Default user already exists with ID:', defaultUser.id);
    }

    // Verify the user exists
    const verifyUser = await User.findOne({ id: 123123 });
    console.log('Verification - User exists:', !!verifyUser);
});

// Clean up test data after each test
afterEach(async () => {
    // Remove test users (keep the default user with ID 123123)
    await User.deleteMany({ id: { $gte: 100000 } });

    // Remove test costs (keep costs for user 123123)
    await Cost.deleteMany({ userid: { $gte: 100000 } });
});

// Clean up after all tests
afterAll(async () => {
    // Close the connection to prevent Jest from hanging
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
});