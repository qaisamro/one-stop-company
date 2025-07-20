const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/services.controller');

// Routes for services
router.get('/', servicesController.getServices);
router.post('/', servicesController.createService);
router.put('/:id', servicesController.updateService);
router.delete('/:id', servicesController.deleteService);

module.exports = router;