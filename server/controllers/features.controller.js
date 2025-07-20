// C:\Users\Lenovo\one-stop-company\server\controllers\features.controller.js

const Features = require('../models/features.model');

exports.getFeatures = (req, res) => {
  const lang = req.query.lang || 'en';
  Features.getSection(lang, (err, sections) => {
    if (err) {
      console.error("Error getting features section:", err);
      return res.status(500).json({ error: 'Failed to retrieve section data' });
    }

    if (!sections || sections.length === 0) {
      return res.json({ section: null, items: [] });
    }

    const section = sections[0];
    // تعديل: جلب كل العناصر لجميع التابات
    Features.getItems(section.id, (err, items) => {
      if (err) {
        console.error("Error getting features items:", err);
        return res.status(500).json({ error: 'Failed to retrieve features items' });
      }
      res.json({ section, items: items || [] });
    });
  });
};

exports.createSection = (req, res) => {
  const { title, subtitle, description, tab1_title, tab2_title, tab3_title, tab4_title, button_text, button_url, image_url, language } = req.body;

  if (!title || !language) {
    return res.status(400).json({ error: 'Title and language are required to create a section.' });
  }

  const sectionData = {
    title, subtitle, description, tab1_title, tab2_title, tab3_title, tab4_title, button_text, button_url, image_url, language
  };

  Features.createSection(sectionData, (err, result) => {
    if (err) {
      console.error("Error creating features section:", err);
      return res.status(500).json({ error: 'Failed to create section' });
    }
    res.status(201).json({ message: 'Section created successfully', section: { id: result.insertId, ...sectionData } });
  });
};

exports.updateSection = (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Section ID is required for update.' });
  }

  Features.updateSection(id, req.body, (err) => {
    if (err) {
      console.error("Error updating features section:", err);
      return res.status(500).json({ error: 'Failed to update section' });
    }
    res.json({ message: 'Section updated successfully' });
  });
};

exports.addItem = (req, res) => {
  const { id: section_id } = req.params;
  const { text, icon, tab_index } = req.body; // <--- إضافة tab_index

  if (!section_id || !text || tab_index === undefined) { // <--- التحقق من tab_index
    return res.status(400).json({ error: 'Section ID, text, and tab_index are required to add an item.' });
  }

  Features.createItem(section_id, text, icon, tab_index, (err) => { // <--- تمرير tab_index
    if (err) {
      console.error("Error adding features item:", err);
      return res.status(500).json({ error: 'Failed to add item' });
    }
    res.status(201).json({ message: 'Item added successfully' });
  });
};

exports.deleteItem = (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Item ID is required for deletion.' });
  }

  Features.deleteItem(id, (err) => {
    if (err) {
      console.error("Error deleting features item:", err);
      return res.status(500).json({ error: 'Failed to delete item' });
    }
    res.json({ message: 'Item deleted successfully' });
  });
};