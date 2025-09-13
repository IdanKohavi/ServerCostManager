/**
 * @fileoverview Debug test to check database state
 */

const mongoose = require('mongoose');
const User = require('../models/users');

describe('Debug Database State', () => {
    beforeAll(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
    });

    it('should show database state', async () => {
        console.log('=== DEBUG INFO ===');
        console.log('MongoDB connection state:', mongoose.connection.readyState);
        console.log('Database name:', mongoose.connection.name);

        const allUsers = await User.find({});
        console.log('Total users in database:', allUsers.length);
        console.log('All users:', allUsers.map(u => ({ id: u.id, name: u.first_name + ' ' + u.last_name })));

        const defaultUser = await User.findOne({ id: 123123 });
        console.log('Default user (123123) exists:', !!defaultUser);
        if (defaultUser) {
            console.log('Default user details:', { id: defaultUser.id, name: defaultUser.first_name + ' ' + defaultUser.last_name });
        }
        console.log('==================');

        expect(true).toBe(true); // Always pass
    });
});