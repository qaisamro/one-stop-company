const Certificate = require('../models/certificates.model');
const fs = require('fs'); // Import file system module for deleting files
const path = require('path'); // Import path for directory manipulation

exports.getCertificates = (req, res) => {
    const lang = req.query.lang || 'ar';
    Certificate.getAll(lang, (err, result) => {
        if (err) {
            console.error('Error in getCertificates:', err);
            return res.status(500).json({ error: 'خطأ داخلي في الخادم' });
        }
        // Modify image paths to be accessible from the frontend
        const certificatesWithImageUrls = result.map(cert => ({
            ...cert,
            // Assuming your server serves static files from /uploads
            image: cert.image ? `http://localhost:5000/uploads/certificates/${path.basename(cert.image)}` : null
        }));
        res.json(certificatesWithImageUrls);
    });
};

exports.createCertificate = (req, res) => {
    const { title, issuer, year, link, language } = req.body;
    const image = req.file ? req.file.path : null; // Get the path where Multer saved the file

    if (!title || !image || !issuer) { // issuer is now required
        // If there's an uploaded file and validation fails, delete it
        if (image && fs.existsSync(image)) {
            fs.unlinkSync(image);
        }
        return res.status(400).json({ error: 'يرجى ملء جميع الحقول المطلوبة (العنوان، الجهة المانحة، والصورة).' });
    }

    const certificateData = {
        title,
        image,
        issuer,
        year: year ? parseInt(year) : null, // Convert year to integer, handle null
        link: link || null, // Allow link to be null
        language: language || 'ar'
    };

    Certificate.create(certificateData, (err) => {
        if (err) {
            console.error('Error in createCertificate:', err);
            // If there's a DB error, delete the uploaded file to prevent orphans
            if (image && fs.existsSync(image)) {
                fs.unlinkSync(image);
            }
            return res.status(500).json({ error: 'فشل إضافة الشهادة' });
        }
        res.json({ message: 'تمت الإضافة بنجاح' });
    });
};

exports.updateCertificate = (req, res) => {
    const { title, issuer, year, link, language } = req.body;
    const newImage = req.file ? req.file.path : null; // New image path if uploaded
    const certificateId = req.params.id;

    if (!title || !issuer) { // Title and issuer are required
        // If a new image was uploaded but validation fails, delete it.
        if (newImage && fs.existsSync(newImage)) {
            fs.unlinkSync(newImage);
        }
        return res.status(400).json({ error: 'يرجى ملء جميع الحقول المطلوبة (العنوان والجهة المانحة).' });
    }

    // First, get the old certificate data to find the old image path
    Certificate.getById(certificateId, (err, oldCert) => {
        if (err) {
            console.error('Error fetching old certificate for update:', err);
            // If a new image was uploaded and there's an error fetching old cert, delete new image.
            if (newImage && fs.existsSync(newImage)) {
                fs.unlinkSync(newImage);
            }
            return res.status(500).json({ error: 'خطأ داخلي في الخادم عند جلب الشهادة القديمة.' });
        }
        if (!oldCert || oldCert.length === 0) {
            // If the certificate doesn't exist, and a new image was uploaded, delete it.
            if (newImage && fs.existsSync(newImage)) {
                fs.unlinkSync(newImage);
            }
            return res.status(404).json({ error: 'الشهادة غير موجودة.' });
        }

        const oldImagePath = oldCert[0].image; // Assuming oldCert is an array of one object

        const certificateData = {
            title,
            issuer,
            year: year ? parseInt(year) : null,
            link: link || null,
            language: language || 'ar',
            image: newImage || oldImagePath // Use new image if uploaded, otherwise keep old
        };

        Certificate.update(certificateId, certificateData, (err) => {
            if (err) {
                console.error('Error in updateCertificate:', err);
                // If DB update fails, delete the newly uploaded file if it exists
                if (newImage && fs.existsSync(newImage)) {
                    fs.unlinkSync(newImage);
                }
                return res.status(500).json({ error: 'فشل تحديث الشهادة' });
            }
            // If new image was uploaded successfully, delete the old one (if it was different)
            if (newImage && oldImagePath && newImage !== oldImagePath && fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            res.json({ message: 'تم التحديث بنجاح' });
        });
    });
};

exports.deleteCertificate = (req, res) => {
    const certificateId = req.params.id;

    // First, get the certificate data to find the image path to delete the file
    Certificate.getById(certificateId, (err, cert) => {
        if (err) {
            console.error('Error fetching certificate for deletion:', err);
            return res.status(500).json({ error: 'خطأ داخلي في الخادم عند جلب الشهادة للحذف.' });
        }
        if (!cert || cert.length === 0) {
            return res.status(404).json({ error: 'الشهادة غير موجودة.' });
        }

        const imagePath = cert[0].image;

        Certificate.delete(certificateId, (err) => {
            if (err) {
                console.error('Error in deleteCertificate:', err);
                return res.status(500).json({ error: 'فشل حذف الشهادة' });
            }
            // If DB record is deleted, also delete the corresponding file
            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            res.json({ message: 'تم الحذف بنجاح' });
        });
    });
};