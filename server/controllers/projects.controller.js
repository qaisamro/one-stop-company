const Project = require('../models/projects.model');
const fs = require('fs');
const path = require('path');

exports.getProjects = (req, res) => {
    const lang = req.query.lang || 'ar';
    console.log(`Fetching projects for language: ${lang}`);
    Project.getAll(lang, (err, results) => {
        if (err) {
            console.error('Error in getProjects:', err);
            return res.status(500).json({ error: 'خطأ داخلي في الخادم', details: err.message });
        }
        res.json(results);
    });
};

exports.getProjectById = (req, res) => {
    const { id } = req.params;
    console.log(`Requesting project with ID: ${id}`);
    Project.getById(id, (err, project) => {
        if (err) {
            console.error('Error in getProjectById:', err);
            if (err.message === 'المشروع غير موجود') {
                return res.status(404).json({ error: 'المشروع غير موجود' });
            }
            return res.status(500).json({ error: 'خطأ في جلب تفاصيل المشروع', details: err.message });
        }
        res.json(project);
    });
};

exports.createProject = (req, res) => {
    const { title, extra_title, title_description, description, detailed_description, url, language, sections } = req.body;
    const image = req.files?.image ? `/Uploads/${req.files.image[0].filename}` : null;
    const additional_images = req.files?.additional_images ? req.files.additional_images.map(file => `/Uploads/${file.filename}`) : [];
    let parsedSections = [];

    if (sections) {
        try {
            parsedSections = typeof sections === 'string' ? JSON.parse(sections) : sections;
            if (!Array.isArray(parsedSections)) {
                return res.status(400).json({ error: 'الأقسام يجب أن تكون مصفوفة', details: 'Invalid sections format' });
            }
        } catch (e) {
            console.error('Error parsing sections JSON in createProject:', e);
            return res.status(400).json({ error: 'تنسيق أقسام المشروع غير صالح', details: e.message });
        }
    }

    if (!title || !description || !language) {
        return res.status(400).json({ error: 'العنوان والوصف واللغة مطلوبة' });
    }

    const projectData = {
        title,
        extra_title: extra_title || null,
        title_description: title_description || null,
        description,
        detailed_description: detailed_description || null,
        image,
        additional_images,
        url: url || null,
        language,
        sections: parsedSections
    };

    Project.create(projectData, (err) => {
        if (err) {
            console.error('Error in createProject:', err);
            return res.status(500).json({ error: 'فشل إضافة المشروع', details: err.message });
        }
        res.status(201).json({ message: 'تمت إضافة المشروع بنجاح' });
    });
};

exports.updateProject = (req, res) => {
    const { id } = req.params;
    const { title, extra_title, title_description, description, detailed_description, url, language, sections } = req.body;
    const image = req.files?.image ? `/Uploads/${req.files.image[0].filename}` : undefined;
    const additional_images = req.files?.additional_images ? req.files.additional_images.map(file => `/Uploads/${file.filename}`) : undefined;
    let parsedSections = undefined;

    if (sections !== undefined) {
        try {
            parsedSections = typeof sections === 'string' ? JSON.parse(sections) : sections;
            if (!Array.isArray(parsedSections)) {
                return res.status(400).json({ error: 'الأقسام يجب أن تكون مصفوفة', details: 'Invalid sections format' });
            }
        } catch (e) {
            console.error('Error parsing sections JSON in updateProject:', e);
            return res.status(400).json({ error: 'تنسيق أقسام المشروع غير صالح', details: e.message });
        }
    }

    if (!title || !description || !language) {
        return res.status(400).json({ error: 'العنوان والوصف واللغة مطلوبة' });
    }

    Project.getById(id, (err, existingProject) => {
        if (err) {
            console.error('Error fetching project for update:', err);
            if (err.message === 'المشروع غير موجود') {
                return res.status(404).json({ error: 'المشروع غير موجود' });
            }
            return res.status(500).json({ error: 'خطأ في جلب المشروع', details: err.message });
        }

        if (image && existingProject.image) {
            const oldImagePath = path.join(__dirname, '..', existingProject.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        if (additional_images && existingProject.additional_images && existingProject.additional_images.length > 0) {
            existingProject.additional_images.forEach(img => {
                const oldImagePath = path.join(__dirname, '..', img);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            });
        }

        const projectData = {
            title,
            extra_title: extra_title !== undefined ? extra_title : existingProject.extra_title,
            title_description: title_description !== undefined ? title_description : existingProject.title_description,
            description,
            detailed_description: detailed_description !== undefined ? detailed_description : existingProject.detailed_description,
            image: image !== undefined ? image : existingProject.image,
            additional_images: additional_images !== undefined ? additional_images : existingProject.additional_images,
            url: url !== undefined ? url : existingProject.url,
            language,
            sections: parsedSections !== undefined ? parsedSections : existingProject.sections
        };

        Project.update(id, projectData, (err) => {
            if (err) {
                console.error('Error in updateProject:', err);
                return res.status(500).json({ error: 'فشل تحديث المشروع', details: err.message });
            }
            res.json({ message: 'تم تحديث المشروع بنجاح' });
        });
    });
};

exports.deleteProject = (req, res) => {
    const { id } = req.params;
    Project.getById(id, (err, project) => {
        if (err) {
            console.error('Error fetching project for deletion:', err);
            if (err.message === 'المشروع غير موجود') {
                return res.status(404).json({ error: 'المشروع غير موجود' });
            }
            return res.status(500).json({ error: 'خطأ في جلب المشروع', details: err.message });
        }

        if (project.image) {
            const imagePath = path.join(__dirname, '..', project.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        if (project.additional_images && project.additional_images.length > 0) {
            project.additional_images.forEach(img => {
                const imagePath = path.join(__dirname, '..', img);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            });
        }

        Project.delete(id, (err) => {
            if (err) {
                console.error('Error in deleteProject:', err);
                return res.status(500).json({ error: 'فشل حذف المشروع', details: err.message });
            }
            res.json({ message: 'تم حذف المشروع بنجاح' });
        });
    });
};

exports.getProjectBackground = (req, res) => {
    console.log('Fetching project background');
    Project.getProjectBackground((err, imagePath) => {
        if (err) {
            console.error('Error in getProjectBackground:', err);
            return res.status(500).json({ error: 'خطأ في جلب صورة الخلفية', details: err.message });
        }
        res.json({ imagePath: imagePath || '' });
    });
};

exports.updateProjectBackground = (req, res) => {
    const imagePath = req.file ? `/Uploads/${req.file.filename}` : null;
    if (!imagePath) {
        return res.status(400).json({ error: 'صورة الخلفية مطلوبة' });
    }

    Project.getProjectBackground((err, oldImagePath) => {
        if (err) {
            console.error('Error fetching current background:', err);
            return res.status(500).json({ error: 'خطأ في جلب صورة الخلفية الحالية', details: err.message });
        }

        if (oldImagePath) {
            const oldPath = path.join(__dirname, '..', oldImagePath);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        Project.updateProjectBackground(imagePath, (err) => {
            if (err) {
                console.error('Error in updateProjectBackground:', err);
                return res.status(500).json({ error: 'فشل تحديث صورة الخلفية', details: err.message });
            }
            res.json({ message: 'تم تحديث صورة الخلفية بنجاح', imagePath });
        });
    });
};