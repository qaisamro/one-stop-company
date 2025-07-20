const db = require('../config/db');

const Team = {
  getAll: (lang, cb) => {
    // Join team with team_socials to get all social links for each member
    const query = `
      SELECT
        t.id, t.name, t.position, t.photo, t.language,
        GROUP_CONCAT(ts.social_url SEPARATOR '|||') AS social_urls,
        GROUP_CONCAT(ts.platform SEPARATOR '|||') AS platforms
      FROM team t
      LEFT JOIN team_socials ts ON t.id = ts.team_id
      WHERE t.language = ?
      GROUP BY t.id
      ORDER BY t.id;
    `;
    db.query(query, [lang], (err, results) => {
      if (err) return cb(err);

      // Process results to group social links into an array of objects
      const formattedResults = results.map(row => {
        const socialUrls = row.social_urls ? row.social_urls.split('|||') : [];
        const platforms = row.platforms ? row.platforms.split('|||') : [];
        
        const socials = socialUrls.map((url, index) => ({
          url: url,
          platform: platforms[index] || null // Use platform if available, otherwise null
        }));

        return {
          id: row.id,
          name: row.name,
          position: row.position,
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
        t.id, t.name, t.position, t.photo, t.language,
        GROUP_CONCAT(ts.social_url SEPARATOR '|||') AS social_urls,
        GROUP_CONCAT(ts.platform SEPARATOR '|||') AS platforms
      FROM team t
      LEFT JOIN team_socials ts ON t.id = ts.team_id
      WHERE t.id = ?
      GROUP BY t.id;
    `;
    db.query(query, [id], (err, results) => {
      if (err) return cb(err);
      if (results.length === 0) return cb(null, null); // Member not found

      const row = results[0];
      const socialUrls = row.social_urls ? row.social_urls.split('|||') : [];
      const platforms = row.platforms ? row.platforms.split('|||') : [];
      
      const socials = socialUrls.map((url, index) => ({
        url: url,
        platform: platforms[index] || null
      }));

      const formattedResult = {
        id: row.id,
        name: row.name,
        position: row.position,
        photo: row.photo,
        language: row.language,
        socials: socials.filter(s => s.url)
      };
      cb(null, formattedResult);
    });
  },

  create: (data, cb) => {
    db.query(
      'INSERT INTO team (name, position, photo, language) VALUES (?, ?, ?, ?)',
      [data.name, data.position, data.photo, data.language],
      (err, result) => {
        if (err) return cb(err);
        cb(null, result); // Pass the result to get insertId
      }
    );
  },

  addSocial: (teamId, socialUrl, platform, cb) => {
    db.query(
      'INSERT INTO team_socials (team_id, social_url, platform) VALUES (?, ?, ?)',
      [teamId, socialUrl, platform],
      cb
    );
  },

  update: (id, data, cb) => {
    db.query(
      'UPDATE team SET name = ?, position = ?, photo = ?, language = ? WHERE id = ?',
      [data.name, data.position, data.photo, data.language, id],
      cb
    );
  },

  delete: (id, cb) => {
    db.query('DELETE FROM team WHERE id = ?', [id], cb);
  },

  deleteSocialsByTeamId: (teamId, cb) => {
    db.query('DELETE FROM team_socials WHERE team_id = ?', [teamId], cb);
  }
};

module.exports = Team;
