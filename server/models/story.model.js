const db = require('../config/db'); // افترض أن db هو كائن عميل pg

exports.getStory = (lang, callback) => {
    const query = `
        SELECT id, language, title, content, image_url, created_at
        FROM story
        WHERE language = $1
        ORDER BY id DESC
        LIMIT 1
    `;
    db.query(query, [lang], (err, result) => {
        if (err) return callback(err, null);
        // النتيجة في result.rows
        callback(null, result.rows[0] || null);
    });
};

exports.updateStory = (id, data, callback) => {
    const query = `
        UPDATE story
        SET title = $1, content = $2, image_url = $3, language = $4
        WHERE id = $5
        RETURNING *
    `;
    const values = [data.title, data.content, data.image_url, data.language, id];

    db.query(query, values, (err, result) => {
        if (err) return callback(err);
        if (result.rowCount === 0) return callback(new Error('Story not found'));
        callback(null, result.rows[0]);
    });
};

exports.createStory = (data, callback) => {
    const query = `
        INSERT INTO story (language, title, content, image_url)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const values = [data.language, data.title, data.content, data.image_url];

    db.query(query, values, (err, result) => {
        if (err) return callback(err);
        callback(null, result.rows[0]);
    });
};
