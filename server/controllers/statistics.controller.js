// C:\Users\Lenovo\one-stop-company\server\controllers\statistics.controller.js
const Statistic = require('../models/statistics.model');

exports.getStats = (req, res) => {
  const lang = req.query.lang || 'ar';
  Statistic.getAll(lang, (err, results) => { // results هنا ستكون results.rows من النموذج
    if (err) {
      console.error('Error in getStats:', err);
      return res.status(500).json({ error: 'خطأ داخلي في الخادم', details: err.message });
    }
    res.json(results);
  });
};

exports.createStat = (req, res) => {
  // يجب أن يتضمن req.body الآن 'language' لتحديد الأعمدة الصحيحة في النموذج
  const { label, value, icon, language } = req.body;
  if (!label || !value || !language) { // الأيقونة اختيارية
    return res.status(400).json({ error: 'التسمية والقيمة واللغة مطلوبة' });
  }

  Statistic.create({ label, value, icon, language }, (err, newStat) => { // استلام newStat من النموذج
    if (err) {
      console.error('Error in createStat:', err);
      return res.status(500).json({ error: 'فشل إضافة الإحصائية', details: err.message });
    }
    res.status(201).json({ message: 'تمت الإضافة بنجاح', stat: newStat }); // إرجاع الإحصائية الجديدة
  });
};

exports.updateStat = (req, res) => {
  const { id } = req.params;
  // يجب أن يتضمن req.body الآن 'language' لتحديد الأعمدة الصحيحة في النموذج
  const { label, value, icon, language } = req.body;
  if (!label || !value || !language) { // إضافة التحقق من اللغة
    return res.status(400).json({ error: 'التسمية والقيمة واللغة مطلوبة' });
  }

  Statistic.update(id, { label, value, icon, language }, (err) => {
    if (err) {
      console.error('Error in updateStat:', err);
      return res.status(500).json({ error: 'فشل تحديث الإحصائية', details: err.message });
    }
    res.json({ message: 'تم التحديث بنجاح' });
  });
};

exports.deleteStat = (req, res) => {
  const { id } = req.params;
  Statistic.delete(id, (err) => {
    if (err) {
      console.error('Error in deleteStat:', err);
      return res.status(500).json({ error: 'فشل حذف الإحصائية', details: err.message });
    }
    res.json({ message: 'تم الحذف بنجاح' });
  });
};