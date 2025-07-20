const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/certificates.controller');
const multer = require('multer'); // Import multer
const path = require('path'); // Import path for directory manipulation

// Configure storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/certificates');
        require('fs').mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.get('/', ctrl.getCertificates);
router.post('/', upload.single('image'), ctrl.createCertificate);
router.put('/:id', upload.single('image'), ctrl.updateCertificate);
router.delete('/:id', ctrl.deleteCertificate);

module.exports = router;