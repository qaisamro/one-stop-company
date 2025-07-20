const About = require('../models/about.model');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'Uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, gif) are allowed!'));
  },
});

exports.getAbout = (req, res) => {
  const { lang } = req.query;

  About.getByLanguage(lang, (err, result) => {
    if (err) {
      console.error('Error fetching about content:', err);
      return res.status(500).json({ error: 'Failed to fetch about content.' });
    }
    if (!result) {
      return res.json({
        title_small: '',
        title_main: '',
        description: '',
        image_url: '',
        experience_year: null,
        experience_text: '',
        button_text: '',
        button_url: '',
        blocks: [],
        features: [], // Return empty array for features
      });
    }
    if (result.image_url) {
      result.image_url = `${req.protocol}://${req.get('host')}/uploads/${path.basename(result.image_url)}`;
    }
    res.json(result);
  });
};

exports.getAboutDetails = (req, res) => {
  const { lang } = req.query;

  About.getDetailsByLanguage(lang, (err, result) => {
    if (err) {
      console.error('Error fetching about details:', err);
      return res.status(500).json({ error: 'Failed to fetch about details.' });
    }
    res.json(result || { content: '', features: [] });
  });
};

exports.updateAbout = (req, res) => {
  upload.single('image_file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: err.message });
    }

    const { lang, ...data } = req.body;
    let image_url = data.current_image_url;

    if (req.file) {
      image_url = req.file.path;
    }

    let blocks = [];
    if (data.blocks) {
      try {
        blocks = JSON.parse(data.blocks);
      } catch (e) {
        console.error('Failed to parse blocks JSON:', e);
        return res.status(400).json({ error: 'Invalid blocks data format.' });
      }
    }

    let features = [];
    if (data.features) {
      try {
        features = JSON.parse(data.features);
      } catch (e) {
        console.error('Failed to parse features JSON:', e);
        return res.status(400).json({ error: 'Invalid features data format.' });
      }
    }

    const contentToUpdate = {
      title_small: data.title_small,
      title_main: data.title_main,
      description: data.description,
      image_url: image_url,
      experience_year: data.experience_year,
      experience_text: data.experience_text,
      button_text: data.button_text,
      button_url: data.button_url,
      blocks: blocks,
      features: features,
    };

    About.getByLanguage(lang, (err, result) => {
      if (err) {
        console.error('Error checking existing about content:', err);
        return res.status(500).json({ error: 'Failed to check existing content.' });
      }

      if (result) {
        About.updateByLanguage(lang, contentToUpdate, (err, message) => {
          if (err) {
            console.error('Error updating about content:', err);
            return res.status(500).json({ error: 'Failed to update content.' });
          }
          res.json(message);
        });
      } else {
        About.insertNew(lang, contentToUpdate, (err, message) => {
          if (err) {
            console.error('Error inserting new about content:', err);
            return res.status(500).json({ error: 'Failed to insert new content.' });
          }
          res.json(message);
        });
      }
    });
  });
};