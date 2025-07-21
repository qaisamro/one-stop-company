// C:\Users\Lenovo\one-stop-company\server\models\blogs.model.js
const db = require('../config/db'); // افترض أن هذا هو اتصال PostgreSQL الخاص بك
const path = require('path'); // قد لا يكون ضرورياً في هذا الملف بعد الآن إذا كان التعامل مع المسارات في المتحكم

const Blogs = {
  getAll: (lang, callback) => {
    db.query(
      `SELECT id,
              CASE $1 WHEN 'ar' THEN title_ar ELSE title_en END AS title,
              CASE $2 WHEN 'ar' THEN description_ar ELSE description_en END AS description,
              CASE $3 WHEN 'ar' THEN content_ar ELSE content_en END AS content,
              image, additional_images, date, language, author, category, created_at, updated_at
       FROM blogs WHERE language = $4`,
      [lang, lang, lang, lang], // تمرير الباراميترات بالترتيب الصحيح
      (err, results) => {
        if (err) {
          console.error('Error fetching blogs:', err);
          return callback(err, null);
        }
        // في PostgreSQL (باستخدام pg/pg-promise)، أعمدة jsonb يتم تحليلها تلقائياً
        // لذا، قد لا تحتاج إلى JSON.parse هنا. إذا كان لا يزال نصًا، اتركه.
        const processedResults = results.rows ? results.rows : results; // استخدام .rows لنتائج pg
        // إذا كانت مكتبة قاعدة البيانات لا تقوم بتحليل JSON تلقائيًا
        /*
        processedResults = processedResults.map(blog => ({
          ...blog,
          additional_images: typeof blog.additional_images === 'string' ? JSON.parse(blog.additional_images) : blog.additional_images || []
        }));
        */
        callback(null, processedResults);
      }
    );
  },

  getById: (id, lang, callback) => {
    db.query(
      `SELECT id,
              CASE $1 WHEN 'ar' THEN title_ar ELSE title_en END AS title,
              CASE $2 WHEN 'ar' THEN description_ar ELSE description_en END AS description,
              CASE $3 WHEN 'ar' THEN content_ar ELSE content_en END AS content,
              image, additional_images, date, language, author, category, created_at, updated_at
       FROM blogs WHERE id = $4 AND language = $5`,
      [lang, lang, lang, id, lang], // تمرير الباراميترات بالترتيب الصحيح
      (err, results) => {
        if (err) {
          console.error('Error fetching blog by ID:', err);
          return callback(err, null);
        }
        const processedResults = results.rows ? results.rows : results;
        if (processedResults.length === 0) {
          return callback(null, null);
        }
        const blog = processedResults[0];
        // إذا كانت مكتبة قاعدة البيانات لا تقوم بتحليل JSON تلقائيًا
        /*
        blog.additional_images = typeof blog.additional_images === 'string' ? JSON.parse(blog.additional_images) : blog.additional_images || [];
        */
        callback(null, blog);
      }
    );
  },

  insert: (blogData, callback) => {
    const {
      title, description, content, image, additional_images, date, language, author, category
    } = blogData;
    db.query(
      `INSERT INTO blogs (
        title_${language}, description_${language}, content_${language},
        image, additional_images, date, language, author, category, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id`, // RETURNING id للحصول على الـ ID الجديد
      [
        title,
        description,
        content,
        image,
        JSON.stringify(additional_images || []), // يجب أن يتم تحويله إلى JSON string
        date,
        language,
        author,
        category
      ],
      (err, result) => {
        if (err) {
          console.error('Error inserting blog:', err);
          return callback(err, null);
        }
        // في PostgreSQL، الـ ID الجديد يكون في result.rows[0].id
        callback(null, { message: 'Blog inserted successfully', id: result.rows[0].id });
      }
    );
  },

  update: (id, blogData, callback) => {
    const {
      title, description, content, image, additional_images, date, language, author, category
    } = blogData;
    db.query(
      `UPDATE blogs SET
        title_${language} = $1,
        description_${language} = $2,
        content_${language} = $3,
        image = $4,
        additional_images = $5,
        date = $6,
        author = $7,
        category = $8,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND language = $10`,
      [
        title,
        description,
        content,
        image,
        JSON.stringify(additional_images || []), // يجب أن يتم تحويله إلى JSON string
        date,
        author,
        category,
        id,
        language
      ],
      (err, result) => {
        if (err) {
          console.error('Error updating blog:', err);
          return callback(err, null);
        }
        callback(null, { message: 'Blog updated successfully' });
      }
    );
  },

  delete: (id, callback) => {
    db.query('DELETE FROM blogs WHERE id = $1', [id], (err, result) => {
      if (err) {
        console.error('Error deleting blog:', err);
        return callback(err, null);
      }
      callback(null, { message: 'Blog deleted successfully' });
    });
  }
};

module.exports = Blogs;