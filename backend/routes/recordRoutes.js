const express = require('express');
const {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
} = require('../controllers/recordController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const {
  createRecordSchema,
  getRecordsSchema,
  recordIdParamSchema,
} = require('../validations/recordValidation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Records
 *     description: Financial records CRUD, pagination, and search
 */

router.use(protect);

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: Get records with filters, pagination, and search
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive description search
 *     responses:
 *       200:
 *         description: Paginated records
 *   post:
 *     summary: Create a financial record
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Record created
 */
router
  .route('/')
  .get(validate(getRecordsSchema), getRecords)
  .post(authorize('Admin', 'Analyst'), validate(createRecordSchema), createRecord);

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: Get a single record
 *     tags: [Records]
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
 *         description: Record details
 *   put:
 *     summary: Update a record
 *     tags: [Records]
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
 *         description: Record updated
 *   delete:
 *     summary: Soft delete a record
 *     tags: [Records]
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
 *         description: Record soft-deleted
 */
router
  .route('/:id')
  .get(validate(recordIdParamSchema), getRecord)
  .put(authorize('Admin'), validate(recordIdParamSchema), validate(createRecordSchema), updateRecord)
  .delete(authorize('Admin'), validate(recordIdParamSchema), deleteRecord);

module.exports = router;
