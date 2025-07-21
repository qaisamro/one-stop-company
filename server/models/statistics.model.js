// C:\Users\Lenovo\one-stop-company\server\models\statistics.model.js
const db = require('../config/db'); // افترض أن هذا هو اتصال PostgreSQL الخاص بك (باستخدام مكتبة 'pg')

const Statistic = {
  getAll: (lang, cb) => {
    db.query(`
        SELECT
            id,
            CASE WHEN $1 = 'ar' THEN label_ar ELSE label_en END AS label,
            value,
            icon,
            language,
            created_at,
            updated_at
        FROM statistics
        WHERE language = $1
    `, [lang], (err, results) => {
      if (err) return cb(err);
      cb(null, results.rows); // PostgreSQL returns results in .rows
    });
  },
  create: (data, cb) => {
    // تحديد الأعمدة الصحيحة بناءً على اللغة
    const labelCol = `label_${data.language}`;

    db.query(
      `INSERT INTO statistics (
            ${labelCol}, value, icon, language, created_at, updated_at
        ) VALUES (
            $1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING id, ${labelCol} AS label, value, icon, language`, // إضافة RETURNING
      [data.label, data.value, data.icon || '', data.language],
      (err, result) => {
            if (err) return cb(err);
            cb(null, result.rows[0]); // PostgreSQL returns inserted row in .rows[0]
        }
    );
  },
  update: (id, data, cb) => {
    // تحديد الأعمدة الصحيحة بناءً على اللغة
    const labelCol = `label_${data.language}`; // اللغة مطلوبة في data لتحديد العمود

    db.query(
      `UPDATE statistics
        SET
            ${labelCol} = $1,
            value = $2,
            icon = $3,
            language = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5`,
      [data.label, data.value, data.icon || '', data.language, id],
      cb
    );
  },
  delete: (id, cb) => {
    db.query('DELETE FROM statistics WHERE id = $1', [id], cb);
  },
};

module.exports = Statistic;