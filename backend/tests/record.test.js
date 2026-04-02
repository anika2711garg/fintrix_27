const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const FinancialRecord = require('../models/FinancialRecord');

describe('Financial Records API', () => {
  // Clear database after each test
  afterEach(async () => {
    // await FinancialRecord.deleteMany();
  });

  // Close connection after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should return 401 if not authorized', async () => {
    const res = await request(app).get('/api/records');
    expect(res.statusCode).toEqual(401);
  });
});
