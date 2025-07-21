// C:\Users\Lenovo\one-stop-company\server\controllers\header.controller.js
const Header = require('../models/header.model');

exports.getHeaderLinks = (req, res) => {
  const lang = req.query.lang || 'ar';
  Header.get(lang, (err, results) => { // results هنا ستكون results.rows من النموذج
    if (err) {
      console.error('Error in getHeaderLinks:', err);
      return res.status(500).json({ error: 'خطأ داخلي في الخادم', details: err.message });
    }
    res.json(results);
  });
};

exports.addHeaderLink = (req, res) => {
  const { label, href, language, isSection, content } = req.body;
  if (!label || !href || !language) {
    return res.status(400).json({ error: 'التسمية والرابط واللغة مطلوبة' });
  }
  Header.add({ label, href, language, isSection: isSection || false, content }, (err, newLink) => { // استلام newLink من النموذج
    if (err) {
      console.error('Error in addHeaderLink:', err);
      return res.status(500).json({ error: 'فشل إضافة الرابط', details: err.message });
    }
    res.status(201).json({ message: 'تمت إضافة الرابط بنجاح', link: newLink }); // إرجاع الرابط الجديد
  });
};

exports.updateHeaderLink = (req, res) => {
  const { id } = req.params;
  const { label, href, language, isSection, content } = req.body;
  if (!label || !href || !language) { // إضافة التحقق من language لأن النموذج يحتاجها
    return res.status(400).json({ error: 'التسمية والرابط واللغة مطلوبة' });
  }
  Header.update(id, { label, href, language, isSection: isSection || false, content }, (err) => {
    if (err) {
      console.error('Error in updateHeaderLink:', err);
      return res.status(500).json({ error: 'فشل تحديث الرابط', details: err.message });
    }
    res.json({ message: 'تم تحديث الرابط بنجاح' });
  });
};

exports.deleteHeaderLink = (req, res) => {
  const { id } = req.params;
  Header.delete(id, (err) => {
    if (err) {
      console.error('Error in deleteHeaderLink:', err);
      return res.status(500).json({ error: 'فشل حذف الرابط', details: err.message });
    }
    res.json({ message: 'تم حذف الرابط بنجاح' });
  });
};