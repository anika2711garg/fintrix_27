const express = require('express');
const { getSummary, getInsights } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/insights', authorize('Admin', 'Analyst'), getInsights);

module.exports = router;
