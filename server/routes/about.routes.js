const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/about.controller');

router.get('/', aboutController.getAbout);
router.get('/details', aboutController.getAboutDetails);
router.put('/', aboutController.updateAbout);

module.exports = router;