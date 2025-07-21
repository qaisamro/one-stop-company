// C:\Users\Lenovo\one-stop-company\server\controllers\contact.controller.js
const Contact = require('../models/contact.model');

exports.getContacts = (req, res) => {
  Contact.getAll((err, results) => { // 'results' هنا ستكون 'results.rows' من النموذج
    if (err) {
      console.error('Error in getContacts:', err);
      return res.status(500).json({ error: 'خطأ داخلي في الخادم' });
    }
    res.json(results);
  });
};

exports.createContact = (req, res) => {
  Contact.create(req.body, (err, newContact) => { // 'newContact' هنا ستكون 'result.rows[0]' من النموذج
    if (err) {
      console.error('Error in createContact:', err);
      return res.status(500).json({ error: 'فشل إرسال الرسالة', details: err.message }); // أضفت details لتفاصيل الخطأ
    }
    res.json({ message: 'تم إرسال الرسالة بنجاح', contact: newContact }); // أضفت newContact لربما تحتاجه الواجهة الأمامية
  });
};