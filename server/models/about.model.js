const db = require('../config/db');
const format = require('pg-format'); // تأكد أنك ثبتت هذه الحزمة: npm install pg-format

const About = {
  getByLanguage: (lang, callback) => {
    db.query(
      'SELECT id, language, title_small, title_main, description, image_url, experience_year, experience_text, button_text, button_url FROM about_us WHERE language = $1',
      [lang],
      (err, aboutResult) => {
        if (err) return callback(err, null);
        if (aboutResult.rows.length === 0) return callback(null, null);

        const aboutData = aboutResult.rows[0];

        db.query(
          'SELECT id, block_title, block_description, order_index FROM about_blocks WHERE about_id = $1 ORDER BY order_index',
          [aboutData.id],
          (err, blocksResult) => {
            if (err) return callback(err, null);

            db.query(
              'SELECT id, title, description, order_index FROM about_features WHERE about_id = $1 ORDER BY order_index',
              [aboutData.id],
              (err, featuresResult) => {
                if (err) return callback(err, null);

                aboutData.blocks = blocksResult.rows;
                aboutData.features = featuresResult.rows;
                callback(null, aboutData);
              }
            );
          }
        );
      }
    );
  },

  getDetailsByLanguage: (lang, callback) => {
    db.query(
      'SELECT id, content FROM about_details WHERE language = $1',
      [lang],
      (err, detailsResult) => {
        if (err) return callback(err, null);
        if (detailsResult.rows.length === 0) return callback(null, { content: '', features: [] });

        const detailsData = detailsResult.rows[0];

        db.query(
          'SELECT id, title, description, order_index FROM about_features WHERE about_id = $1 ORDER BY order_index',
          [detailsData.id],
          (err, featuresResult) => {
            if (err) return callback(err, null);
            detailsData.features = featuresResult.rows;
            callback(null, detailsData);
          }
        );
      }
    );
  },

  updateByLanguage: (lang, data, callback) => {
    const {
      title_small, title_main, description, image_url,
      experience_year, experience_text, button_text, button_url,
      blocks, features
    } = data;

    db.query('BEGIN', (err) => {
      if (err) return callback(err);

      db.query(
        `UPDATE about_us SET
          title_small = $1, title_main = $2, description = $3, image_url = $4,
          experience_year = $5, experience_text = $6, button_text = $7, button_url = $8
         WHERE language = $9`,
        [title_small, title_main, description, image_url, experience_year, experience_text, button_text, button_url, lang],
        (err) => {
          if (err) return db.query('ROLLBACK', () => callback(err));

          db.query('SELECT id FROM about_us WHERE language = $1', [lang], (err, result) => {
            if (err) return db.query('ROLLBACK', () => callback(err));

            const about_id = result.rows[0].id;

            db.query('DELETE FROM about_blocks WHERE about_id = $1', [about_id], (err) => {
              if (err) return db.query('ROLLBACK', () => callback(err));

              db.query('DELETE FROM about_features WHERE about_id = $1', [about_id], (err) => {
                if (err) return db.query('ROLLBACK', () => callback(err));

                const blockValues = blocks?.map((b, i) => [about_id, lang, b.block_title, b.block_description, i]) || [];
                const featureValues = features?.map((f, i) => [about_id, lang, f.title, f.description, i]) || [];

                const queries = [];

                if (blockValues.length > 0) {
                  const insertBlocksSQL = format(
                    'INSERT INTO about_blocks (about_id, language, block_title, block_description, order_index) VALUES %L',
                    blockValues
                  );
                  queries.push(db.query(insertBlocksSQL));
                }

                if (featureValues.length > 0) {
                  const insertFeaturesSQL = format(
                    'INSERT INTO about_features (about_id, language, title, description, order_index) VALUES %L',
                    featureValues
                  );
                  queries.push(db.query(insertFeaturesSQL));
                }

                Promise.all(queries)
                  .then(() => {
                    db.query('COMMIT', (err) => {
                      if (err) return db.query('ROLLBACK', () => callback(err));
                      callback(null, { message: 'تم التحديث بنجاح ✅' });
                    });
                  })
                  .catch((err) => db.query('ROLLBACK', () => callback(err)));
              });
            });
          });
        }
      );
    });
  },

  insertNew: (lang, data, callback) => {
    const {
      title_small, title_main, description, image_url,
      experience_year, experience_text, button_text, button_url,
      blocks, features
    } = data;

    db.query('BEGIN', (err) => {
      if (err) return callback(err);

      db.query(
        `INSERT INTO about_us (language, title_small, title_main, description, image_url, experience_year, experience_text, button_text, button_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [lang, title_small, title_main, description, image_url, experience_year, experience_text, button_text, button_url],
        (err, result) => {
          if (err) return db.query('ROLLBACK', () => callback(err));

          const about_id = result.rows[0].id;

          const blockValues = blocks?.map((b, i) => [about_id, lang, b.block_title, b.block_description, i]) || [];
          const featureValues = features?.map((f, i) => [about_id, lang, f.title, f.description, i]) || [];

          const queries = [];

          if (blockValues.length > 0) {
            const insertBlocksSQL = format(
              'INSERT INTO about_blocks (about_id, language, block_title, block_description, order_index) VALUES %L',
              blockValues
            );
            queries.push(db.query(insertBlocksSQL));
          }

          if (featureValues.length > 0) {
            const insertFeaturesSQL = format(
              'INSERT INTO about_features (about_id, language, title, description, order_index) VALUES %L',
              featureValues
            );
            queries.push(db.query(insertFeaturesSQL));
          }

          Promise.all(queries)
            .then(() => {
              db.query('COMMIT', (err) => {
                if (err) return db.query('ROLLBACK', () => callback(err));
                callback(null, { message: 'تمت الإضافة بنجاح ✅' });
              });
            })
            .catch((err) => db.query('ROLLBACK', () => callback(err)));
        }
      );
    });
  }
};

module.exports = About;
