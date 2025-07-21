// C:\Users\Lenovo\one-stop-company\server\models\features.model.js

const db = require('../config/db'); // افترض أن هذا هو اتصال PostgreSQL الخاص بك (باستخدام مكتبة 'pg')

const Features = {
  getSection: (lang, cb) => {
    // نفترض أن الأعمدة المترجمة هي title_ar, title_en, subtitle_ar, subtitle_en, إلخ.
    // يجب أن تكون بنية الجدول في PostgreSQL كالتالي:
    // features_sections (id SERIAL PRIMARY KEY, title_ar TEXT, title_en TEXT, subtitle_ar TEXT, subtitle_en TEXT, ...)
    // هنا، سنختار الأعمدة الديناميكية بناءً على اللغة لتبسيط العملية في المتحكم.
    db.query(`
        SELECT
            id,
            CASE WHEN language = $1 THEN title_ar ELSE title_en END AS title,
            CASE WHEN language = $1 THEN subtitle_ar ELSE subtitle_en END AS subtitle,
            CASE WHEN language = $1 THEN description_ar ELSE description_en END AS description,
            CASE WHEN language = $1 THEN tab1_title_ar ELSE tab1_title_en END AS tab1_title,
            CASE WHEN language = $1 THEN tab2_title_ar ELSE tab2_title_en END AS tab2_title,
            CASE WHEN language = $1 THEN tab3_title_ar ELSE tab3_title_en END AS tab3_title,
            CASE WHEN language = $1 THEN tab4_title_ar ELSE tab4_title_en END AS tab4_title,
            CASE WHEN language = $1 THEN button_text_ar ELSE button_text_en END AS button_text,
            button_url,
            image_url,
            language,
            created_at,
            updated_at
        FROM features_sections
        WHERE language = $1
        LIMIT 1
    `, [lang], (err, results) => {
      if (err) {
        console.error("DB Error in getSection:", err);
        return cb(err, null);
      }
      cb(null, results.rows); // PostgreSQL returns results in .rows
    });
  },
  getItems: (section_id, cb) => {
    // نفترض أن الأعمدة المترجمة هي text_ar, text_en
    // يجب أن تكون بنية الجدول في PostgreSQL كالتالي:
    // features_items (id SERIAL PRIMARY KEY, section_id INTEGER, text_ar TEXT, text_en TEXT, icon TEXT, tab_index INTEGER, ...)
    db.query(`
        SELECT
            id,
            section_id,
            CASE WHEN sections.language = items.language THEN items.text_ar ELSE items.text_en END AS text, -- أو يمكنك تحديد اللغة بالـ $2
            icon,
            tab_index,
            items.created_at,
            items.updated_at
        FROM features_items items
        JOIN features_sections sections ON items.section_id = sections.id
        WHERE items.section_id = $1
        ORDER BY id ASC
    `, [section_id], (err, results) => {
      if (err) {
        console.error("DB Error in getItems:", err);
        return cb(err, null);
      }
      cb(null, results.rows); // PostgreSQL returns results in .rows
    });
  },
  createSection: (data, cb) => {
    // تحديد الأعمدة الصحيحة بناءً على اللغة
    const titleCol = `title_${data.language}`;
    const subtitleCol = `subtitle_${data.language}`;
    const descriptionCol = `description_${data.language}`;
    const tab1TitleCol = `tab1_title_${data.language}`;
    const tab2TitleCol = `tab2_title_${data.language}`;
    const tab3TitleCol = `tab3_title_${data.language}`;
    const tab4TitleCol = `tab4_title_${data.language}`;
    const buttonTextCol = `button_text_${data.language}`;

    db.query(
      `INSERT INTO features_sections (
            ${titleCol}, ${subtitleCol}, ${descriptionCol},
            ${tab1TitleCol}, ${tab2TitleCol}, ${tab3TitleCol}, ${tab4TitleCol},
            ${buttonTextCol}, button_url, image_url, language, created_at, updated_at
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING id`, // RETURNING id للحصول على الـ ID الجديد
      [
        data.title, data.subtitle, data.description,
        data.tab1_title, data.tab2_title, data.tab3_title, data.tab4_title,
        data.button_text, data.button_url, data.image_url, data.language
      ],
      (err, result) => {
        if (err) {
          console.error("DB Error in createSection:", err);
          return cb(err, null);
        }
        cb(null, result.rows[0]); // PostgreSQL returns inserted row in .rows[0]
      }
    );
  },
  updateSection: (id, data, cb) => {
    // تحديد الأعمدة الصحيحة بناءً على اللغة
    const titleCol = `title_${data.language}`;
    const subtitleCol = `subtitle_${data.language}`;
    const descriptionCol = `description_${data.language}`;
    const tab1TitleCol = `tab1_title_${data.language}`;
    const tab2TitleCol = `tab2_title_${data.language}`;
    const tab3TitleCol = `tab3_title_${data.language}`;
    const tab4TitleCol = `tab4_title_${data.language}`;
    const buttonTextCol = `button_text_${data.language}`;

    db.query(
      `UPDATE features_sections SET
            ${titleCol} = $1, ${subtitleCol} = $2, ${descriptionCol} = $3,
            ${tab1TitleCol} = $4, ${tab2TitleCol} = $5, ${tab3TitleCol} = $6, ${tab4TitleCol} = $7,
            ${buttonTextCol} = $8, button_url = $9, image_url = $10, updated_at = CURRENT_TIMESTAMP
        WHERE id = $11`,
      [
        data.title, data.subtitle, data.description,
        data.tab1_title, data.tab2_title, data.tab3_title, data.tab4_title,
        data.button_text, data.button_url, data.image_url, id
      ],
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
    db.query('DELETE FROM features_sections WHERE id = $1', [id], (err, result) => {
      if (err) {
        console.error("DB Error in deleteSection:", err);
        return cb(err, null);
      }
      cb(null, result);
    });
  },

  createItem: (section_id, text, icon, tab_index, language, cb) => { // إضافة language كـ parameter
    const textCol = `text_${language}`; // تحديد العمود بناءً على اللغة
    db.query(`INSERT INTO features_items (section_id, ${textCol}, icon, tab_index, language, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id`,
        [section_id, text, icon, tab_index, language], // تمرير language كـ parameter جديد
        (err, result) => {
      if (err) {
        console.error("DB Error in createItem:", err);
        return cb(err, null);
      }
      cb(null, result.rows[0]); // PostgreSQL returns inserted row in .rows[0]
    });
  },
  deleteItem: (id, cb) => {
    db.query('DELETE FROM features_items WHERE id = $1', [id], (err, result) => {
      if (err) {
        console.error("DB Error in deleteItem:", err);
        return cb(err, null);
      }
      cb(null, result);
    });
  }
};

module.exports = Features;