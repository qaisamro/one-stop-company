const router = require('express').Router();
const multer = require('multer');
const path = require('path');

// Set up storage for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the 'uploads/' directory exists in your project root
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent overwrites
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    // Allow only image files
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb('Error: Images Only! (jpeg, jpg, png, gif)');
  },
});

router.post('/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or invalid file type.' });
  }
  // Construct the URL where the image will be accessible
  // Make sure your server is serving static files from 'uploads/'
  res.json({ url: `http://localhost:5000/uploads/${req.file.filename}` });
});

module.exports = router;