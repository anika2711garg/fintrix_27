const express = require('express');
const {
  register,
  createUser,
  login,
  refresh,
  logout,
  logoutAll,
  getMe,
  getUsers,
  updateUser,
  deleteUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const {
  registerSchema,
  createUserSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  getUsersSchema,
  updateUserSchema,
  userIdParamSchema,
} = require('../validations/authValidation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and user management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthRegisterRequest:
 *       type: object
 *       required: [name, email, password]
 *       properties:
 *         name:
 *           type: string
 *           example: Anika Garg
 *         email:
 *           type: string
 *           format: email
 *           example: anika@example.com
 *         password:
 *           type: string
 *           minLength: 6
 *           example: secret123
 *         role:
 *           type: string
 *           enum: [admin, analyst, viewer]
 *     AuthLoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: admin@fintrix.com
 *         password:
 *           type: string
 *           example: secret123
 *     UserUpdateRequest:
 *       type: object
 *       properties:
 *         role:
 *           type: string
 *           enum: [admin, analyst, viewer]
 *         status:
 *           type: string
 *           enum: [active, inactive]
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', validate(registerSchema), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email/password and receive JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(loginSchema), login);

router.post('/refresh', validate(refreshSchema), refresh);

router.post('/logout', validate(logoutSchema), logout);

router.post('/logout-all', protect, logoutAll);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get currently logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Unauthorized
 */
router.get('/me', protect, getMe);

router.post('/users', protect, authorize('admin'), validate(createUserSchema), createUser);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Get users with pagination, filters, and search
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, analyst, viewer]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of users
 */
router.get('/users', protect, authorize('admin'), validate(getUsersSchema), getUsers);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   put:
 *     summary: Update user role or status
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/users/:id', protect, authorize('admin'), validate(updateUserSchema), updateUser);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   delete:
 *     summary: Soft delete a user account
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User soft-deleted successfully
 */
router.delete('/users/:id', protect, authorize('admin'), validate(userIdParamSchema), deleteUser);

module.exports = router;
