const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/projects.controller');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './Uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

router.get('/background', ctrl.getProjectBackground);
router.post('/background', upload.single('image'), ctrl.updateProjectBackground);
router.get('/', ctrl.getProjects);
router.get('/:id', ctrl.getProjectById);
router.post('/', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'additional_images', maxCount: 5 }]), ctrl.createProject);
router.put('/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'additional_images', maxCount: 5 }]), ctrl.updateProject);
router.delete('/:id', ctrl.deleteProject);

module.exports = router;