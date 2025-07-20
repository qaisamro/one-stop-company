const db = require('../config/db');

const About = {
  getByLanguage: (lang, callback) => {
    db.query(
      'SELECT id, language, title_small, title_main, description, image_url, experience_year, experience_text, button_text, button_url FROM about_us WHERE language = ?',
      [lang],
      (err, aboutResult) => {
        if (err) return callback(err, null);

        if (aboutResult.length === 0) {
          return callback(null, null);
        }

        const aboutData = aboutResult[0];

        db.query(
          'SELECT id, block_title, block_description, order_index FROM about_blocks WHERE about_id = ? ORDER BY order_index',
          [aboutData.id],
          (err, blocksResult) => {
            if (err) return callback(err, null);

            db.query(
              'SELECT id, title, description, order_index FROM about_features WHERE about_id = ? ORDER BY order_index',
              [aboutData.id],
              (err, featuresResult) => {
                if (err) return callback(err, null);
                aboutData.blocks = blocksResult;
                aboutData.features = featuresResult;
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
      'SELECT id, content FROM about_details WHERE language = ?',
      [lang],
      (err, detailsResult) => {
        if (err) return callback(err, null);

        if (detailsResult.length === 0) {
          return callback(null, { content: '', features: [] });
        }

        const detailsData = detailsResult[0];

        db.query(
          'SELECT id, title, description, order_index FROM about_features WHERE about_id = ? ORDER BY order_index',
          [detailsData.id],
          (err, featuresResult) => {
            if (err) return callback(err, null);
            detailsData.features = featuresResult;
            callback(null, detailsData);
          }
        );
      }
    );
  },

  updateByLanguage: (lang, data, callback) => {
    const { title_small, title_main, description, image_url, experience_year, experience_text, button_text, button_url, blocks, features } = data;

    db.beginTransaction((err) => {
      if (err) return callback(err);

      db.query(
        'UPDATE about_us SET title_small = ?, title_main = ?, description = ?, image_url = ?, experience_year = ?, experience_text = ?, button_text = ?, button_url = ? WHERE language = ?',
        [title_small, title_main, description, image_url, experience_year, experience_text, button_text, button_url, lang],
        (err, result) => {
          if (err) return db.rollback(() => callback(err));

          db.query('SELECT id FROM about_us WHERE language = ?', [lang], (err, aboutIdResult) => {
            if (err) return db.rollback(() => callback(err));
            const about_id = aboutIdResult[0].id;

            db.query('DELETE FROM about_blocks WHERE about_id = ?', [about_id], (err) => {
              if (err) return db.rollback(() => callback(err));

              db.query('DELETE FROM about_features WHERE about_id = ?', [about_id], (err) => {
                if (err) return db.rollback(() => callback(err));

                if (blocks && blocks.length > 0) {
                  const blockValues = blocks.map((block, index) => [
                    about_id,
                    lang,
                    block.block_title,
                    block.block_description,
                    index,
                  ]);
                  db.query(
                    'INSERT INTO about_blocks (about_id, language, block_title, block_description, order_index) VALUES ?',
                    [blockValues],
                    (err) => {
                      if (err) return db.rollback(() => callback(err));

                      if (features && features.length > 0) {
                        const featureValues = features.map((feature, index) => [
                          about_id,
                          lang,
                          feature.title,
                          feature.description,
                          index,
                        ]);
                        db.query(
                          'INSERT INTO about_features (about_id, language, title, description, order_index) VALUES ?',
                          [featureValues],
                          (err) => {
                            if (err) return db.rollback(() => callback(err));
                            db.commit((err) => {
                              if (err) return db.rollback(() => callback(err));
                              callback(null, { message: 'تم التحديث بنجاح! ✅' });
                            });
                          }
                        );
                      } else {
                        db.commit((err) => {
                          if (err) return db.rollback(() => callback(err));
                          callback(null, { message: 'تم التحديث بنجاح! ✅' });
                        });
                      }
                    }
                  );
                } else {
                  if (features && features.length > 0) {
                    const featureValues = features.map((feature, index) => [
                      about_id,
                      lang,
                      feature.title,
                      feature.description,
                      index,
                    ]);
                    db.query(
                      'INSERT INTO about_features (about_id, language, title, description, order_index) VALUES ?',
                      [featureValues],
                      (err) => {
                        if (err) return db.rollback(() => callback(err));
                        db.commit((err) => {
                          if (err) return db.rollback(() => callback(err));
                          callback(null, { message: 'تم التحديث بنجاح! ✅' });
                        });
                      }
                    );
                  } else {
                    db.commit((err) => {
                      if (err) return db.rollback(() => callback(err));
                      callback(null, { message: 'تم التحديث بنجاح! ✅' });
                    });
                  }
                }
              });
            });
          });
        }
      );
    });
  },

  insertNew: (lang, data, callback) => {
    const { title_small, title_main, description, image_url, experience_year, experience_text, button_text, button_url, blocks, features } = data;

    db.beginTransaction((err) => {
      if (err) return callback(err);

      db.query(
        'INSERT INTO about_us (language, title_small, title_main, description, image_url, experience_year, experience_text, button_text, button_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [lang, title_small, title_main, description, image_url, experience_year, experience_text, button_text, button_url],
        (err, result) => {
          if (err) return db.rollback(() => callback(err));

          const about_id = result.insertId;

          if (blocks && blocks.length > 0) {
            const blockValues = blocks.map((block, index) => [
              about_id,
              lang,
              block.block_title,
              block.block_description,
              index,
            ]);
            db.query(
              'INSERT INTO about_blocks (about_id, language, block_title, block_description, order_index) VALUES ?',
              [blockValues],
              (err) => {
                if (err) return db.rollback(() => callback(err));

                if (features && features.length > 0) {
                  const featureValues = features.map((feature, index) => [
                    about_id,
                    lang,
                    feature.title,
                    feature.description,
                    index,
                  ]);
                  db.query(
                    'INSERT INTO about_features (about_id, language, title, description, order_index) VALUES ?',
                    [featureValues],
                    (err) => {
                      if (err) return db.rollback(() => callback(err));
                      db.commit((err) => {
                        if (err) return db.rollback(() => callback(err));
                        callback(null, { message: 'تمت الإضافة بنجاح! ✅' });
                      });
                    }
                  );
                } else {
                  db.commit((err) => {
                    if (err) return db.rollback(() => callback(err));
                    callback(null, { message: 'تمت الإضافة بنجاح! ✅' });
                  });
                }
              }
            );
          } else {
            if (features && features.length > 0) {
              const featureValues = features.map((feature, index) => [
                about_id,
                lang,
                feature.title,
                feature.description,
                index,
              ]);
              db.query(
                'INSERT INTO about_features (about_id, language, title, description, order_index) VALUES ?',
                [featureValues],
                (err) => {
                  if (err) return db.rollback(() => callback(err));
                  db.commit((err) => {
                    if (err) return db.rollback(() => callback(err));
                    callback(null, { message: 'تمت الإضافة بنجاح! ✅' });
                  });
                }
              );
            } else {
              db.commit((err) => {
                if (err) return db.rollback(() => callback(err));
                callback(null, { message: 'تمت الإضافة بنجاح! ✅' });
              });
            }
          }
        }
      );
    });
  },
};

module.exports = About;