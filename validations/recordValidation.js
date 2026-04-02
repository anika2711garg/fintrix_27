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
    category: z.string().trim().min(1).max(60).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().min(1).max(80).optional(),
  }),
});

const recordIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid record id'),
  }),
});

module.exports = {
  createRecordSchema,
  getRecordsSchema,
  recordIdParamSchema,
};
