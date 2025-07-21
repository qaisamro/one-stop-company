// C:\Users\Lenovo\one-stop-company\server\controllers\services.controller.js
const Service = require('../models/services.model');

exports.getServices = (req, res) => {
  const lang = req.query.lang || 'en';
  Service.getAll(lang, (err, results) => { // results هنا ستكون results.rows من النموذج
    if (err) {
      console.error('Error in getServices:', err);
      return res.status(500).json({ error: 'خطأ داخلي في الخادم', details: err.message });
    }
    res.json(results);
  });
};

exports.createService = (req, res) => {
  // يجب أن يتضمن req.body الآن 'language' لتحديد الأعمدة الصحيحة في النموذج
  const { title, description, icon, language } = req.body;
  if (!title || !description || !icon || !language) {
    return res.status(400).json({ error: 'العنوان والوصف والأيقونة واللغة مطلوبة' });
  }

  Service.create({ title, description, icon, language }, (err, newService) => { // استلام newService من النموذج
    if (err) {
      console.error('Error in createService:', err);
      return res.status(500).json({ error: 'فشل إضافة الخدمة', details: err.message });
    }
    res.status(201).json({ message: 'تمت إضافة الخدمة بنجاح', service: newService }); // إرجاع الخدمة الجديدة
  });
};

exports.updateService = (req, res) => {
  const { id } = req.params;
  // يجب أن يتضمن req.body الآن 'language' لتحديد الأعمدة الصحيحة في النموذج
  const { title, description, icon, language } = req.body;
  if (!title || !description || !icon || !language) { // إضافة التحقق من اللغة
    return res.status(400).json({ error: 'العنوان والوصف والأيقونة واللغة مطلوبة' });
  }

  Service.update(id, { title, description, icon, language }, (err) => {
    if (err) {
      console.error('Error in updateService:', err);
      return res.status(500).json({ error: 'فشل تحديث الخدمة', details: err.message });
    }
    res.json({ message: 'تم تحديث الخدمة بنجاح' });
  });
};

exports.deleteService = (req, res) => {
  const { id } = req.params;
  Service.delete(id, (err) => {
    if (err) {
      console.error('Error in deleteService:', err);
      return res.status(500).json({ error: 'فشل حذف الخدمة', details: err.message });
    }
    res.json({ message: 'تم حذف الخدمة بنجاح' });
  });
};