const { z } = require('zod');

const createRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    type: z.enum(['income', 'expense']),
    category: z.string().min(1, 'Category is required'),
    date: z.string().datetime({ message: 'Invalid ISO date string' }).optional().or(z.string().optional()),
    description: z.string().max(200, 'Description cannot exceed 200 characters').optional(),
  }),
});

const getRecordsSchema = z.object({
  query: z.object({
    type: z.enum(['income', 'expense']).optional(),
    category: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
  }),
});

module.exports = {
  createRecordSchema,
  getRecordsSchema,
};
