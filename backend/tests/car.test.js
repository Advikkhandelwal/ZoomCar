const { getCars, createCar } = require('../src/controllers/car.controller');
const httpMocks = require('node-mocks-http');
const carService = require("../src/services/car.service");

jest.mock("../src/services/car.service");

describe('Car Controller', () => {
    let req, res;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        jest.clearAllMocks();
    });

    describe('getCars', () => {
        it('should return all cars', async () => {
            const mockCars = [{ id: 1, brand: 'Tesla', model: 'Model S' }];
            carService.getAllCars.mockResolvedValue(mockCars);

            await getCars(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual(mockCars);
        });

        it('should handle errors', async () => {
            carService.getAllCars.mockRejectedValue(new Error('Database error'));

            await getCars(req, res);

            expect(res.statusCode).toBe(500);
            expect(res._getJSONData()).toHaveProperty('error');
        });
    });

    describe('createCar', () => {
        it('should create a new car successfully', async () => {
            req.body = {
                brand: 'Tesla',
                model: 'Model 3',
                fuelType: 'Electric',
                pricePerDay: 100,
                location: 'NYC'
            };
            req.user = { id: 1 }; // Mock authenticated user

            const mockCar = { id: 1, ...req.body, ownerId: 1 };
            carService.createCar.mockResolvedValue(mockCar);

            await createCar(req, res);

            expect(res.statusCode).toBe(201);
            expect(res._getJSONData()).toEqual(mockCar);
        });

        it('should return 400 if required fields are missing', async () => {
            req.body = { brand: 'Tesla' }; // Missing model, fuelType etc.
            req.user = { id: 1 };

            await createCar(req, res);

            expect(res.statusCode).toBe(400);
        });
    });
});
