const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/companyIntro.controller');

router.get('/', ctrl.getCompanyIntro);
router.put('/', ctrl.updateContent);
router.post('/image', ctrl.addImage);
router.delete('/image/:index', ctrl.deleteImage);

module.exports = router;