const db = require('../config/db');

const Project = {
    getAll: (lang, cb) => {
        console.log(`Querying projects for language: ${lang}`);
        db.query(
            'SELECT id, title, extra_title, title_description, description, detailed_description, image, additional_images, url, language, sections FROM projects WHERE language = ?',
            [lang],
            (err, results) => {
                if (err) {
                    console.error('Database error in getAll:', err);
                    return cb(err);
                }
                const projects = results.map(project => {
                    let parsedAdditionalImages = [];
                    let parsedSections = [];

                    try {
                        if (project.additional_images && typeof project.additional_images === 'string' && project.additional_images !== 'NULL' && project.additional_images.trim() !== '') {
                            parsedAdditionalImages = JSON.parse(project.additional_images);
                        }
                    } catch (parseError) {
                        console.error(`Error parsing additional_images for project ID ${project.id}:`, parseError, `Value: ${project.additional_images}`);
                    }

                    try {
                        if (project.sections && typeof project.sections === 'string' && project.sections !== 'NULL' && project.sections.trim() !== '') {
                            parsedSections = JSON.parse(project.sections);
                        }
                    } catch (parseError) {
                        console.error(`Error parsing sections for project ID ${project.id}:`, parseError, `Value: ${project.sections}`);
                    }

                    return {
                        ...project,
                        additional_images: Array.isArray(parsedAdditionalImages) ? parsedAdditionalImages : [],
                        sections: Array.isArray(parsedSections) ? parsedSections : []
                    };
                });
                cb(null, projects);
            }
        );
    },

    getById: (id, cb) => {
        console.log(`Querying project with ID: ${id}`);
        db.query(
            'SELECT id, title, extra_title, title_description, description, detailed_description, image, additional_images, url, language, sections FROM projects WHERE id = ?',
            [id],
            (err, results) => {
                if (err) {
                    console.error('Database error in getById:', err);
                    return cb(err);
                }
                if (results.length === 0) return cb(new Error('المشروع غير موجود'));

                const project = results[0];
                let parsedAdditionalImages = [];
                let parsedSections = [];

                try {
                    if (project.additional_images && typeof project.additional_images === 'string' && project.additional_images !== 'NULL' && project.additional_images.trim() !== '') {
                        parsedAdditionalImages = JSON.parse(project.additional_images);
                    }
                } catch (parseError) {
                    console.error(`Error parsing additional_images for project ID ${project.id}:`, parseError, `Value: ${project.additional_images}`);
                }

                try {
                    if (project.sections && typeof project.sections === 'string' && project.sections !== 'NULL' && project.sections.trim() !== '') {
                        parsedSections = JSON.parse(project.sections);
                    }
                } catch (parseError) {
                    console.error(`Error parsing sections for project ID ${project.id}:`, parseError, `Value: ${project.sections}`);
                }

                project.additional_images = Array.isArray(parsedAdditionalImages) ? parsedAdditionalImages : [];
                project.sections = Array.isArray(parsedSections) ? parsedSections : [];
                cb(null, project);
            }
        );
    },

    create: (data, cb) => {
        db.query(
            'INSERT INTO projects (title, extra_title, title_description, description, detailed_description, image, additional_images, url, language, sections) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                data.title,
                data.extra_title || null,
                data.title_description || null,
                data.description,
                data.detailed_description || null,
                data.image,
                JSON.stringify(data.additional_images || []),
                data.url || null,
                data.language,
                JSON.stringify(data.sections || [])
            ],
            (err, results) => {
                if (err) {
                    console.error('Database error in create:', err);
                    return cb(err);
                }
                cb(null, results);
            }
        );
    },

    update: (id, data, cb) => {
        db.query('SELECT * FROM projects WHERE id = ?', [id], (err, results) => {
            if (err) {
                console.error('Database error during pre-update fetch:', err);
                return cb(err);
            }
            if (results.length === 0) return cb(new Error('المشروع غير موجود'));

            const oldProject = results[0];
            const updatedFields = {};
            const queryParams = [];

            const addField = (fieldName, value, defaultValue = undefined) => {
                if (value !== undefined) {
                    updatedFields[fieldName] = value;
                    queryParams.push(value);
                } else if (defaultValue !== undefined) {
                    updatedFields[fieldName] = defaultValue;
                    queryParams.push(defaultValue);
                }
            };

            addField('title', data.title);
            addField('extra_title', data.extra_title === null ? null : (data.extra_title || undefined), oldProject.extra_title);
            addField('title_description', data.title_description === null ? null : (data.title_description || undefined), oldProject.title_description);
            addField('description', data.description);
            addField('detailed_description', data.detailed_description === null ? null : (data.detailed_description || undefined), oldProject.detailed_description);
            addField('url', data.url === null ? null : (data.url || undefined), oldProject.url);
            addField('language', data.language);
            addField('image', data.image !== undefined ? data.image : oldProject.image);
            addField('additional_images', JSON.stringify(data.additional_images !== undefined ? data.additional_images : JSON.parse(oldProject.additional_images || '[]')));
            addField('sections', JSON.stringify(data.sections !== undefined ? data.sections : JSON.parse(oldProject.sections || '[]')));

            const setClause = Object.keys(updatedFields).map(key => `\`${key}\` = ?`).join(', ');
            queryParams.push(id);

            if (Object.keys(updatedFields).length === 0) {
                return cb(null, { message: 'لا توجد بيانات للتحديث' });
            }

            const sql = `UPDATE projects SET ${setClause} WHERE id = ?`;
            db.query(sql, queryParams, (err, results) => {
                if (err) {
                    console.error('Database error in update:', err);
                    return cb(err);
                }
                cb(null, results);
            });
        });
    },

    delete: (id, cb) => {
        db.query('SELECT * FROM projects WHERE id = ?', [id], (err, results) => {
            if (err) {
                console.error('Database error during pre-delete fetch:', err);
                return cb(err);
            }
            if (results.length === 0) return cb(new Error('المشروع غير موجود'));
            db.query('DELETE FROM projects WHERE id = ?', [id], (err, results) => {
                if (err) {
                    console.error('Database error in delete:', err);
                    return cb(err);
                }
                cb(null, results);
            });
        });
    },

    getProjectBackground: (cb) => {
        console.log('Querying settings for projects_background_image');
        db.query('SELECT value FROM settings WHERE `key_name` = ?', ['projects_background_image'], (err, results) => {
            if (err) {
                console.error('Database error in getProjectBackground:', err);
                return cb(err);
            }
            cb(null, results.length > 0 ? results[0].value : '');
        });
    },

    updateProjectBackground: (imagePath, cb) => {
        db.query(
            'INSERT INTO settings (`key_name`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
            ['projects_background_image', imagePath, imagePath],
            (err, results) => {
                if (err) {
                    console.error('Database error in updateProjectBackground:', err);
                    return cb(err);
                }
                cb(null, results);
            }
        );
    }
};

module.exports = Project;