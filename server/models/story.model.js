// C:\Users\Lenovo\one-stop-company\server\models\story.model.js
const db = require('../config/db'); // افترض أن هذا هو اتصال PostgreSQL الخاص بك (باستخدام مكتبة 'pg')

exports.getStory = (lang, callback) => {
    db.query(
        `SELECT
            id,
            language,
            CASE WHEN $1 = 'ar' THEN title_ar ELSE title_en END AS title,
            CASE WHEN $1 = 'ar' THEN content_ar ELSE content_en END AS content,
            image_url,
            created_at
        FROM story
        WHERE language = $1
        ORDER BY id DESC
        LIMIT 1`,
        [lang],
        (err, results) => { // PostgreSQL returns results in 'results.rows'
            if (err) return callback(err, null);
            callback(null, results.rows); // Pass results.rows
        }
    );
};

exports.updateStory = (id, data, callback) => {
    // تحديد الأعمدة الصحيحة بناءً على اللغة
    const titleCol = `title_${data.language}`;
    const contentCol = `content_${data.language}`;

    db.query(
        `UPDATE story
        SET
            ${titleCol} = $1,
            ${contentCol} = $2,
            image_url = $3,
            language = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5`,
        [data.title, data.content, data.image_url, data.language, id],
        (err, result) => {
            if (err) return callback(err);
            if (result.rowCount === 0) return callback(new Error('Story not found')); // Use rowCount for PostgreSQL
            callback(null, result);
        }
    );
};

exports.createStory = (data, callback) => {
    // تحديد الأعمدة الصحيحة بناءً على اللغة
    const titleCol = `title_${data.language}`;
    const contentCol = `content_${data.language}`;

    db.query(
        `INSERT INTO story (
            language,
            ${titleCol},
            ${contentCol},
            image_url,
            created_at,
            updated_at
        ) VALUES (
            $1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING id, language, ${titleCol} AS title, ${contentCol} AS content, image_url`, // Use RETURNING
        [data.language, data.title, data.content, data.image_url],
        (err, result) => {
            if (err) return callback(err);
            callback(null, result.rows[0]); // PostgreSQL returns inserted row in .rows[0]
        }
    );
};