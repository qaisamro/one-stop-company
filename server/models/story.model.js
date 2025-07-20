const db = require('../config/db');

exports.getStory = (lang, callback) => {
    db.query(
        'SELECT id, language, title, content, image_url, created_at FROM story WHERE language = ? ORDER BY id DESC LIMIT 1',
        [lang],
        (err, result) => {
            if (err) return callback(err, null);
            callback(null, result);
        }
    );
};

exports.updateStory = (id, data, callback) => {
    db.query(
        'UPDATE story SET title = ?, content = ?, image_url = ?, language = ? WHERE id = ?',
        [data.title, data.content, data.image_url, data.language, id],
        (err, result) => {
            if (err) return callback(err);
            if (result.affectedRows === 0) return callback(new Error('Story not found'));
            callback(null, result);
        }
    );
};

exports.createStory = (data, callback) => {
    db.query(
        'INSERT INTO story (language, title, content, image_url) VALUES (?, ?, ?, ?)',
        [data.language, data.title, data.content, data.image_url],
        (err, result) => {
            if (err) return callback(err);
            callback(null, result);
        }
    );
};