const db = require('../config/db');

const Service = {
  getAll: (lang, cb) => {
    db.query('SELECT * FROM services WHERE language = ?', [lang], cb);
  },

  create: (data, cb) => {
    db.query('INSERT INTO services (title, description, icon, language) VALUES (?, ?, ?, ?)', 
    [data.title, data.description, data.icon, data.language], cb);
  },

  update: (id, data, cb) => {
    db.query('UPDATE services SET title = ?, description = ?, icon = ?, language = ? WHERE id = ?', 
    [data.title, data.description, data.icon, data.language, id], cb);
  },

  delete: (id, cb) => {
    db.query('DELETE FROM services WHERE id = ?', [id], cb);
  }
};

module.exports = Service;
