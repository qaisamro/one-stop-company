// C:\Users\Lenovo\one-stop-company\server\models\services.model.js
const db = require('../config/db'); // افترض أن هذا هو اتصال PostgreSQL الخاص بك (باستخدام مكتبة 'pg')

const Service = {
  getAll: (lang, cb) => {
    db.query(`
        SELECT
            id,
            CASE WHEN $1 = 'ar' THEN title_ar ELSE title_en END AS title,
            CASE WHEN $1 = 'ar' THEN description_ar ELSE description_en END AS description,
            icon,
            language,
            created_at,
            updated_at
        FROM services
        WHERE language = $1
    `, [lang], (err, results) => {
      if (err) return cb(err);
      cb(null, results.rows); // PostgreSQL returns results in .rows
    });
  },

  create: (data, cb) => {
    // تحديد الأعمدة الصحيحة بناءً على اللغة
    const titleCol = `title_${data.language}`;
    const descriptionCol = `description_${data.language}`;

    db.query(
      `INSERT INTO services (
            ${titleCol}, ${descriptionCol}, icon, language, created_at, updated_at
        ) VALUES (
            $1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING id, ${titleCol} AS title, ${descriptionCol} AS description, icon, language`, // إضافة RETURNING
      [data.title, data.description, data.icon, data.language],
      (err, result) => {
            if (err) return cb(err);
            cb(null, result.rows[0]); // PostgreSQL returns inserted row in .rows[0]
        }
    );
  },

  update: (id, data, cb) => {
    // تحديد الأعمدة الصحيحة بناءً على اللغة
    const titleCol = `title_${data.language}`; // اللغة مطلوبة في data لتحديد العمود
    const descriptionCol = `description_${data.language}`;

    db.query(
      `UPDATE services
        SET
            ${titleCol} = $1,
            ${descriptionCol} = $2,
            icon = $3,
            language = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5`,
      [data.title, data.description, data.icon, data.language, id],
      cb
    );
  },

  delete: (id, cb) => {
    db.query('DELETE FROM services WHERE id = $1', [id], cb);
  }
};

module.exports = Service;