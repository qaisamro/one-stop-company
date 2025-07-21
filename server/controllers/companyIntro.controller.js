const CompanyIntro = require('../models/companyIntro.model');
const fs = require('fs');
const path = require('path');

// للحصول على عنوان الصور من متغير البيئة
const BASE_IMAGE_URL = process.env.BASE_IMAGE_URL || 'http://localhost:5000';

exports.getCompanyIntro = (req, res) => {
    const lang = req.query.lang || 'ar';

    CompanyIntro.get(lang, (err, result) => {
        if (err) {
            console.error('خطأ في getCompanyIntro:', err);
            return res.status(500).json({ error: 'خطأ داخلي في الخادم.' });
        }

        const introData = {
            title: result?.title || '',
            description: Array.isArray(result?.description) ? result.description : [],
            images: Array.isArray(result?.images) ? result.images : []
        };

        res.json(introData);
    });
};

exports.updateContent = (req, res) => {
    const { title, description, language } = req.body;

    if (!title || !Array.isArray(description) || !language) {
        return res.status(400).json({ error: 'الرجاء توفير العنوان والوصف واللغة.' });
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

    const imagePath = `${BASE_IMAGE_URL}/Uploads/${req.file.filename}`;

    CompanyIntro.addImage(imagePath, language, (err) => {
        if (err) {
            console.error('خطأ في addImage:', err);

            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('خطأ في حذف الملف المرفوع:', unlinkErr);
                }
            });

            return res.status(500).json({ error: 'فشل إضافة الصورة.' });
        }

        res.json({ message: 'تمت إضافة الصورة بنجاح!' });
    });
};

exports.deleteImage = (req, res) => {
    const { index } = req.params;
    const { language } = req.body;

    const imageIndex = parseInt(index, 10);

    if (!language || isNaN(imageIndex)) {
        return res.status(400).json({ error: 'اللغة وفهرس الصورة مطلوبان بشكل صحيح.' });
    }

    CompanyIntro.deleteImage(imageIndex, language, (err, deletedImageUrl) => {
        if (err) {
            console.error('خطأ في حذف الصورة من قاعدة البيانات:', err);

            if (err.message.includes('لا توجد صور') || err.message.includes('فهرس الصورة غير صالح')) {
                return res.status(404).json({ error: err.message });
            }

            return res.status(500).json({ error: 'فشل حذف الصورة من قاعدة البيانات.' });
        }

        if (!deletedImageUrl) {
            return res.status(500).json({ error: 'حدث خطأ غير متوقع: لم يتم العثور على رابط الصورة المحذوفة.' });
        }

        const filename = path.basename(deletedImageUrl);
        const filePath = path.join(__dirname, '../Uploads', filename);

        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
                console.warn(`تحذير: تعذر حذف الملف من السيرفر: ${filePath}`, unlinkErr);
                return res.status(200).json({
                    message: 'تم حذف الصورة من قاعدة البيانات، لكن تعذر حذف الملف من السيرفر.',
                    warning: unlinkErr.message
                });
            }

            res.json({ message: 'تم حذف الصورة بنجاح!' });
        });
    });
};
