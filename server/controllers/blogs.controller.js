const Blogs = require('../models/blogs.model');
const path = require('path');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Images only (JPEG/PNG)!'));
    }
  }
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'additionalImages', maxCount: 10 }
]);

exports.getBlogs = (req, res) => {
  const { lang } = req.query;
  Blogs.getAll(lang, (err, blogs) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch blogs' });
    }
    blogs = blogs.map(blog => ({
      ...blog,
      image: blog.image ? `${req.protocol}://${req.get('host')}/Uploads/${path.basename(blog.image)}` : '',
      additional_images: blog.additional_images.map(img => `${req.protocol}://${req.get('host')}/Uploads/${path.basename(img)}`)
    }));
    res.json(blogs);
  });
};

exports.getBlogById = (req, res) => {
  const { id } = req.params;
  const { lang } = req.query;
  Blogs.getById(id, lang, (err, blog) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch blog' });
    }
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    blog.image = blog.image ? `${req.protocol}://${req.get('host')}/Uploads/${path.basename(blog.image)}` : '';
    blog.additional_images = blog.additional_images.map(img => `${req.protocol}://${req.get('host')}/Uploads/${path.basename(img)}`);
    res.json(blog);
  });
};

exports.createBlog = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { title, description, content, date, language, author, category, existingAdditionalImages } = req.body;
    let image = req.files['image'] ? req.files['image'][0].path : '';
    let additionalImages = req.files['additionalImages'] ? req.files['additionalImages'].map(file => file.path) : [];
    
    // Merge existing additional images with new ones
    let existingImages = [];
    try {
      existingImages = existingAdditionalImages ? JSON.parse(existingAdditionalImages) : [];
    } catch (e) {
      console.error('Error parsing existingAdditionalImages:', e);
    }
    additionalImages = [...existingImages, ...additionalImages];

    const blogData = {
      title,
      description,
      content,
      image,
      additional_images: additionalImages,
      date,
      language,
      author,
      category
    };

    Blogs.insert(blogData, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to create blog' });
      }
      res.json(result);
    });
  });
};

exports.updateBlog = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { id } = req.params;
    const { title, description, content, date, language, author, category, currentImage, existingAdditionalImages } = req.body;
    let image = req.files['image'] ? req.files['image'][0].path : currentImage;
    let additionalImages = req.files['additionalImages'] ? req.files['additionalImages'].map(file => file.path) : [];
    
    // Merge existing additional images with new ones
    let existingImages = [];
    try {
      existingImages = existingAdditionalImages ? JSON.parse(existingAdditionalImages) : [];
    } catch (e) {
      console.error('Error parsing existingAdditionalImages:', e);
    }
    additionalImages = [...existingImages, ...additionalImages];

    const blogData = {
      title,
      description,
      content,
      image,
      additional_images: additionalImages,
      date,
      language,
      author,
      category
    };

    Blogs.update(id, blogData, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to update blog' });
      }
      res.json(result);
    });
  });
};

exports.deleteBlog = (req, res) => {
  const { id } = req.params;
  Blogs.delete(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete blog' });
    }
    res.json(result);
  });
};