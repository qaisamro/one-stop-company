const Service = require('../models/services.model');

exports.getServices = (req, res) => {
  const lang = req.query.lang || 'en';
  Service.getAll(lang, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

exports.createService = (req, res) => {
  Service.create(req.body, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'تمت الإضافة' });
  });
};

exports.updateService = (req, res) => {
  const { id } = req.params;
  Service.update(id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'تم التحديث' });
  });
};

exports.deleteService = (req, res) => {
  const { id } = req.params;
  Service.delete(id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'تم الحذف' });
  });
};
