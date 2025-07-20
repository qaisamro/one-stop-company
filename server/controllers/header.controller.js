const Header = require('../models/header.model');

exports.getHeaderLinks = (req, res) => {
  const lang = req.query.lang || 'ar';
  Header.get(lang, (err, results) => {
    if (err) {
      console.error('Error in getHeaderLinks:', err);
      return res.status(500).json({ error: 'خطأ داخلي في الخادم' });
    }
    res.json(results);
  });
};

exports.addHeaderLink = (req, res) => {
  const { label, href, language, isSection, content } = req.body;
  if (!label || !href || !language) {
    return res.status(400).json({ error: 'التسمية والرابط واللغة مطلوبة' });
  }
  Header.add({ label, href, language, isSection: isSection || false, content }, (err) => {
    if (err) {
      console.error('Error in addHeaderLink:', err);
      return res.status(500).json({ error: 'فشل إضافة الرابط' });
    }
    res.json({ message: 'تمت إضافة الرابط بنجاح' });
  });
};

exports.updateHeaderLink = (req, res) => {
  const { id } = req.params;
  const { label, href, language, isSection, content } = req.body;
  if (!label || !href || !language) {
    return res.status(400).json({ error: 'التسمية والرابط واللغة مطلوبة' });
  }
  Header.update(id, { label, href, language, isSection: isSection || false, content }, (err) => {
    if (err) {
      console.error('Error in updateHeaderLink:', err);
      return res.status(500).json({ error: 'فشل تحديث الرابط' });
    }
    res.json({ message: 'تم تحديث الرابط بنجاح' });
  });
};

exports.deleteHeaderLink = (req, res) => {
  const { id } = req.params;
  Header.delete(id, (err) => {
    if (err) {
      console.error('Error in deleteHeaderLink:', err);
      return res.status(500).json({ error: 'فشل حذف الرابط' });
    }
    res.json({ message: 'تم حذف الرابط بنجاح' });
  });
};