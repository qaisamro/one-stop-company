const router = require('express').Router();
const ctrl = require('../controllers/features.controller');

router.get('/', ctrl.getFeatures);
router.put('/:id', ctrl.updateSection);
router.post('/', ctrl.createSection); // <--- أضف هذا السطر!
router.post('/:id/item', ctrl.addItem);
router.delete('/item/:id', ctrl.deleteItem);

module.exports = router;