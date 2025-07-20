const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/header.controller');

router.get('/', ctrl.getHeaderLinks);
router.post('/',  ctrl.addHeaderLink);
router.put('/:id',  ctrl.updateHeaderLink);
router.delete('/:id',  ctrl.deleteHeaderLink);

module.exports = router;