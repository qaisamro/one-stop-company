// C:\Users\Lenovo\one-stop-company\server\models\projects.model.js
const db = require('../config/db'); // افترض أن هذا هو اتصال PostgreSQL الخاص بك (باستخدام مكتبة 'pg')

const Project = {
    getAll: (lang, cb) => {
        console.log(`Querying projects for language: ${lang}`);
        db.query(
            `SELECT
                id,
                CASE WHEN $1 = 'ar' THEN title_ar ELSE title_en END AS title,
                CASE WHEN $1 = 'ar' THEN extra_title_ar ELSE extra_title_en END AS extra_title,
                CASE WHEN $1 = 'ar' THEN title_description_ar ELSE title_description_en END AS title_description,
                CASE WHEN $1 = 'ar' THEN description_ar ELSE description_en END AS description,
                CASE WHEN $1 = 'ar' THEN detailed_description_ar ELSE detailed_description_en END AS detailed_description,
                image,
                additional_images, -- يتم جلبها كـ JSONB تلقائيًا إذا كان العمود من النوع JSONB
                url,
                language,
                sections, -- يتم جلبها كـ JSONB تلقائيًا إذا كان العمود من النوع JSONB
                created_at,
                updated_at
            FROM projects
            WHERE language = $1`,
            [lang],
            (err, results) => {
                if (err) {
                    console.error('Database error in getAll:', err);
                    return cb(err);
                }
                // في PostgreSQL مع عمود JSONB، يجب أن تكون البيانات قد تم تحويلها بالفعل إلى JavaScript objects/arrays
                // لذا، قد لا تحتاج لـ JSON.parse هنا إذا كان تعريف العمود صحيحًا
                // ومع ذلك، للحفاظ على التوافق مع المنطق السابق الذي يتعامل مع الأخطاء
                const projects = results.rows.map(project => {
                    let parsedAdditionalImages = project.additional_images;
                    let parsedSections = project.sections;

                    // إذا كانت الأعمدة JSONB، فالبيانات ستكون كائنات/مصفوفات مباشرة.
                    // هذه الكتل 'try-catch' قد تكون ضرورية فقط إذا كانت الأعمدة لا تزال TEXT وتخزن سلاسل JSON
                    // وللتأكد من أنها مصفوفة
                    if (!Array.isArray(parsedAdditionalImages)) {
                        parsedAdditionalImages = [];
                    }
                    if (!Array.isArray(parsedSections)) {
                        parsedSections = [];
                    }

                    return {
                        ...project,
                        additional_images: parsedAdditionalImages,
                        sections: parsedSections
                    };
                });
                cb(null, projects);
            }
        );
    },

    getById: (id, cb) => {
        console.log(`Querying project with ID: ${id}`);
        db.query(
            `SELECT
                id,
                title_ar AS title, -- يمكنك تحديد اللغة المطلوبة هنا أو جلب الأعمدة بلغتين
                extra_title_ar AS extra_title,
                title_description_ar AS title_description,
                description_ar AS description,
                detailed_description_ar AS detailed_description,
                image,
                additional_images,
                url,
                language,
                sections,
                created_at,
                updated_at
            FROM projects
            WHERE id = $1`,
            [id],
            (err, results) => {
                if (err) {
                    console.error('Database error in getById:', err);
                    return cb(err);
                }
                if (results.rows.length === 0) return cb(new Error('المشروع غير موجود'));

                const project = results.rows[0];
                let parsedAdditionalImages = project.additional_images;
                let parsedSections = project.sections;

                // التعامل مع JSONB الذي قد يعود كائنًا/مصفوفة أو null
                if (!Array.isArray(parsedAdditionalImages)) {
                    parsedAdditionalImages = [];
                }
                if (!Array.isArray(parsedSections)) {
                    parsedSections = [];
                }

                project.additional_images = parsedAdditionalImages;
                project.sections = parsedSections;
                cb(null, project);
            }
        );
    },

    create: (data, cb) => {
        // تحديد الأعمدة الصحيحة بناءً على اللغة
        const titleCol = `title_${data.language}`;
        const extraTitleCol = `extra_title_${data.language}`;
        const titleDescriptionCol = `title_description_${data.language}`;
        const descriptionCol = `description_${data.language}`;
        const detailedDescriptionCol = `detailed_description_${data.language}`;
        // لا نحتاج لـ URL Col إذا كان عمودًا واحدًا للكل اللغات

        db.query(
            `INSERT INTO projects (
                ${titleCol}, ${extraTitleCol}, ${titleDescriptionCol},
                ${descriptionCol}, ${detailedDescriptionCol},
                image, additional_images, url, language, sections,
                created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) RETURNING id`, // إضافة RETURNING id
            [
                data.title,
                data.extra_title || null,
                data.title_description || null,
                data.description,
                data.detailed_description || null,
                data.image,
                data.additional_images || [], // يجب أن تكون مصفوفة ليتم تخزينها كـ JSONB
                data.url || null,
                data.language,
                data.sections || [] // يجب أن تكون مصفوفة ليتم تخزينها كـ JSONB
            ],
            (err, result) => {
                if (err) {
                    console.error('Database error in create:', err);
                    return cb(err);
                }
                cb(null, result.rows[0]); // PostgreSQL returns inserted row in .rows[0]
            }
        );
    },

    update: (id, data, cb) => {
        // جلب المشروع الحالي للحصول على القيم القديمة والأعمدة المترجمة
        db.query('SELECT * FROM projects WHERE id = $1', [id], (err, results) => {
            if (err) {
                console.error('Database error during pre-update fetch:', err);
                return cb(err);
            }
            if (results.rows.length === 0) return cb(new Error('المشروع غير موجود'));

            const oldProject = results.rows[0];
            const updatedFields = {};
            const queryParams = [];

            // تحديد الأعمدة الصحيحة بناءً على اللغة المعطاة في data.language
            const langSuffix = data.language; // يجب أن يتم تمرير اللغة في data

            const addField = (colNameEn, colNameAr, value, defaultValue) => {
                if (value !== undefined) {
                    if (langSuffix === 'ar') {
                        updatedFields[colNameAr] = value;
                        queryParams.push(value);
                    } else { // default to 'en'
                        updatedFields[colNameEn] = value;
                        queryParams.push(value);
                    }
                }
            };
            
            // إضافة القيم التي تم تحديثها
            addField('title_en', 'title_ar', data.title);
            addField('extra_title_en', 'extra_title_ar', data.extra_title, oldProject[`extra_title_${langSuffix}`]);
            addField('title_description_en', 'title_description_ar', data.title_description, oldProject[`title_description_${langSuffix}`]);
            addField('description_en', 'description_ar', data.description);
            addField('detailed_description_en', 'detailed_description_ar', data.detailed_description, oldProject[`detailed_description_${langSuffix}`]);
            
            // الحقول غير المترجمة
            if (data.url !== undefined) {
                updatedFields['url'] = data.url === null ? null : data.url;
                queryParams.push(updatedFields['url']);
            }
            if (data.image !== undefined) {
                updatedFields['image'] = data.image;
                queryParams.push(updatedFields['image']);
            }
            if (data.additional_images !== undefined) {
                updatedFields['additional_images'] = data.additional_images; // يتم تمريرها كـ JSONB
                queryParams.push(updatedFields['additional_images']);
            }
            if (data.sections !== undefined) {
                updatedFields['sections'] = data.sections; // يتم تمريرها كـ JSONB
                queryParams.push(updatedFields['sections']);
            }
            if (data.language !== undefined) {
                updatedFields['language'] = data.language;
                queryParams.push(updatedFields['language']);
            }

            // إضافة updated_at
            updatedFields['updated_at'] = 'CURRENT_TIMESTAMP';


            const setClause = Object.keys(updatedFields).map((key, index) => {
                // إذا كان المفتاح هو 'updated_at' نستخدم قيمة 'CURRENT_TIMESTAMP' مباشرة
                if (key === 'updated_at') {
                    return `${key} = CURRENT_TIMESTAMP`;
                }
                // وإلا نستخدم $N placeholders
                return `${key} = $${index + 1}`;
            }).join(', ');
            
            // تأكد من أن queryParams تحتوي على القيم بالترتيب الصحيح
            queryParams.push(id); // ID هو آخر بارامتر

            if (Object.keys(updatedFields).length === 0) {
                return cb(null, { message: 'لا توجد بيانات للتحديث' });
            }
            // بناء الاستعلام مع updated_at في نهاية setClause ليتناسب مع queryParams
            const finalSetClause = Object.keys(updatedFields).filter(key => key !== 'updated_at').map((key, index) => `${key} = $${index + 1}`).join(', ') + `, updated_at = CURRENT_TIMESTAMP`;

            const sql = `UPDATE projects SET ${finalSetClause} WHERE id = $${queryParams.length}`; // $ للـ ID
            db.query(sql, queryParams, (err, result) => {
                if (err) {
                    console.error('Database error in update:', err);
                    return cb(err);
                }
                cb(null, result);
            });
        });
    },

    delete: (id, cb) => {
        db.query('SELECT * FROM projects WHERE id = $1', [id], (err, results) => {
            if (err) {
                console.error('Database error during pre-delete fetch:', err);
                return cb(err);
            }
            if (results.rows.length === 0) return cb(new Error('المشروع غير موجود'));
            db.query('DELETE FROM projects WHERE id = $1', [id], (err, result) => {
                if (err) {
                    console.error('Database error in delete:', err);
                    return cb(err);
                }
                cb(null, result);
            });
        });
    },

    getProjectBackground: (cb) => {
        console.log('Querying settings for projects_background_image');
        db.query('SELECT value FROM settings WHERE key_name = $1', ['projects_background_image'], (err, results) => {
            if (err) {
                console.error('Database error in getProjectBackground:', err);
                return cb(err);
            }
            cb(null, results.rows.length > 0 ? results.rows[0].value : '');
        });
    },

    updateProjectBackground: (imagePath, cb) => {
        db.query(
            `INSERT INTO settings (key_name, value, created_at, updated_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (key_name) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
            ['projects_background_image', imagePath],
            (err, result) => {
                if (err) {
                    console.error('Database error in updateProjectBackground:', err);
                    return cb(err);
                }
                cb(null, result);
            }
        );
    }
};

module.exports = Project;