const db = require('../config/db');

const CompanyIntro = {
    get: (lang, callback) => {
        const query = 'SELECT id, title, description, images, language FROM company_intro WHERE language = $1';
        db.query(query, [lang], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            const result = results.rows[0];
            if (result) {
                try {
                    result.description = result.description ? JSON.parse(result.description) : [];
                } catch (e) {
                    console.error(`خطأ في تحليل وصف اللغة ${lang}:`, e);
                    result.description = [];
                }
                try {
                    result.images = result.images ? JSON.parse(result.images) : [];
                } catch (e) {
                    console.error(`خطأ في تحليل صور اللغة ${lang}:`, e);
                    result.images = [];
                }
            }
            callback(null, result);
        });
    },

    updateContent: (title, descriptionJson, language, callback) => {
        const checkQuery = 'SELECT id FROM company_intro WHERE language = $1';
        db.query(checkQuery, [language], (err, results) => {
            if (err) return callback(err);

            if (results.rows.length > 0) {
                const updateQuery = 'UPDATE company_intro SET title = $1, description = $2 WHERE language = $3';
                db.query(updateQuery, [title, descriptionJson, language], callback);
            } else {
                const insertQuery = 'INSERT INTO company_intro (title, description, language, images) VALUES ($1, $2, $3, $4)';
                db.query(insertQuery, [title, descriptionJson, language, '[]'], callback);
            }
        });
    },

    addImage: (imagePath, language, callback) => {
        const getQuery = 'SELECT images FROM company_intro WHERE language = $1';
        db.query(getQuery, [language], (err, results) => {
            if (err) return callback(err);
            const currentImages = results.rows[0] && results.rows[0].images ? JSON.parse(results.rows[0].images) : [];
            currentImages.push(imagePath);
            const updatedImagesJson = JSON.stringify(currentImages);
            const updateQuery = 'UPDATE company_intro SET images = $1 WHERE language = $2';
            db.query(updateQuery, [updatedImagesJson, language], callback);
        });
    },

    deleteImage: (imageIndex, language, callback) => {
        const getQuery = 'SELECT images FROM company_intro WHERE language = $1';
        db.query(getQuery, [language], (err, results) => {
            if (err) return callback(err);
            if (!results.rows[0] || !results.rows[0].images) {
                return callback(new Error('لا توجد صور لهذه اللغة.'));
            }

            let currentImages;
            try {
                currentImages = JSON.parse(results.rows[0].images);
            } catch (e) {
                return callback(new Error('خطأ في تحليل بيانات الصور.'));
            }

            if (imageIndex < 0 || imageIndex >= currentImages.length) {
                return callback(new Error('فهرس الصورة غير صالح.'));
            }

            const deletedImageUrl = currentImages[imageIndex];
            currentImages.splice(imageIndex, 1);
            const updatedImagesJson = JSON.stringify(currentImages);

            const updateQuery = 'UPDATE company_intro SET images = $1 WHERE language = $2';
            db.query(updateQuery, [updatedImagesJson, language], (err, result) => {
                if (err) return callback(err);
                callback(null, deletedImageUrl);
            });
        });
    }
};

module.exports = CompanyIntro;
