const db = require('../config/db');

const Header = {
  get: (lang, cb) => {
    db.query('SELECT id, label, href, isSection, content FROM header_links WHERE language = ?', [lang], (err, results) => {
      if (err) return cb(err);
      cb(null, results);
    });
  },
  add: ({ label, href, language, isSection, content }, cb) => {
    db.query(
      'INSERT INTO header_links (label, href, language, isSection, content) VALUES (?, ?, ?, ?, ?)',
      [label, href, language, isSection, content],
      cb
    );
  },
  update: (id, { label, href, language, isSection, content }, cb) => {
    db.query(
      'UPDATE header_links SET label = ?, href = ?, language = ?, isSection = ?, content = ? WHERE id = ?',
      [label, href, language, isSection, content, id],
      cb
    );
  },
  delete: (id, cb) => {
    db.query('DELETE FROM header_links WHERE id = ?', [id], cb);
  },
};

module.exports = Header;