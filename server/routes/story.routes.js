const router = require('express').Router();
const ctrl = require('../controllers/story.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Multer Configuration for Story Images ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'Uploads', 'story');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: Only image files are allowed (jpeg, jpg, png, gif)!'));
    }
});

// --- Routes ---
router.get('/', ctrl.getStory);
router.post('/', upload.single('image'), ctrl.createStory);
router.put('/:id', upload.single('image'), ctrl.updateStory);

module.exports = router;