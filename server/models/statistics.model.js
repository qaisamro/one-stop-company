const db = require('../config/db');

const Statistic = {
  getAll: (lang, cb) => {
    db.query('SELECT * FROM statistics WHERE language = ?', [lang], cb);
  },
  create: (data, cb) => {
    db.query(
      'INSERT INTO statistics (label, value, icon, language) VALUES (?, ?, ?, ?)',
      [data.label, data.value, data.icon || '', data.language],
      cb
    );
  },
  update: (id, data, cb) => {
    db.query(
      'UPDATE statistics SET label = ?, value = ?, icon = ?, language = ? WHERE id = ?',
      [data.label, data.value, data.icon || '', data.language, id],
      cb
    );
  },
  delete: (id, cb) => {
    db.query('DELETE FROM statistics WHERE id = ?', [id], cb);
  },
};

module.exports = Statistic;