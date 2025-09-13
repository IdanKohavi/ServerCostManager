/**
 * @fileoverview Unit tests for Cost Manager API
 * @requires supertest
 * @requires ../app
 */

const request = require('supertest');
const app = require('../app');

describe('Cost Manager API', () => {

    describe('GET /api/about', () => {
        it('should return team members', async () => {
            const res = await request(app)
                .get('/api/about')
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0]).toHaveProperty('first_name');
            expect(res.body[0]).toHaveProperty('last_name');
        });
    });

    describe('POST /api/add (User)', () => {
        it('should add a new user', async () => {
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
    });

    describe('POST /api/add (Cost)', () => {
        it('should add a new cost item', async () => {
            const costData = {
                description: 'Test item',
                category: 'food',
                userid: 123123, // Use default user ID
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
                .expect(500); // Mongoose validation error
        });
    });

    describe('GET /api/users', () => {
        it('should return all users', async () => {
            const res = await request(app)
                .get('/api/users')
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/users/:id', () => {
        it('should return user details with total costs', async () => {
            const res = await request(app)
                .get('/api/users/123123')
                .expect(200);

            expect(res.body).toHaveProperty('id');
            expect(res.body).toHaveProperty('first_name');
            expect(res.body).toHaveProperty('last_name');
            expect(res.body).toHaveProperty('total');
            expect(res.body.id).toBe(123123);
        });

        it('should return 404 for non-existent user', async () => {
            const res = await request(app)
                .get('/api/users/999999')
                .expect(404);

            expect(res.body).toHaveProperty('error');
        });
    });

    describe('GET /api/report', () => {
        it('should return monthly report', async () => {
            const res = await request(app)
                .get('/api/report?id=123123&year=2025&month=9')
                .expect(200);

            expect(res.body).toHaveProperty('userid');
            expect(res.body).toHaveProperty('year');
            expect(res.body).toHaveProperty('month');
            expect(res.body).toHaveProperty('costs');
            expect(Array.isArray(res.body.costs)).toBe(true);
            expect(res.body.userid).toBe(123123);
        });

        it('should return error for missing parameters', async () => {
            const res = await request(app)
                .get('/api/report')
                .expect(400);

            expect(res.body).toHaveProperty('error');
        });
    });

    describe('GET /api/logs', () => {
        it('should return all logs', async () => {
            const res = await request(app)
                .get('/api/logs')
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
        });
    });
});