const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['Admin', 'Analyst', 'Viewer']).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const getUsersSchema = z.object({
  query: z.object({
    role: z.enum(['Admin', 'Analyst', 'Viewer']).optional(),
    status: z.enum(['Active', 'Inactive']).optional(),
    search: z.string().trim().min(1).max(80).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
});

const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user id'),
  }),
  body: z.object({
    role: z.enum(['Admin', 'Analyst', 'Viewer']).optional(),
    status: z.enum(['Active', 'Inactive']).optional(),
  }).refine((data) => data.role || data.status, {
    message: 'At least one field (role or status) is required',
  }),
});

const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user id'),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  getUsersSchema,
  updateUserSchema,
  userIdParamSchema,
};
