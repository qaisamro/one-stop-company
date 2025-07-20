const Team = require('../models/team.model');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Node's built-in file system module

// Ensure the uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save uploaded files to the 'uploads/' directory
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent overwrites
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Initialize Multer upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, gif) are allowed!'));
  },
}).single('photo'); // 'photo' is the name of the input field in the form

exports.getTeam = (req, res) => {
  const lang = req.query.lang || 'ar';
  Team.getAll(lang, (err, results) => {
    if (err) {
      console.error('Error in getTeam:', err);
      return res.status(500).json({ error: 'خطأ داخلي في الخادم' });
    }
    // Prepend the base URL to the photo path if it exists
    const membersWithPhotos = results.map(member => ({
      ...member,
      photo: member.photo ? `http://localhost:5000/uploads/${member.photo}` : null,
    }));
    res.json(membersWithPhotos);
  });
};

exports.createMember = (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error in createMember:', err);
      return res.status(400).json({ error: err.message });
    } else if (err) {
      console.error('Unknown error in createMember upload:', err);
      return res.status(500).json({ error: err.message || 'فشل تحميل الصورة' });
    }

    const { name, position, language, socials: socialsJson } = req.body; // Get socials as JSON string
    const photo = req.file ? req.file.filename : null;

    if (!name || !position || !language) {
      if (photo) {
        fs.unlink(path.join(uploadDir, photo), (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting uploaded file:', unlinkErr);
        });
      }
      return res.status(400).json({ error: 'الاسم والوظيفة واللغة مطلوبة' });
    }

    let socials = [];
    try {
      socials = socialsJson ? JSON.parse(socialsJson) : [];
      // Filter out empty social links
      socials = socials.filter(s => s.url && s.url.trim() !== '');
    } catch (parseErr) {
      console.error('Error parsing social links JSON:', parseErr);
      return res.status(400).json({ error: 'تنسيق روابط التواصل الاجتماعي غير صالح' });
    }

    Team.create({ name, position, photo, language }, (dbErr, result) => {
      if (dbErr) {
        console.error('Error in createMember database operation:', dbErr);
        if (photo) {
          fs.unlink(path.join(uploadDir, photo), (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting uploaded file due to DB error:', unlinkErr);
          });
        }
        return res.status(500).json({ error: 'فشل إضافة عضو الفريق' });
      }

      const teamId = result.insertId;
      // Add social links to team_socials table
      if (socials.length > 0) {
        let socialPromises = socials.map(social => {
          return new Promise((resolve, reject) => {
            Team.addSocial(teamId, social.url, social.platform || null, (socialErr) => {
              if (socialErr) {
                console.error('Error adding social link:', socialErr);
                reject(socialErr);
              } else {
                resolve();
              }
            });
          });
        });

        Promise.all(socialPromises)
          .then(() => {
            res.json({ message: 'تمت الإضافة بنجاح' });
          })
          .catch(addSocialErr => {
            console.error('Error adding social links after member creation:', addSocialErr);
            // Optionally, rollback member creation if social links fail
            res.status(500).json({ error: 'تمت إضافة العضو ولكن فشل إضافة روابط التواصل الاجتماعي' });
          });
      } else {
        res.json({ message: 'تمت الإضافة بنجاح' });
      }
    });
  });
};

exports.updateMember = (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error in updateMember:', err);
      return res.status(400).json({ error: err.message });
    } else if (err) {
      console.error('Unknown error in updateMember upload:', err);
      return res.status(500).json({ error: err.message || 'فشل تحميل الصورة' });
    }

    const { id } = req.params;
    const { name, position, language, socials: socialsJson, existingPhoto } = req.body;
    const newPhotoFilename = req.file ? req.file.filename : null;

    if (!name || !position || !language) {
      if (newPhotoFilename) {
        fs.unlink(path.join(uploadDir, newPhotoFilename), (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting new uploaded file:', unlinkErr);
        });
      }
      return res.status(400).json({ error: 'الاسم والوظيفة واللغة مطلوبة' });
    }

    let socials = [];
    try {
      socials = socialsJson ? JSON.parse(socialsJson) : [];
      socials = socials.filter(s => s.url && s.url.trim() !== '');
    } catch (parseErr) {
      console.error('Error parsing social links JSON:', parseErr);
      return res.status(400).json({ error: 'تنسيق روابط التواصل الاجتماعي غير صالح' });
    }

    let photoToSave = existingPhoto;
    if (newPhotoFilename) {
      photoToSave = newPhotoFilename;
      Team.getById(id, (getErr, oldMember) => {
        if (getErr) {
          console.error('Error fetching old member data for photo deletion:', getErr);
        } else if (oldMember && oldMember.photo && oldMember.photo !== newPhotoFilename) {
          fs.unlink(path.join(uploadDir, oldMember.photo), (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting old photo file:', unlinkErr);
          });
        }
      });
    } else if (req.body.photo === '') {
      photoToSave = null;
      Team.getById(id, (getErr, oldMember) => {
        if (getErr) {
          console.error('Error fetching old member data for photo removal:', getErr);
        } else if (oldMember && oldMember.photo) {
          fs.unlink(path.join(uploadDir, oldMember.photo), (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting old photo file during removal:', unlinkErr);
          });
        }
      });
    }

    Team.update(id, { name, position, photo: photoToSave, language }, (dbErr) => {
      if (dbErr) {
        console.error('Error in updateMember database operation:', dbErr);
        if (newPhotoFilename) {
          fs.unlink(path.join(uploadDir, newPhotoFilename), (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting new uploaded file due to DB error:', unlinkErr);
          });
        }
        return res.status(500).json({ error: 'فشل تحديث عضو الفريق' });
      }

      // Delete existing social links and then add new ones
      Team.deleteSocialsByTeamId(id, (deleteSocialsErr) => {
        if (deleteSocialsErr) {
          console.error('Error deleting old social links:', deleteSocialsErr);
          return res.status(500).json({ error: 'فشل تحديث روابط التواصل الاجتماعي' });
        }

        if (socials.length > 0) {
          let socialPromises = socials.map(social => {
            return new Promise((resolve, reject) => {
              Team.addSocial(id, social.url, social.platform || null, (socialErr) => {
                if (socialErr) {
                  console.error('Error adding social link:', socialErr);
                  reject(socialErr);
                } else {
                  resolve();
                }
              });
            });
          });

          Promise.all(socialPromises)
            .then(() => {
              res.json({ message: 'تم التحديث بنجاح' });
            })
            .catch(addSocialErr => {
              console.error('Error adding social links after member update:', addSocialErr);
              res.status(500).json({ error: 'تم تحديث العضو ولكن فشل تحديث روابط التواصل الاجتماعي' });
            });
        } else {
          res.json({ message: 'تم التحديث بنجاح' });
        }
      });
    });
  });
};

exports.deleteMember = (req, res) => {
  const { id } = req.params;
  
  // First, delete associated social links
  Team.deleteSocialsByTeamId(id, (deleteSocialsErr) => {
    if (deleteSocialsErr) {
      console.error('Error deleting social links before member deletion:', deleteSocialsErr);
      return res.status(500).json({ error: 'فشل حذف روابط التواصل الاجتماعي' });
    }

    // Then, get the member to find the photo path
    Team.getById(id, (err, member) => {
      if (err) {
        console.error('Error finding member before delete:', err);
        return res.status(500).json({ error: 'فشل حذف عضو الفريق' });
      }
      if (member && member.photo) {
        const photoPath = path.join(uploadDir, member.photo);
        fs.unlink(photoPath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting photo file:', unlinkErr);
          // Continue to delete from DB even if file deletion fails
          Team.delete(id, (dbErr) => {
            if (dbErr) {
              console.error('Error in deleteMember database operation:', dbErr);
              return res.status(500).json({ error: 'فشل حذف عضو الفريق' });
            }
            res.json({ message: 'تم الحذف بنجاح' });
          });
        });
      } else {
        // If no photo or member not found, just delete from DB
        Team.delete(id, (dbErr) => {
          if (dbErr) {
            console.error('Error in deleteMember database operation (no photo):', dbErr);
            return res.status(500).json({ error: 'فشل حذف عضو الفريق' });
          }
          res.json({ message: 'تم الحذف بنجاح' });
        });
      }
    });
  });
};
