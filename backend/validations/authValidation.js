const { z } = require('zod');

const roleEnum = z.enum(['admin', 'analyst', 'viewer']);
const statusEnum = z.enum(['active', 'inactive']);

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: roleEnum.optional(),
  }),
});

const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: roleEnum.default('viewer'),
    status: statusEnum.default('active'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(32, 'Refresh token is required'),
  }),
});

const logoutSchema = refreshSchema;

const getUsersSchema = z.object({
  query: z.object({
    role: roleEnum.optional(),
    status: statusEnum.optional(),
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
    role: roleEnum.optional(),
    status: statusEnum.optional(),
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
  createUserSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  getUsersSchema,
  updateUserSchema,
  userIdParamSchema,
};
