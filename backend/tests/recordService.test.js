const recordService = require('../services/recordService');
const FinancialRecord = require('../models/FinancialRecord');

jest.mock('../models/FinancialRecord', () => ({
  countDocuments: jest.fn(),
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

describe('recordService unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getAllRecords should apply search/pagination and return metadata', async () => {
    const queryResult = [{ _id: '1' }, { _id: '2' }];

    const queryChain = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(queryResult),
    };

    FinancialRecord.countDocuments.mockResolvedValue(12);
    FinancialRecord.find.mockReturnValue(queryChain);

    const result = await recordService.getAllRecords({
      type: 'expense',
      category: 'Food',
      search: 'lunch',
      page: 2,
      limit: 5,
    }, { role: 'admin' });

    expect(FinancialRecord.countDocuments).toHaveBeenCalledWith({
      type: 'expense',
      category: 'Food',
      $or: [
        { category: { $regex: 'lunch', $options: 'i' } },
        { description: { $regex: 'lunch', $options: 'i' } },
      ],
    });

    expect(queryChain.skip).toHaveBeenCalledWith(5);
    expect(queryChain.limit).toHaveBeenCalledWith(5);
    expect(result).toEqual({
      total: 12,
      page: 2,
      pages: 3,
      count: 2,
      records: queryResult,
    });
  });

  it('deleteRecord should soft delete by setting isDeleted true', async () => {
    FinancialRecord.findByIdAndUpdate.mockResolvedValue({ _id: 'abc' });

    await recordService.deleteRecord('abc');

    expect(FinancialRecord.findByIdAndUpdate).toHaveBeenCalledWith('abc', { isDeleted: true }, { new: true });
  });

  it('deleteRecord should throw when record is not found', async () => {
    FinancialRecord.findByIdAndUpdate.mockResolvedValue(null);

    await expect(recordService.deleteRecord('missing-id')).rejects.toThrow('Record not found');
  });
});
