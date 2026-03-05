const { register, login, getMe } = require('../src/controllers/auth.controller');
const { mockPrisma } = require('./setup');
const httpMocks = require('node-mocks-http');

// Mock service layer if needed, or stick to controller testing
// For this example, we'll mock the service specifically to isolate controller logic
const authService = require("../src/services/auth.service");
jest.mock("../src/services/auth.service");

describe('Auth Controller', () => {
    let req, res;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            req.body = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                phone: '1234567890'
            };

            authService.register.mockResolvedValue({
                user: { id: 1, email: 'test@example.com' },
                token: 'mock-token'
            });

            await register(req, res);

            expect(res.statusCode).toBe(201);
            expect(res._getJSONData()).toEqual({
                user: { id: 1, email: 'test@example.com' },
                token: 'mock-token'
            });
        });

        it('should return 400 if required fields are missing', async () => {
            req.body = { name: 'Test User' }; // Missing email/password

            await register(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toHaveProperty('error');
        });
    });

    describe('login', () => {
        it('should login successfully', async () => {
            req.body = { email: 'test@example.com', password: 'password123' };

            authService.login.mockResolvedValue({
                user: { id: 1, email: 'test@example.com' },
                token: 'mock-token'
            });

            await login(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                user: { id: 1, email: 'test@example.com' },
                token: 'mock-token'
            });
        });

        it('should return 401 for invalid credentials', async () => {
            req.body = { email: 'test@example.com', password: 'wrongpassword' };
            authService.login.mockRejectedValue(new Error('Invalid email or password'));

            await login(req, res);

            expect(res.statusCode).toBe(401);
        });
    });
});
