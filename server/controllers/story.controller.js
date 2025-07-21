// C:\Users\Lenovo\one-stop-company\server\controllers\story.controller.js
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
    Story.getStory(lang, (err, result) => { // result هنا هو results.rows من النموذج
        if (err) {
            console.error('Error in getStory:', err);
            return res.status(500).json({ error: 'Failed to fetch story', details: err.message });
        }
        const storyData = result[0] || { id: null, title: '', content: '', image_url: null, language: lang }; // Ensure language is set for new storyData
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

    if (!language || !title || !content) {
        return res.status(400).json({ error: 'Language, title, and content are required.' });
    }

    if (req.file) {
        image_url = `Uploads/story/${req.file.filename}`.replace(/\\/g, '/');
    }

    const dataToCreate = { language, title, content, image_url };

    Story.createStory(dataToCreate, (err, newStory) => { // استلام newStory من النموذج
        if (err) {
            console.error('Error in createStory:', err);
            return res.status(500).json({ error: 'Failed to create story', details: err.message });
        }
        res.status(201).json({
            message: '✅ Story created successfully',
            id: newStory.id, // استخدام newStory.id
            image_url: newStory.image_url ? `${req.protocol}://${req.get('host')}/${newStory.image_url}` : null,
            title: newStory.title,
            content: newStory.content,
            language: newStory.language
        });
    });
};

exports.updateStory = (req, res) => {
    const id = req.params.id;
    const { title, content, language } = req.body;
    let image_url = req.body.image_url || null; // This will contain the old URL if no new file is uploaded

    if (!language || !title || !content) { // إضافة التحقق من اللغة
        return res.status(400).json({ error: 'Language, title, and content are required for update.' });
    }

    if (req.file) {
        // If a new file is uploaded, delete the old image if it exists
        // Need to fetch the existing story to get the current image_url from DB
        Story.getStoryById(id, (err, existingStory) => { // You might need a getStoryById in model
            if (err) {
                console.error('Error fetching existing story for image update:', err);
                return res.status(500).json({ error: 'Failed to retrieve old image path for deletion', details: err.message });
            }
            if (existingStory && existingStory.image_url) {
                const oldImagePath = path.join(__dirname, '..', existingStory.image_url.replace(`${req.protocol}://${req.get('host')}/`, ''));
                deleteOldImage(oldImagePath);
            }
            image_url = `Uploads/story/${req.file.filename}`.replace(/\\/g, '/');

            // Continue with update after handling old image
            const dataToUpdate = { title, content, image_url, language };
            Story.updateStory(id, dataToUpdate, (err) => {
                if (err) {
                    console.error('Error in updateStory:', err);
                    return res.status(500).json({ error: err.message || 'Failed to update story' });
                }
                res.json({
                    message: '✅ Story updated successfully',
                    image_url: image_url ? `${req.protocol}://${req.get('host')}/${image_url}` : null,
                    title,
                    content,
                    language
                });
            });
        });
    } else {
        // If no new file, use the image_url from req.body (could be null if client explicitly sent null)
        const dataToUpdate = { title, content, image_url, language };
        Story.updateStory(id, dataToUpdate, (err) => {
            if (err) {
                console.error('Error in updateStory:', err);
                return res.status(500).json({ error: err.message || 'Failed to update story' });
            }
            res.json({
                message: '✅ Story updated successfully',
                image_url: image_url ? `${req.protocol}://${req.get('host')}/${image_url}` : null,
                title,
                content,
                language
            });
        });
    }
};