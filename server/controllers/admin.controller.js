const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide name, email, and password' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query('SELECT * FROM admins WHERE email = $1', [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    db.query(
      'INSERT INTO admins (name, email, password) VALUES ($1, $2, $3)',
      [name, email, hashedPassword],
      (err2) => {
        if (err2) {
          console.error('Insert error:', err2);
          return res.status(500).json({ error: 'Failed to register user' });
        }

        res.json({ message: 'User registered successfully' });
      }
    );
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  db.query('SELECT * FROM admins WHERE email = $1', [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results.rows[0];
    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    res.json({ message: 'Login successful', token });
  });
};
