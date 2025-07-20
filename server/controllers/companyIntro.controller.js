const CompanyIntro = require('../models/companyIntro.model');
const fs = require('fs');
const path = require('path');

exports.getCompanyIntro = (req, res) => {
    const lang = req.query.lang || 'ar';
    CompanyIntro.get(lang, (err, result) => {
        if (err) {
            console.error('خطأ في getCompanyIntro:', err);
            return res.status(500).json({ error: 'خطأ داخلي في الخادم.' });
        }
        const introData = {
            title: result ? result.title : '',
            description: result && result.description ? result.description : [],
            images: result && result.images ? result.images : []
        };
        res.json(introData);
    });
};

exports.updateContent = (req, res) => {
    const { title, description, language } = req.body;
    if (!title || !Array.isArray(description) || description.length === 0 || !language) {
        return res.status(400).json({ error: 'Title, description (as an array), and language are required.' });
    }
    const descriptionJson = JSON.stringify(description);
    CompanyIntro.updateContent(title, descriptionJson, language, (err) => {
        if (err) {
            console.error('خطأ في updateContent:', err);
            return res.status(500).json({ error: 'فشل تحديث المحتوى.' });
        }
        res.json({ message: 'تم تحديث المحتوى بنجاح!' });
    });
};

exports.addImage = (req, res) => {
    const { language } = req.body;
    if (!req.file || !language) {
        return res.status(400).json({ error: 'الصورة واللغة مطلوبة.' });
    }
    const imagePath = `http://localhost:5000/Uploads/${req.file.filename}`;
    CompanyIntro.addImage(imagePath, language, (err) => {
        if (err) {
            console.error('خطأ في addImage:', err);
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error('خطأ في حذف الملف المرفوع:', unlinkErr);
            });
            return res.status(500).json({ error: 'فشل إضافة الصورة.' });
        }
        res.json({ message: 'تمت إضافة الصورة بنجاح!' });
    });
};

exports.deleteImage = (req, res) => {
    const { index } = req.params;
    const { language } = req.body;
    if (!language || index === undefined) {
        return res.status(400).json({ error: 'اللغة وفهرس الصورة مطلوبان.' });
    }
    const imageIndex = parseInt(index, 10);
    if (isNaN(imageIndex)) {
        return res.status(400).json({ error: 'فهرس الصورة غير صالح (يجب أن يكون رقمًا).' });
    }
    CompanyIntro.deleteImage(imageIndex, language, (dbErr, deletedImageUrl) => {
        if (dbErr) {
            console.error('خطأ في حذف الصورة من قاعدة البيانات:', dbErr);
            if (dbErr.message.includes('لا توجد صور') || dbErr.message.includes('فهرس الصورة غير صالح')) {
                return res.status(404).json({ error: dbErr.message });
            }
            return res.status(500).json({ error: 'فشل حذف الصورة من قاعدة البيانات.' });
        }
        if (deletedImageUrl) {
            const filename = path.basename(deletedImageUrl);
            const filePath = path.join(__dirname, '../Uploads', filename);
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.warn(`تحذير: تعذر حذف الملف من نظام الملفات: ${filePath}`, unlinkErr);
                    return res.status(200).json({ message: 'تم حذف الصورة من قاعدة البيانات، ولكن تعذر حذف الملف من الخادم.', warning: unlinkErr.message });
                }
                res.json({ message: 'تم حذف الصورة بنجاح!' });
            });
        } else {
            return res.status(500).json({ error: 'حدث خطأ غير متوقع: لم يتم الحصول على مسار الصورة المحذوفة.' });
        }
    });
};