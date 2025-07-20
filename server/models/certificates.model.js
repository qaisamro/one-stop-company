const db = require('../config/db');

const Certificate = {
    getAll: (lang, cb) => {
        db.query('SELECT * FROM certificates WHERE language = ?', [lang], cb);
    },
    getById: (id, cb) => {
        db.query('SELECT * FROM certificates WHERE id = ?', [id], cb);
    },
    create: (data, cb) => {
        db.query(
            'INSERT INTO certificates (title, image, issuer, year, link, language) VALUES (?, ?, ?, ?, ?, ?)',
            [data.title, data.image, data.issuer, data.year, data.link, data.language || 'ar'],
            cb
        );
    },
    update: (id, data, cb) => {
        db.query(
            'UPDATE certificates SET title = ?, image = ?, issuer = ?, year = ?, link = ?, language = ? WHERE id = ?',
            [data.title, data.image, data.issuer, data.year, data.link, data.language || 'ar', id],
            cb
        );
    },
    delete: (id, cb) => {
        db.query('DELETE FROM certificates WHERE id = ?', [id], cb);
    }
};

module.exports = Certificate;