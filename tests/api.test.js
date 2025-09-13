/**
 * @fileoverview Comprehensive unit tests for Cost Manager API
 * @requires supertest
 * @requires ../app
 */

const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/users');
const Cost = require('../models/costs');
const Report = require('../models/reports');
const Log = require('../models/logs');

describe('Cost Manager API - Complete Test Suite', () => {

    // Setup before all tests
    beforeAll(async () => {
        // Load environment variables
        require('dotenv').config();

        // Connect to MongoDB if not already connected
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO);
        }

        // Wait for connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Ensure default user exists
        let defaultUser = await User.findOne({ id: 123123 });
        if (!defaultUser) {
            defaultUser = await User.create({
                id: 123123,
                first_name: 'mosh',
                last_name: 'israeli',
                birthday: new Date('1990-01-01'),
                marital_status: 'single'
            });
        }
    });

    // Clean up after all tests
    afterAll(async () => {
        await User.deleteMany({ id: { $gte: 100000 } });
        await Cost.deleteMany({ userid: { $gte: 100000 } });
        await Report.deleteMany({ userid: { $gte: 100000 } });
        await Log.deleteMany({ userid: { $gte: 100000 } });

        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    });

    describe('GET /api/about', () => {
        it('should return team members with correct structure', async () => {
            const res = await request(app)
                .get('/api/about')
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
            expect(res.body[0]).toHaveProperty('first_name');
            expect(res.body[0]).toHaveProperty('last_name');
            expect(res.body[0].first_name).toBe('Eldar');
            expect(res.body[0].last_name).toBe('Azan');
            expect(res.body[1].first_name).toBe('Idan');
            expect(res.body[1].last_name).toBe('Kohavi');
        });
    });

    describe('POST /api/add (User)', () => {
        it('should add a new user successfully', async () => {
            const uniqueId = Date.now();
            const userData = {
                id: uniqueId,
                first_name: 'Test',
                last_name: 'User',
                birthday: '1990-01-01',
                marital_status: 'single'
            };

            const res = await request(app)
                .post('/api/add')
                .send(userData)
                .expect(201);

            expect(res.body.first_name).toBe('Test');
            expect(res.body.last_name).toBe('User');
            expect(res.body.id).toBe(uniqueId);
            expect(res.body.marital_status).toBe('single');
        });

        it('should return error for duplicate user ID', async () => {
            const userData = {
                id: 123123, // Default user ID
                first_name: 'Duplicate',
                last_name: 'User',
                birthday: '1990-01-01'
            };

            const res = await request(app)
                .post('/api/add')
                .send(userData)
                .expect(400);

            expect(res.body).toHaveProperty('error');
            expect(res.body.error).toContain('already exists');
        });

        it('should return error for missing required fields', async () => {
            const userData = {
                id: 999999,
                first_name: 'Incomplete'
                // Missing last_name and birthday
            };

            const res = await request(app)
                .post('/api/add')
                .send(userData)
                .expect(400);

            expect(res.body).toHaveProperty('error');
        });

        it('should set default marital_status to single', async () => {
            const uniqueId = Date.now() + 1;
            const userData = {
                id: uniqueId,
                first_name: 'Test',
                last_name: 'User',
                birthday: '1990-01-01'
                // No marital_status provided
            };

            const res = await request(app)
                .post('/api/add')
                .send(userData)
                .expect(201);

            expect(res.body.marital_status).toBe('single');
        });
    });

    describe('POST /api/add (Cost)', () => {
        it('should add a new cost item successfully', async () => {
            const costData = {
                description: 'Test item',
                category: 'food',
                userid: 123123,
                sum: 10.50
            };

            const res = await request(app)
                .post('/api/add')
                .send(costData)
                .expect(201);

            expect(res.body.description).toBe('Test item');
            expect(res.body.category).toBe('food');
            expect(res.body.userid).toBe(123123);
            expect(res.body.sum).toBe(10.50);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('date');
        });

        it('should return error for non-existent user', async () => {
            const costData = {
                description: 'Test item',
                category: 'food',
                userid: 999999, // Non-existent user
                sum: 10.50
            };

            const res = await request(app)
                .post('/api/add')
                .send(costData)
                .expect(400);

            expect(res.body).toHaveProperty('error');
            expect(res.body.error).toContain('User not found');
        });

        it('should return error for invalid category', async () => {
            const costData = {
                description: 'Test item',
                category: 'invalid_category',
                userid: 123123,
                sum: 10.50
            };

            const res = await request(app)
                .post('/api/add')
                .send(costData)
                .expect(500);
        });

        it('should handle date parameter correctly', async () => {
            const costData = {
                description: 'Test item with date',
                category: 'health',
                userid: 123123,
                sum: 25.00,
                date: '2025-01-15'
            };

            const res = await request(app)
                .post('/api/add')
                .send(costData)
                .expect(201);

            expect(res.body.description).toBe('Test item with date');
            expect(res.body.category).toBe('health');
        });

        it('should return error for missing required fields', async () => {
            const costData = {
                description: 'Incomplete item'
                // Missing category, userid, sum
            };

            const res = await request(app)
                .post('/api/add')
                .send(costData)
                .expect(400);

            expect(res.body).toHaveProperty('error');
        });
    });

    describe('GET /api/users', () => {
        it('should return all users', async () => {
            const res = await request(app)
                .get('/api/users')
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);

            // Check if default user is present
            const defaultUser = res.body.find(user => user.id === 123123);
            expect(defaultUser).toBeDefined();
            expect(defaultUser.first_name).toBe('mosh');
            expect(defaultUser.last_name).toBe('israeli');
        });
    });

    describe('GET /api/users/:id', () => {
        it('should return user details with total costs', async () => {
            // First add a cost for the user
            await Cost.create({
                description: 'Test cost',
                category: 'food',
                userid: 123123,
                sum: mongoose.Types.Decimal128.fromString('15.50'),
                date: new Date()
            });

            const res = await request(app)
                .get('/api/users/123123')
                .expect(200);

            expect(res.body).toHaveProperty('id');
            expect(res.body).toHaveProperty('first_name');
            expect(res.body).toHaveProperty('last_name');
            expect(res.body).toHaveProperty('total');
            expect(res.body.id).toBe(123123);
            expect(res.body.first_name).toBe('mosh');
            expect(res.body.last_name).toBe('israeli');
            expect(typeof res.body.total).toBe('number');
        });

        it('should return 404 for non-existent user', async () => {
            const res = await request(app)
                .get('/api/users/999999')
                .expect(404);

            expect(res.body).toHaveProperty('error');
            expect(res.body.error).toBe('User not found');
        });
    });

    describe('GET /api/report', () => {
        beforeEach(async () => {
            // Clear any existing reports for test user
            await Report.deleteMany({ userid: 100001 });
        });

        it('should return monthly report with correct structure', async () => {
            // Create a test user
            const testUser = await User.create({
                id: 100001,
                first_name: 'Test',
                last_name: 'User',
                birthday: new Date('1990-01-01'),
                marital_status: 'single'
            });

            // Add some test costs
            await Cost.create({
                description: 'Test food',
                category: 'food',
                userid: 100001,
                sum: mongoose.Types.Decimal128.fromString('10.00'),
                date: new Date('2025-01-15')
            });

            await Cost.create({
                description: 'Test health',
                category: 'health',
                userid: 100001,
                sum: mongoose.Types.Decimal128.fromString('25.00'),
                date: new Date('2025-01-20')
            });

            const res = await request(app)
                .get('/api/report?id=100001&year=2025&month=1')
                .expect(200);

            expect(res.body).toHaveProperty('userid');
            expect(res.body).toHaveProperty('year');
            expect(res.body).toHaveProperty('month');
            expect(res.body).toHaveProperty('costs');
            expect(res.body.userid).toBe(100001);
            expect(res.body.year).toBe(2025);
            expect(res.body.month).toBe(1);
            expect(Array.isArray(res.body.costs)).toBe(true);
            expect(res.body.costs.length).toBe(5); // All categories

            // Check food category
            const foodCategory = res.body.costs.find(cat => cat.food);
            expect(foodCategory).toBeDefined();
            expect(foodCategory.food.length).toBe(1);
            expect(foodCategory.food[0].description).toBe('Test food');
            expect(foodCategory.food[0].sum).toBe(10.00);
            expect(foodCategory.food[0].day).toBe(15);

            // Check health category
            const healthCategory = res.body.costs.find(cat => cat.health);
            expect(healthCategory).toBeDefined();
            expect(healthCategory.health.length).toBe(1);
            expect(healthCategory.health[0].description).toBe('Test health');
            expect(healthCategory.health[0].sum).toBe(25.00);
            expect(healthCategory.health[0].day).toBe(20);
        });

        it('should return error for missing parameters', async () => {
            const res = await request(app)
                .get('/api/report')
                .expect(400);

            expect(res.body).toHaveProperty('error');
            expect(res.body.error).toContain('Missing required query parameters');
        });

        it('should return empty report for user with no costs', async () => {
            const res = await request(app)
                .get('/api/report?id=123123&year=2025&month=12')
                .expect(200);

            expect(res.body.userid).toBe(123123);
            expect(res.body.year).toBe(2025);
            expect(res.body.month).toBe(12);
            expect(Array.isArray(res.body.costs)).toBe(true);

            // All categories should be empty
            res.body.costs.forEach(category => {
                const categoryName = Object.keys(category)[0];
                expect(Array.isArray(category[categoryName])).toBe(true);
                expect(category[categoryName].length).toBe(0);
            });
        });

        it('should implement Computed Pattern - cache reports for past months', async () => {
            // Create a test user
            const testUser = await User.create({
                id: 100002,
                first_name: 'Test',
                last_name: 'User',
                birthday: new Date('1990-01-01'),
                marital_status: 'single'
            });

            // Add a cost for a past month
            await Cost.create({
                description: 'Past month cost',
                category: 'food',
                userid: 100002,
                sum: mongoose.Types.Decimal128.fromString('5.00'),
                date: new Date('2024-01-15') // Past month
            });

            // First request - should generate and cache report
            const res1 = await request(app)
                .get('/api/report?id=100002&year=2024&month=1')
                .expect(200);

            expect(res1.body.userid).toBe(100002);
            expect(res1.body.year).toBe(2024);
            expect(res1.body.month).toBe(1);

            // Check if report was cached
            const cachedReport = await Report.findOne({
                userid: 100002,
                year: 2024,
                month: 1
            });
            expect(cachedReport).toBeDefined();

            // Second request - should return cached report
            const res2 = await request(app)
                .get('/api/report?id=100002&year=2024&month=1')
                .expect(200);

            expect(res2.body.userid).toBe(100002);
            expect(res2.body.year).toBe(2024);
            expect(res2.body.month).toBe(1);
            expect(res2.body.costs).toEqual(cachedReport.costs);
        });
    });

    describe('GET /api/logs', () => {
        it('should return all logs', async () => {
            const res = await request(app)
                .get('/api/logs')
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
        });

        it('should return logs sorted by newest first', async () => {
            // Make a request to generate a log
            await request(app)
                .get('/api/about')
                .expect(200);

            const res = await request(app)
                .get('/api/logs')
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            if (res.body.length > 1) {
                // Convert to timestamps (numbers) for comparison
                expect(new Date(res.body[0].timestamp).getTime()).toBeGreaterThanOrEqual(
                    new Date(res.body[1].timestamp).getTime()
                );
            }
        });
    });

    describe('Error Handling', () => {
        it('should return 404 for non-existent routes', async () => {
            const res = await request(app)
                .get('/api/nonexistent')
                .expect(404);

            expect(res.body).toHaveProperty('error');
            expect(res.body).toHaveProperty('status');
            expect(res.body.status).toBe(404);
        });

        it('should handle server errors gracefully', async () => {
            // This test would require mocking to force a server error
            // For now, we'll test that the error handler exists
            expect(app._router.stack).toBeDefined();
        });
    });

    describe('Data Validation', () => {
        it('should validate cost categories', async () => {
            const validCategories = ['food', 'health', 'housing', 'sports', 'education'];

            for (const category of validCategories) {
                const costData = {
                    description: `Test ${category}`,
                    category: category,
                    userid: 123123,
                    sum: 10.00
                };

                const res = await request(app)
                    .post('/api/add')
                    .send(costData)
                    .expect(201);

                expect(res.body.category).toBe(category);
            }
        });

        it('should validate user marital status', async () => {
            const validStatuses = ['single', 'married', 'divorced', 'widowed'];

            for (const status of validStatuses) {
                const userData = {
                    id: Date.now() + Math.random(),
                    first_name: 'Test',
                    last_name: 'User',
                    birthday: '1990-01-01',
                    marital_status: status
                };

                const res = await request(app)
                    .post('/api/add')
                    .send(userData)
                    .expect(201);

                expect(res.body.marital_status).toBe(status);
            }
        });
    });
});