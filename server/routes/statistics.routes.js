const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statistics.controller');

router.get('/',  statisticsController.getStats);
router.post('/',  statisticsController.createStat);
router.delete('/:id',statisticsController.deleteStat);

module.exports = router;