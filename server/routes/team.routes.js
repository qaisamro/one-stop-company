const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
// const authMiddleware = require('../middleware/authMiddleware'); // افتراض أن هذا هو مسار middleware الخاص بك

// Note: For create and update, the multer middleware is now handled inside the controller functions
router.get('/', teamController.getTeam);
router.post('/', teamController.createMember); // Add back authentication if needed: authMiddleware.verifyToken,
router.put('/:id', teamController.updateMember); // Add back authentication if needed: authMiddleware.verifyToken,
router.delete('/:id', teamController.deleteMember); // Add back authentication if needed: authMiddleware.verifyToken,

module.exports = router;
