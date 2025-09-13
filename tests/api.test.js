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
            // Use a unique ID based on timestamp to avoid conflicts
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
    });

    describe('POST /api/add (Cost)', () => {
        it('should add a new cost item', async () => {
            const costData = {
                description: 'Test item',
                category: 'food',
                userid: 123123,  // Use the default user ID
                sum: 10.50
            };

            const res = await request(app)
                .post('/api/add')
                .send(costData)
                .expect(201);

            expect(res.body.description).toBe('Test item');
            expect(res.body.category).toBe('food');
            expect(res.body.userid).toBe(123123);
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