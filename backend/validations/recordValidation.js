const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid record id');

const createRecordSchema = z.object({
  body: z.object({
    amount: z.coerce.number().positive('Amount must be positive'),
    type: z.enum(['income', 'expense']),
    category: z.string().trim().min(1, 'Category is required').max(80),
    date: z.coerce.date().optional(),
    description: z.string().trim().max(200, 'Description cannot exceed 200 characters').optional(),
  }),
});

const updateRecordSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    amount: z.coerce.number().positive('Amount must be positive').optional(),
    type: z.enum(['income', 'expense']).optional(),
    category: z.string().trim().min(1, 'Category is required').max(80).optional(),
    date: z.coerce.date().optional(),
    description: z.string().trim().max(200, 'Description cannot exceed 200 characters').optional(),
  }).refine((payload) => Object.keys(payload).length > 0, {
    message: 'At least one field is required for update',
  }),
});

const getRecordsSchema = z.object({
  query: z.object({
    type: z.enum(['income', 'expense']).optional(),
    category: z.string().trim().min(1).max(80).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().min(1).max(120).optional(),
    sort: z.enum(['latest', 'oldest', 'highest', 'lowest']).default('latest'),
  }),
});

const exportRecordsSchema = z.object({
  query: z.object({
    format: z.enum(['json', 'csv']).default('json'),
    type: z.enum(['income', 'expense']).optional(),
    category: z.string().trim().min(1).max(80).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    search: z.string().trim().min(1).max(120).optional(),
    sort: z.enum(['latest', 'oldest', 'highest', 'lowest']).default('latest'),
  }),
});

const recordIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

const getTrashSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
});

module.exports = {
  createRecordSchema,
  updateRecordSchema,
  getRecordsSchema,
  exportRecordsSchema,
  recordIdParamSchema,
  getTrashSchema,
};
