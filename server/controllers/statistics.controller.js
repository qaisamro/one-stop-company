const Statistic = require('../models/statistics.model');

exports.getStats = (req, res) => {
  const lang = req.query.lang || 'ar';
  Statistic.getAll(lang, (err, results) => {
    if (err) {
      console.error('Error in getStats:', err);
      return res.status(500).json({ error: 'خطأ داخلي في الخادم' });
    }
    res.json(results);
  });
};

exports.createStat = (req, res) => {
  Statistic.create(req.body, (err) => {
    if (err) {
      console.error('Error in createStat:', err);
      return res.status(500).json({ error: 'فشل إضافة الإحصائية' });
    }
    res.json({ message: 'تمت الإضافة بنجاح' });
  });
};

exports.updateStat = (req, res) => {
  Statistic.update(req.params.id, req.body, (err) => {
    if (err) {
      console.error('Error in updateStat:', err);
      return res.status(500).json({ error: 'فشل تحديث الإحصائية' });
    }
    res.json({ message: 'تم التحديث بنجاح' });
  });
};

exports.deleteStat = (req, res) => {
  Statistic.delete(req.params.id, (err) => {
    if (err) {
      console.error('Error in deleteStat:', err);
      return res.status(500).json({ error: 'فشل حذف الإحصائية' });
    }
    res.json({ message: 'تم الحذف بنجاح' });
  });
};