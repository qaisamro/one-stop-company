// C:\Users\Lenovo\one-stop-company\server\controllers\features.controller.js

const Features = require('../models/features.model');

exports.getFeatures = (req, res) => {
  const lang = req.query.lang || 'en';
  Features.getSection(lang, (err, sections) => { // sections هنا ستكون results.rows من النموذج
    if (err) {
      console.error("Error getting features section:", err);
      return res.status(500).json({ error: 'Failed to retrieve section data' });
    }

    if (!sections || sections.length === 0) {
      return res.json({ section: null, items: [] });
    }

    const section = sections[0]; // لأن getSection ترجع صفًا واحدًا كـ مصفوفة
    // تعديل: جلب كل العناصر لجميع التابات
    Features.getItems(section.id, (err, items) => { // items هنا ستكون results.rows من النموذج
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

  Features.createSection(sectionData, (err, result) => { // result هنا هو الكائن {id: newId}
    if (err) {
      console.error("Error creating features section:", err);
      return res.status(500).json({ error: 'Failed to create section', details: err.message });
    }
    res.status(201).json({ message: 'Section created successfully', section: { id: result.id, ...sectionData } }); // استخدام result.id
  });
};

exports.updateSection = (req, res) => {
  const { id } = req.params;
  const { language } = req.body; // نحتاج اللغة لتحديث العمود الصحيح في النموذج

  if (!id) {
    return res.status(400).json({ error: 'Section ID is required for update.' });
  }
  if (!language) {
    return res.status(400).json({ error: 'Language is required for section update.' });
  }

  Features.updateSection(id, req.body, (err) => {
    if (err) {
      console.error("Error updating features section:", err);
      return res.status(500).json({ error: 'Failed to update section', details: err.message });
    }
    res.json({ message: 'Section updated successfully' });
  });
};

exports.addItem = (req, res) => {
  const { id: section_id } = req.params;
  const { text, icon, tab_index, language } = req.body; // <--- إضافة language

  if (!section_id || !text || tab_index === undefined || !language) { // <--- التحقق من language
    return res.status(400).json({ error: 'Section ID, text, tab_index, and language are required to add an item.' });
  }

  Features.createItem(section_id, text, icon, tab_index, language, (err, result) => { // <--- تمرير language واستلام result
    if (err) {
      console.error("Error adding features item:", err);
      return res.status(500).json({ error: 'Failed to add item', details: err.message });
    }
    res.status(201).json({ message: 'Item added successfully', item: { id: result.id, section_id, text, icon, tab_index, language } }); // استخدام result.id
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
      return res.status(500).json({ error: 'Failed to delete item', details: err.message });
    }
    res.json({ message: 'Item deleted successfully' });
  });
};