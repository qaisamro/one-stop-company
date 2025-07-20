const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));

app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/about', require('./routes/about.routes'));
app.use('/api/services', require('./routes/services.routes'));
app.use('/api/statistics', require('./routes/statistics.routes'));
app.use('/api/team', require('./routes/team.routes'));
app.use('/api/certificates', require('./routes/certificates.routes'));
app.use('/api/blogs', require('./routes/blogs.routes'));
app.use('/api/company-intro', require('./routes/companyIntro.routes'));
app.use('/api/header', require('./routes/header.routes'));
app.use('/api/projects', require('./routes/projects.routes'));
app.use('/api/contacts', require('./routes/contact.routes'));
app.use('/api/features', require('./routes/features.routes'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/story', require('./routes/story.routes'));

app.get('/', (req, res) => {
    res.send('One Stop Company API is running');
});

app.use((req, res) => {
    res.status(404).json({ error: 'المسار غير موجود' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
app.use(cors({
  origin: '*', // أو استبدل * بدومين موقعك الحقيقي لحماية أكثر
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));