const {
  getUsersSchema,
  updateUserSchema,
  userIdParamSchema,
} = require('../validations/authValidation');

describe('auth validation unit tests', () => {
  it('getUsersSchema should coerce and validate pagination fields', () => {
    const parsed = getUsersSchema.parse({
      query: {
        page: '2',
        limit: '25',
        search: 'anika',
      },
    });

    expect(parsed.query.page).toBe(2);
    expect(parsed.query.limit).toBe(25);
    expect(parsed.query.search).toBe('anika');
  });

  it('updateUserSchema should reject empty update payload', () => {
    expect(() => {
      updateUserSchema.parse({
        params: { id: '507f1f77bcf86cd799439011' },
        body: {},
      });
    }).toThrow('At least one field (role or status) is required');
  });

  it('userIdParamSchema should reject invalid mongo id', () => {
    expect(() => {
      userIdParamSchema.parse({
        params: { id: '123' },
      });
    }).toThrow('Invalid user id');
  });
});
