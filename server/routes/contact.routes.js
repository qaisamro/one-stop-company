const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contact.controller');

router.get('/',  ctrl.getContacts);
router.post('/', ctrl.createContact);

module.exports = router;