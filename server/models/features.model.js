// C:\Users\Lenovo\one-stop-company\server\models\features.model.js

const db = require('../config/db');

const Features = {
  getSection: (lang, cb) => {
    db.query('SELECT * FROM features_sections WHERE language = ? LIMIT 1', [lang], (err, results) => {
      if (err) {
        console.error("DB Error in getSection:", err);
        return cb(err, null);
      }
      cb(null, results);
    });
  },
  getItems: (section_id, cb) => {
    // ستظل تجلب كل العناصر مع عمود tab_index الجديد
    db.query('SELECT * FROM features_items WHERE section_id = ? ORDER BY id ASC', [section_id], (err, results) => {
      if (err) {
        console.error("DB Error in getItems:", err);
        return cb(err, null);
      }
      cb(null, results);
    });
  },
  createSection: (data, cb) => {
    db.query(
      'INSERT INTO features_sections (title, subtitle, description, tab1_title, tab2_title, tab3_title, tab4_title, button_text, button_url, image_url, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [data.title, data.subtitle, data.description, data.tab1_title, data.tab2_title, data.tab3_title, data.tab4_title, data.button_text, data.button_url, data.image_url, data.language],
      (err, result) => {
        if (err) {
          console.error("DB Error in createSection:", err);
          return cb(err, null);
        }
        cb(null, result);
      }
    );
  },
  updateSection: (id, data, cb) => {
    db.query(
      'UPDATE features_sections SET title = ?, subtitle = ?, description = ?, tab1_title = ?, tab2_title = ?, tab3_title = ?, tab4_title = ?, button_text = ?, button_url = ?, image_url = ?, language = ? WHERE id = ?',
      [data.title, data.subtitle, data.description, data.tab1_title, data.tab2_title, data.tab3_title, data.tab4_title, data.button_text, data.button_url, data.image_url, data.language, id],
      (err, result) => {
        if (err) {
          console.error("DB Error in updateSection:", err);
          return cb(err, null);
        }
        cb(null, result);
      }
    );
  },
  deleteSection: (id, cb) => {
    db.query('DELETE FROM features_sections WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error("DB Error in deleteSection:", err);
        return cb(err, null);
      }
      cb(null, result);
    });
  },

  createItem: (section_id, text, icon, tab_index, cb) => { // <--- إضافة tab_index
    db.query('INSERT INTO features_items (section_id, text, icon, tab_index) VALUES (?, ?, ?, ?)', [section_id, text, icon, tab_index], (err, result) => { // <--- إضافة tab_index للـ query
      if (err) {
        console.error("DB Error in createItem:", err);
        return cb(err, null);
      }
      cb(null, result);
    });
  },
  deleteItem: (id, cb) => {
    db.query('DELETE FROM features_items WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error("DB Error in deleteItem:", err);
        return cb(err, null);
      }
      cb(null, result);
    });
  }
};

module.exports = Features;