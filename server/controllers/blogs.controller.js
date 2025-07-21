// C:\Users\Lenovo\one-stop-company\server\controllers\blogs.controller.js
const Blogs = require('../models/blogs.model');
const path = require('path');
const multer = require('multer');
const fs = require('fs'); // لإدارة حذف الملفات

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // تأكد من وجود مجلد التحميل
    const uploadDir = 'Uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
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
    blogs = blogs.map(blog => {
      // تأكد أن additional_images هي مصفوفة، حيث يمكن أن تكون محللة بالفعل بواسطة driver الـ pg
      const parsedAdditionalImages = typeof blog.additional_images === 'string'
        ? JSON.parse(blog.additional_images)
        : blog.additional_images || [];

      return {
        ...blog,
        image: blog.image ? `${req.protocol}://${req.get('host')}/Uploads/${path.basename(blog.image)}` : '',
        additional_images: parsedAdditionalImages.map(img =>
          `${req.protocol}://${req.get('host')}/Uploads/${path.basename(img)}`
        )
      };
    });
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

    // تأكد أن additional_images هي مصفوفة، حيث يمكن أن تكون محللة بالفعل بواسطة driver الـ pg
    const parsedAdditionalImages = typeof blog.additional_images === 'string'
      ? JSON.parse(blog.additional_images)
      : blog.additional_images || [];

    blog.image = blog.image ? `${req.protocol}://${req.get('host')}/Uploads/${path.basename(blog.image)}` : '';
    blog.additional_images = parsedAdditionalImages.map(img =>
      `${req.protocol}://${req.get('host')}/Uploads/${path.basename(img)}`
    );
    res.json(blog);
  });
};

exports.createBlog = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { title, description, content, date, language, author, category, existingAdditionalImages } = req.body;
    let image = req.files && req.files['image'] && req.files['image'][0] ? req.files['image'][0].path : '';
    let additionalImages = req.files && req.files['additionalImages'] ? req.files['additionalImages'].map(file => file.path) : [];
    
    // Merge existing additional images with new ones
    let existingImages = [];
    try {
      // عندما يرسل العميل existingAdditionalImages، يتوقع أن تكون URLs كاملة
      // يجب تحويلها إلى مسارات نسبية للملفات على الخادم إذا كانت مخزنة كذلك
      existingImages = existingAdditionalImages ? JSON.parse(existingAdditionalImages) : [];
      // تحويل URLs إلى مسارات قاعدة (basename) لتطابق ما هو مخزن في قاعدة البيانات
      existingImages = existingImages.map(imgUrl => path.basename(imgUrl));
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
        // في حالة الفشل، قم بحذف الملفات التي تم تحميلها
        if (image && fs.existsSync(image)) fs.unlinkSync(image);
        additionalImages.forEach(imgPath => {
          if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        });
        return res.status(500).json({ error: 'Failed to create blog', details: err.message });
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
    
    let newImagePath = req.files && req.files['image'] && req.files['image'][0] ? req.files['image'][0].path : currentImage;
    let newAdditionalImages = req.files && req.files['additionalImages'] ? req.files['additionalImages'].map(file => file.path) : [];
    
    let existingImagesParsed = [];
    try {
      existingImagesParsed = existingAdditionalImages ? JSON.parse(existingAdditionalImages) : [];
      // تحويل URLs إلى مسارات قاعدة (basename) لتطابق ما هو مخزن في قاعدة البيانات
      existingImagesParsed = existingImagesParsed.map(imgUrl => path.basename(imgUrl));
    } catch (e) {
      console.error('Error parsing existingAdditionalImages:', e);
    }
    
    newAdditionalImages = [...existingImagesParsed, ...newAdditionalImages];

    // خطوة 1: جلب المدونة الحالية للحصول على مسارات الصور القديمة
    Blogs.getById(id, language, (err, oldBlog) => { // استخدم `language` لجلب المدونة الصحيحة
      if (err) {
        // في حالة فشل جلب المدونة القديمة، قم بحذف الملفات التي تم تحميلها للتو
        if (req.files && req.files['image'] && req.files['image'][0] && fs.existsSync(req.files['image'][0].path)) fs.unlinkSync(req.files['image'][0].path);
        if (req.files && req.files['additionalImages']) {
          req.files['additionalImages'].forEach(file => {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          });
        }
        return res.status(500).json({ error: 'Failed to fetch existing blog for update', details: err.message });
      }

      if (!oldBlog) {
        // إذا لم يتم العثور على المدونة، قم بحذف الملفات التي تم تحميلها للتو
        if (req.files && req.files['image'] && req.files['image'][0] && fs.existsSync(req.files['image'][0].path)) fs.unlinkSync(req.files['image'][0].path);
        if (req.files && req.files['additionalImages']) {
          req.files['additionalImages'].forEach(file => {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          });
        }
        return res.status(404).json({ error: 'Blog not found' });
      }

      const oldImagePath = oldBlog.image;
      const oldAdditionalImagePaths = oldBlog.additional_images; // هذه يجب أن تكون مصفوفة بالفعل من النموذج

      const blogData = {
        title,
        description,
        content,
        image: newImagePath,
        additional_images: newAdditionalImages,
        date,
        language,
        author,
        category
      };

      Blogs.update(id, blogData, (updateErr, result) => {
        if (updateErr) {
          // في حالة الفشل، قم بحذف الملفات التي تم تحميلها للتو (وليس القديمة)
          if (req.files && req.files['image'] && req.files['image'][0] && fs.existsSync(req.files['image'][0].path)) fs.unlinkSync(req.files['image'][0].path);
          if (req.files && req.files['additionalImages']) {
            req.files['additionalImages'].forEach(file => {
              if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
          }
          return res.status(500).json({ error: 'Failed to update blog', details: updateErr.message });
        }

        // خطوة 3: بعد التحديث الناجح، قم بحذف الصور القديمة غير المستخدمة
        // حذف الصورة الرئيسية القديمة إذا تم استبدالها
        if (oldImagePath && newImagePath !== oldImagePath && fs.existsSync(oldImagePath)) {
          fs.unlink(oldImagePath, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting old main image:', unlinkErr);
          });
        }

        // حذف الصور الإضافية القديمة التي لم تعد موجودة في القائمة الجديدة
        const imagesToDelete = oldAdditionalImagePaths.filter(oldImg => {
          return !newAdditionalImages.includes(oldImg);
        });

        imagesToDelete.forEach(imgPath => {
          if (fs.existsSync(imgPath)) {
            fs.unlink(imgPath, (unlinkErr) => {
              if (unlinkErr) console.error('Error deleting old additional image:', unlinkErr);
            });
          }
        });

        res.json(result);
      });
    });
  });
};

exports.deleteBlog = (req, res) => {
  const { id } = req.params;
  Blogs.getById(id, 'en', (err, blogToDelete) => { // يمكن استخدام أي لغة هنا فقط للحصول على المدونة
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch blog for deletion', details: err.message });
    }
    if (!blogToDelete) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    Blogs.delete(id, (deleteErr, result) => {
      if (deleteErr) {
        return res.status(500).json({ error: 'Failed to delete blog', details: deleteErr.message });
      }

      // حذف ملفات الصور بعد حذف السجل من قاعدة البيانات
      if (blogToDelete.image && fs.existsSync(blogToDelete.image)) {
        fs.unlink(blogToDelete.image, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting main image file:', unlinkErr);
        });
      }

      const additionalImages = typeof blogToDelete.additional_images === 'string'
        ? JSON.parse(blogToDelete.additional_images)
        : blogToDelete.additional_images || [];

      additionalImages.forEach(imgPath => {
        if (fs.existsSync(imgPath)) {
          fs.unlink(imgPath, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting additional image file:', unlinkErr);
          });
        }
      });

      res.json(result);
    });
  });
};