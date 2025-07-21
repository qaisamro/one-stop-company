// C:\Users\Lenovo\one-stop-company\server\models\team.model.js
const db = require('../config/db'); // افترض أن هذا هو اتصال PostgreSQL الخاص بك (باستخدام مكتبة 'pg')

const Team = {
  getAll: (lang, cb) => {
    // Join team with team_socials to get all social links for each member
    const query = `
      SELECT
        t.id,
        CASE WHEN $1 = 'ar' THEN t.name_ar ELSE t.name_en END AS name,
        CASE WHEN $1 = 'ar' THEN t.position_ar ELSE t.position_en END AS position,
        t.photo,
        t.language,
        t.created_at,
        t.updated_at,
        STRING_AGG(ts.social_url, '|||') AS social_urls,
        STRING_AGG(ts.platform, '|||') AS platforms
      FROM team t
      LEFT JOIN team_socials ts ON t.id = ts.team_id
      WHERE t.language = $1
      GROUP BY t.id, t.name_ar, t.name_en, t.position_ar, t.position_en, t.photo, t.language, t.created_at, t.updated_at
      ORDER BY t.id;
    `;
    db.query(query, [lang], (err, results) => {
      if (err) return cb(err);

      // Process results to group social links into an array of objects
      const formattedResults = results.rows.map(row => { // Use results.rows for PostgreSQL
        const socialUrls = row.social_urls ? row.social_urls.split('|||') : [];
        const platforms = row.platforms ? row.platforms.split('|||') : [];
        
        const socials = socialUrls.map((url, index) => ({
          url: url,
          platform: platforms[index] || null // Use platform if available, otherwise null
        }));

        return {
          id: row.id,
          name: row.name, // Now directly named from CASE WHEN
          position: row.position, // Now directly named from CASE WHEN
          photo: row.photo,
          language: row.language,
          socials: socials.filter(s => s.url) // Filter out any empty social entries
        };
      });
      cb(null, formattedResults);
    });
  },

  getById: (id, cb) => {
    const query = `
      SELECT
        t.id,
        t.name_ar, t.name_en,
        t.position_ar, t.position_en,
        t.photo,
        t.language,
        t.created_at,
        t.updated_at,
        STRING_AGG(ts.social_url, '|||') AS social_urls,
        STRING_AGG(ts.platform, '|||') AS platforms
      FROM team t
      LEFT JOIN team_socials ts ON t.id = ts.team_id
      WHERE t.id = $1
      GROUP BY t.id, t.name_ar, t.name_en, t.position_ar, t.position_en, t.photo, t.language, t.created_at, t.updated_at;
    `;
    db.query(query, [id], (err, results) => {
      if (err) return cb(err);
      if (results.rows.length === 0) return cb(null, null); // Member not found

      const row = results.rows[0]; // Use results.rows[0] for single row
      const socialUrls = row.social_urls ? row.social_urls.split('|||') : [];
      const platforms = row.platforms ? row.platforms.split('|||') : [];
      
      const socials = socialUrls.map((url, index) => ({
        url: url,
        platform: platforms[index] || null
      }));

      const formattedResult = {
        id: row.id,
        name_ar: row.name_ar, // Keep separate for update logic in controller if needed
        name_en: row.name_en,
        position_ar: row.position_ar,
        position_en: row.position_en,
        photo: row.photo,
        language: row.language,
        socials: socials.filter(s => s.url)
      };
      cb(null, formattedResult);
    });
  },

  create: (data, cb) => {
    const nameCol = `name_${data.language}`;
    const positionCol = `position_${data.language}`;
    db.query(
      `INSERT INTO team (
            ${nameCol},
            ${positionCol},
            photo,
            language,
            created_at,
            updated_at
        ) VALUES (
            $1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING id, ${nameCol} AS name, ${positionCol} AS position, photo, language`, // RETURNING
      [data.name, data.position, data.photo, data.language],
      (err, result) => {
        if (err) return cb(err);
        cb(null, result.rows[0]); // Use result.rows[0] for inserted row
      }
    );
  },

  addSocial: (teamId, socialUrl, platform, cb) => {
    db.query(
      'INSERT INTO team_socials (team_id, social_url, platform) VALUES ($1, $2, $3)',
      [teamId, socialUrl, platform],
      cb
    );
  },

  update: (id, data, cb) => {
    const nameCol = `name_${data.language}`;
    const positionCol = `position_${data.language}`;
    db.query(
      `UPDATE team
        SET
            ${nameCol} = $1,
            ${positionCol} = $2,
            photo = $3,
            language = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5`,
      [data.name, data.position, data.photo, data.language, id],
      cb
    );
  },

  delete: (id, cb) => {
    db.query('DELETE FROM team WHERE id = $1', [id], cb);
  },

  deleteSocialsByTeamId: (teamId, cb) => {
    db.query('DELETE FROM team_socials WHERE team_id = $1', [teamId], cb);
  }
};

module.exports = Team;