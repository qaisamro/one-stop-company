const Story = require('../models/story.model');
const fs = require('fs');
const path = require('path');

// Helper function to delete old image if it exists
const deleteOldImage = (oldImagePath) => {
    if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
            if (err) {
                console.error('Failed to delete old image:', err);
            } else {
                console.log('Old image deleted:', oldImagePath);
            }
        });
    }
};

exports.getStory = (req, res) => {
    const lang = req.query.lang || 'en';
    Story.getStory(lang, (err, result) => {
        if (err) return res.status(500).json({ error: err.message || 'Failed to fetch story' });
        const storyData = result[0] || { id: null, title: '', content: '', image_url: null };
        if (storyData.image_url) {
            // Ensure the path uses forward slashes and is relative to the public folder
            storyData.image_url = `Uploads/story/${path.basename(storyData.image_url)}`.replace(/\\/g, '/');
            storyData.image_url = `${req.protocol}://${req.get('host')}/${storyData.image_url}`;
        }
        res.json(storyData);
    });
};

exports.createStory = (req, res) => {
    const { language, title, content } = req.body;
    let image_url = null;

    if (req.file) {
        image_url = `Uploads/story/${req.file.filename}`.replace(/\\/g, '/');
    }

    const dataToCreate = { language, title, content, image_url };

    Story.createStory(dataToCreate, (err, result) => {
        if (err) return res.status(500).json({ error: err.message || 'Failed to create story' });
        res.json({
            message: '✅ Story created successfully',
            id: result.insertId,
            image_url: image_url ? `${req.protocol}://${req.get('host')}/${image_url}` : null,
            title,
            content,
            language
        });
    });
};

exports.updateStory = (req, res) => {
    const id = req.params.id;
    const { title, content, language } = req.body;
    let image_url = req.body.image_url || null;

    if (req.file) {
        // If a new file is uploaded, delete the old image if it exists
        if (image_url) {
            const oldImagePath = path.join(__dirname, '..', image_url.replace(`${req.protocol}://${req.get('host')}/`, ''));
            deleteOldImage(oldImagePath);
        }
        image_url = `Uploads/story/${req.file.filename}`.replace(/\\/g, '/');
    }

    const dataToUpdate = { title, content, image_url, language };

    Story.updateStory(id, dataToUpdate, (err) => {
        if (err) return res.status(500).json({ error: err.message || 'Failed to update story' });
        res.json({
            message: '✅ Story updated successfully',
            image_url: image_url ? `${req.protocol}://${req.get('host')}/${image_url}` : null,
            title,
            content,
            language
        });
    });
};