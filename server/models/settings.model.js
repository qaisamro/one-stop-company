// models/settings.model.js (جديد)
const db = require('../config/db');

const Setting = {
    getSetting: (key, cb) => {
        db.query('SELECT value FROM settings WHERE key_name = ?', [key], (err, results) => {
            if (err) return cb(err);
            cb(null, results.length > 0 ? results[0].value : null);
        });
    },
    updateSetting: (key, value, cb) => {
        db.query('UPDATE settings SET value = ? WHERE key_name = ?', [value, key], (err, results) => {
            if (err) return cb(err);
            if (results.affectedRows === 0) {
                // If setting doesn't exist, insert it
                db.query('INSERT INTO settings (key_name, value) VALUES (?, ?)', [key, value], (err, insertResults) => {
                    if (err) return cb(err);
                    cb(null, insertResults);
                });
            } else {
                cb(null, results);
            }
        });
    }
};

module.exports = Setting;

