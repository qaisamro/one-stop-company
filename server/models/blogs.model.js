const db = require('../config/db');
const path = require('path');

const Blogs = {
  getAll: (lang, callback) => {
    db.query(
      `SELECT id, 
              CASE ? WHEN 'ar' THEN title_ar ELSE title_en END AS title,
              CASE ? WHEN 'ar' THEN description_ar ELSE description_en END AS description,
              CASE ? WHEN 'ar' THEN content_ar ELSE content_en END AS content,
              image, additional_images, date, language, author, category, created_at, updated_at 
       FROM blogs WHERE language = ?`,
      [lang, lang, lang, lang],
      (err, results) => {
        if (err) {
          console.error('Error fetching blogs:', err);
          return callback(err, null);
        }
        // Parse additional_images if stored as JSON string
        results = results.map(blog => ({
          ...blog,
          additional_images: blog.additional_images ? JSON.parse(blog.additional_images) : []
        }));
        callback(null, results);
      }
    );
  },

  getById: (id, lang, callback) => {
    db.query(
      `SELECT id, 
              CASE ? WHEN 'ar' THEN title_ar ELSE title_en END AS title,
              CASE ? WHEN 'ar' THEN description_ar ELSE description_en END AS description,
              CASE ? WHEN 'ar' THEN content_ar ELSE content_en END AS content,
              image, additional_images, date, language, author, category, created_at, updated_at 
       FROM blogs WHERE id = ? AND language = ?`,
      [lang, lang, lang, id, lang],
      (err, results) => {
        if (err) {
          console.error('Error fetching blog by ID:', err);
          return callback(err, null);
        }
        if (results.length === 0) {
          return callback(null, null);
        }
        const blog = results[0];
        blog.additional_images = blog.additional_images ? JSON.parse(blog.additional_images) : [];
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        title,
        description,
        content,
        image,
        JSON.stringify(additional_images || []),
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
        callback(null, { message: 'Blog inserted successfully', id: result.insertId });
      }
    );
  },

  update: (id, blogData, callback) => {
    const {
      title, description, content, image, additional_images, date, language, author, category
    } = blogData;
    db.query(
      `UPDATE blogs SET 
        title_${language} = ?, 
        description_${language} = ?, 
        content_${language} = ?, 
        image = ?, 
        additional_images = ?, 
        date = ?, 
        author = ?, 
        category = ?, 
        updated_at = NOW()
       WHERE id = ? AND language = ?`,
      [
        title,
        description,
        content,
        image,
        JSON.stringify(additional_images || []),
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
    db.query('DELETE FROM blogs WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('Error deleting blog:', err);
        return callback(err, null);
      }
      callback(null, { message: 'Blog deleted successfully' });
    });
  }
};

module.exports = Blogs;