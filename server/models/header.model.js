// C:\Users\Lenovo\one-stop-company\server\models\header.model.js
const db = require('../config/db'); // افترض أن هذا هو اتصال PostgreSQL الخاص بك (باستخدام مكتبة 'pg')

const Header = {
  get: (lang, cb) => {
    // افترض أن لديك أعمدة للغة مثل label_ar, label_en, content_ar, content_en
    // إذا كان لديك عمود واحد فقط 'label' و 'content' يعتمد على 'language' في الصف،
    // فسيظل الاستعلام كما هو مع تغيير علامة الاستفهام.
    // الأفضل للترجمة هو استخدام أعمدة متعددة أو جدول ترجمة منفصل.
    // سأفترض وجود أعمدة label_ar, label_en, content_ar, content_en لمرونة أكبر.
    db.query(`
        SELECT
            id,
            CASE WHEN $1 = 'ar' THEN label_ar ELSE label_en END AS label,
            href,
            isSection,
            CASE WHEN $1 = 'ar' THEN content_ar ELSE content_en END AS content,
            language,
            created_at,
            updated_at
        FROM header_links
        WHERE language = $1
    `, [lang], (err, results) => {
      if (err) return cb(err);
      cb(null, results.rows); // PostgreSQL returns results in .rows
    });
  },
  add: ({ label, href, language, isSection, content }, cb) => {
    // تحديد الأعمدة الصحيحة بناءً على اللغة
    const labelCol = `label_${language}`;
    const contentCol = `content_${language}`;

    db.query(
      `INSERT INTO header_links (${labelCol}, href, language, isSection, ${contentCol}, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, ${labelCol} AS label, href, language, isSection, ${contentCol} AS content`,
      [label, href, language, isSection, content],
      (err, result) => {
            if (err) return cb(err, null);
            cb(null, result.rows[0]); // PostgreSQL returns inserted row in .rows[0]
        }
    );
  },
  update: (id, { label, href, language, isSection, content }, cb) => {
    // تحديد الأعمدة الصحيحة بناءً على اللغة
    const labelCol = `label_${language}`;
    const contentCol = `content_${language}`;

    db.query(
      `UPDATE header_links SET ${labelCol} = $1, href = $2, language = $3, isSection = $4, ${contentCol} = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6`,
      [label, href, language, isSection, content, id],
      cb
    );
  },
  delete: (id, cb) => {
    db.query('DELETE FROM header_links WHERE id = $1', [id], cb);
  },
};

module.exports = Header;