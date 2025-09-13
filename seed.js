/**
 * @fileoverview Database seeder to create default user
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/users');

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO);
        console.log('Connected to MongoDB');

        // Check if default user exists
        const existingUser = await User.findOne({ id: 123123 });

        if (!existingUser) {
            // Create default user
            const defaultUser = new User({
                id: 123123,
                first_name: 'mosh',
                last_name: 'israeli',
                birthday: new Date('1990-01-01'),
                marital_status: 'single'
            });

            await defaultUser.save();
            console.log('Default user created successfully');
        } else {
            console.log('Default user already exists');
        }

        // Close connection
        await mongoose.connection.close();
        console.log('Database seeding completed');
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();