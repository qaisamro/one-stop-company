const db = require('../config/db');

const Contact = {
  getAll: (cb) => {
    db.query('SELECT * FROM contacts ORDER BY created_at DESC', cb);
  },

  create: (data, cb) => {
    db.query(
      'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
      [data.name, data.email, data.message],
      cb
    );
  }
};

module.exports = Contact;