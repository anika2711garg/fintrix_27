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
const { createRecordSchema, getRecordsSchema } = require('../validations/recordValidation');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(validate(getRecordsSchema), getRecords)
  .post(authorize('Admin', 'Analyst'), validate(createRecordSchema), createRecord);

router
  .route('/:id')
  .get(getRecord)
  .put(authorize('Admin'), validate(createRecordSchema), updateRecord) // RE-use create schema for simplicity in this assignment
  .delete(authorize('Admin'), deleteRecord);

module.exports = router;
