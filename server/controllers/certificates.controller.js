// C:\Users\Lenovo\one-stop-company\server\controllers\certificates.controller.js
const Certificate = require('../models/certificates.model');
const fs = require('fs'); // Import file system module for deleting files
const path = require('path'); // Import path for directory manipulation
const multer = require('multer'); // لكون المتحكم الأصلي يعتمد على Multer، نفترض أنه تم إعداده في مكان آخر أو ستقوم بإعداده هنا.

// هنا يجب أن يكون إعداد Multer (لنفترض أنه تم في ملف Middleware أو هنا بشكل مبسط)
// بما أن الكود الأصلي لم يتضمن إعداد Multer الكامل هنا، سأضيف الجزء الأساسي
// هذا الجزء يبقى كما هو لأنه يتعامل مع نظام الملفات المحلي وليس قاعدة البيانات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'Uploads/certificates/'; // مسار جديد لشهادات
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // إنشاء المجلد إذا لم يكن موجودًا
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// هذا هو middleware Multer الذي سيتم استخدامه في مسارات الـ API
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
}).single('image'); // 'image' هو اسم حقل الملف في الطلب


exports.getCertificates = (req, res) => {
    const lang = req.query.lang || 'ar';
    Certificate.getAll(lang, (err, result) => {
        if (err) {
            console.error('Error in getCertificates:', err);
            return res.status(500).json({ error: 'خطأ داخلي في الخادم' });
        }
        // Modify image paths to be accessible from the frontend
        // Assuming your database model returns `title_ar` or `title_en` as `title` based on `lang`
        const certificatesWithImageUrls = result.map(cert => ({
            ...cert,
            // تحديد الحقل الصحيح للعنوان بناءً على اللغة المطلوبة
            title: lang === 'ar' ? cert.title_ar : cert.title_en,
            // Assuming your server serves static files from /uploads
            image: cert.image ? `http://localhost:5000/uploads/certificates/${path.basename(cert.image)}` : null
        }));
        res.json(certificatesWithImageUrls);
    });
};

exports.createCertificate = (req, res) => {
    upload(req, res, (uploadErr) => { // استخدم Multer هنا
        if (uploadErr) {
            return res.status(400).json({ error: uploadErr.message });
        }

        const { title, issuer, year, link, language } = req.body;
        const image = req.file ? req.file.path : null; // Get the path where Multer saved the file

        if (!title || !image || !issuer) {
            if (image && fs.existsSync(image)) {
                fs.unlinkSync(image); // Delete the uploaded file if validation fails
            }
            return res.status(400).json({ error: 'يرجى ملء جميع الحقول المطلوبة (العنوان، الجهة المانحة، والصورة).' });
        }

        const certificateData = {
            title, // هذا سيكون إما title_ar أو title_en
            image,
            issuer,
            year: year ? parseInt(year) : null,
            link: link || null,
            language: language || 'ar'
        };

        Certificate.create(certificateData, (err, newCert) => { // استلام newCert من النموذج
            if (err) {
                console.error('Error in createCertificate:', err);
                if (image && fs.existsSync(image)) {
                    fs.unlinkSync(image); // Delete the uploaded file to prevent orphans
                }
                return res.status(500).json({ error: 'فشل إضافة الشهادة', details: err.message });
            }
            // إرجاع الشهادة الجديدة مع مسار الصورة الصحيح
            const imageUrl = newCert.image ? `http://localhost:5000/uploads/certificates/${path.basename(newCert.image)}` : null;
            res.json({
                message: 'تمت الإضافة بنجاح',
                certificate: {
                    id: newCert.id,
                    title: newCert.title, // هذا هو العنوان باللغة المطلوبة
                    image: imageUrl,
                    issuer: newCert.issuer,
                    year: newCert.year,
                    link: newCert.link,
                    language: newCert.language
                }
            });
        });
    });
};

exports.updateCertificate = (req, res) => {
    upload(req, res, (uploadErr) => { // استخدم Multer هنا
        if (uploadErr) {
            return res.status(400).json({ error: uploadErr.message });
        }

        const { title, issuer, year, link, language } = req.body;
        const newImage = req.file ? req.file.path : null;
        const certificateId = req.params.id;

        if (!title || !issuer) {
            if (newImage && fs.existsSync(newImage)) {
                fs.unlinkSync(newImage);
            }
            return res.status(400).json({ error: 'يرجى ملء جميع الحقول المطلوبة (العنوان والجهة المانحة).' });
        }

        Certificate.getById(certificateId, (err, oldCertResults) => {
            if (err) {
                console.error('Error fetching old certificate for update:', err);
                if (newImage && fs.existsSync(newImage)) {
                    fs.unlinkSync(newImage);
                }
                return res.status(500).json({ error: 'خطأ داخلي في الخادم عند جلب الشهادة القديمة.' });
            }
            if (!oldCertResults || oldCertResults.length === 0) {
                if (newImage && fs.existsSync(newImage)) {
                    fs.unlinkSync(newImage);
                }
                return res.status(404).json({ error: 'الشهادة غير موجودة.' });
            }

            const oldCert = oldCertResults[0];
            const oldImagePath = oldCert.image; // المسار الحالي للصورة في قاعدة البيانات

            const certificateData = {
                title,
                issuer,
                year: year ? parseInt(year) : null,
                link: link || null,
                language: language || 'ar',
                image: newImage || oldImagePath // استخدم الصورة الجديدة إذا تم تحميلها، وإلا احتفظ بالقديمة
            };

            Certificate.update(certificateId, certificateData, (err) => {
                if (err) {
                    console.error('Error in updateCertificate:', err);
                    if (newImage && fs.existsSync(newImage)) {
                        fs.unlinkSync(newImage); // Delete the new image if DB update fails
                    }
                    return res.status(500).json({ error: 'فشل تحديث الشهادة', details: err.message });
                }

                // If a new image was uploaded and it's different from the old one, delete the old file
                if (newImage && oldImagePath && newImage !== oldImagePath) {
                    // تحقق أن oldImagePath موجودة قبل محاولة حذفها
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlink(oldImagePath, (unlinkErr) => { // استخدام fs.unlink لغير المتزامن
                            if (unlinkErr) console.error('Error deleting old image:', unlinkErr);
                        });
                    }
                }
                res.json({ message: 'تم التحديث بنجاح' });
            });
        });
    });
};

exports.deleteCertificate = (req, res) => {
    const certificateId = req.params.id;

    Certificate.getById(certificateId, (err, certResults) => {
        if (err) {
            console.error('Error fetching certificate for deletion:', err);
            return res.status(500).json({ error: 'خطأ داخلي في الخادم عند جلب الشهادة للحذف.' });
        }
        if (!certResults || certResults.length === 0) {
            return res.status(404).json({ error: 'الشهادة غير موجودة.' });
        }

        const imagePath = certResults[0].image; // مسار الصورة في قاعدة البيانات

        Certificate.delete(certificateId, (err) => {
            if (err) {
                console.error('Error in deleteCertificate:', err);
                return res.status(500).json({ error: 'فشل حذف الشهادة' });
            }
            // If DB record is deleted, also delete the corresponding file
            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (unlinkErr) => { // استخدام fs.unlink لغير المتزامن
                    if (unlinkErr) console.error('Error deleting image file:', unlinkErr);
                });
            }
            res.json({ message: 'تم الحذف بنجاح' });
        });
    });
};