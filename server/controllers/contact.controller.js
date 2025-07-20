const Contact = require('../models/contact.model');

exports.getContacts = (req, res) => {
  Contact.getAll((err, results) => {
    if (err) {
      console.error('Error in getContacts:', err);
      return res.status(500).json({ error: 'خطأ داخلي في الخادم' });
    }
    res.json(results);
  });
};

exports.createContact = (req, res) => {
  Contact.create(req.body, (err) => {
    if (err) {
      console.error('Error in createContact:', err);
      return res.status(500).json({ error: 'فشل إرسال الرسالة' });
    }
    res.json({ message: 'تم إرسال الرسالة بنجاح' });
  });
};