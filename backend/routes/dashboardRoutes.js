const express = require('express');
const { getSummary, getInsights } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Dashboard summary and insight endpoints
 */

router.use(protect);

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get financial summary and recent transactions
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary data
 */
router.get('/summary', getSummary);

/**
 * @swagger
 * /api/dashboard/insights:
 *   get:
 *     summary: Get category breakdown, monthly trends, and AI-style insight text
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard insight data
 */
router.get('/insights', authorize('Admin', 'Analyst'), getInsights);

module.exports = router;
