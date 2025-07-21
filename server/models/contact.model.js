// C:\Users\Lenovo\one-stop-company\server\models\contact.model.js
const db = require('../config/db'); // افترض أن هذا هو اتصال PostgreSQL الخاص بك (باستخدام مكتبة 'pg')

const Contact = {
  getAll: (cb) => {
    db.query('SELECT id, name, email, message, created_at FROM contacts ORDER BY created_at DESC', (err, results) => {
        if (err) return cb(err, null);
        // في PostgreSQL (مع مكتبة pg)، النتائج تكون في results.rows
        cb(null, results.rows);
    });
  },

  create: (data, cb) => {
    db.query(
      'INSERT INTO contacts (name, email, message, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id, name, email, message, created_at', // RETURNING للحصول على البيانات بعد الإدخال
      [data.name, data.email, data.message],
      (err, result) => {
            if (err) return cb(err, null);
            // في PostgreSQL، الـ ID الجديد والبيانات المرتجعة تكون في result.rows[0]
            cb(null, result.rows[0]);
        }
    );
  }
};

module.exports = Contact;