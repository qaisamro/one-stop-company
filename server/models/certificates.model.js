// C:\Users\Lenovo\one-stop-company\server\models\certificates.model.js
const db = require('../config/db'); // افترض أن هذا هو اتصال PostgreSQL الخاص بك

const Certificate = {
    getAll: (lang, cb) => {
        db.query('SELECT id, title_ar, title_en, image, issuer, year, link, language, created_at, updated_at FROM certificates WHERE language = $1', [lang], (err, results) => {
            if (err) return cb(err, null);
            // في PostgreSQL (مع مكتبة pg)، النتائج تكون في results.rows
            cb(null, results.rows);
        });
    },
    getById: (id, cb) => {
        db.query('SELECT id, title_ar, title_en, image, issuer, year, link, language, created_at, updated_at FROM certificates WHERE id = $1', [id], (err, results) => {
            if (err) return cb(err, null);
            // قد تحتاج إلى results.rows[0] إذا كنت تتوقع نتيجة واحدة
            cb(null, results.rows);
        });
    },
    create: (data, cb) => {
        // تحديد أسماء الأعمدة الديناميكية بناءً على اللغة
        const titleColumn = `title_${data.language || 'ar'}`;
        db.query(
            `INSERT INTO certificates (${titleColumn}, image, issuer, year, link, language, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, ${titleColumn} AS title, image, issuer, year, link, language`, // RETURNING للحصول على البيانات بعد الإدخال
            [data.title, data.image, data.issuer, data.year, data.link, data.language || 'ar'],
            (err, result) => {
                if (err) return cb(err, null);
                // في PostgreSQL، الـ ID الجديد يكون في result.rows[0].id
                cb(null, result.rows[0]);
            }
        );
    },
    update: (id, data, cb) => {
        // تحديد اسم العمود الديناميكي بناءً على اللغة
        const titleColumn = `title_${data.language || 'ar'}`;
        db.query(
            `UPDATE certificates SET ${titleColumn} = $1, image = $2, issuer = $3, year = $4, link = $5, language = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7`,
            [data.title, data.image, data.issuer, data.year, data.link, data.language || 'ar', id],
            cb
        );
    },
    delete: (id, cb) => {
        db.query('DELETE FROM certificates WHERE id = $1', [id], cb);
    }
};

module.exports = Certificate;