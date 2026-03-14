const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'talentos-super-secret-jwt-key';

// Mock HR user for demonstration purposes. In a real application, this would be in the database.
const createMockHrUser = async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  return {
    email: 'admin.hr@companyname.com',
    password: hashedPassword,
    role: 'HR'
  };
};

let mockHrUser = null;
createMockHrUser().then(user => { mockHrUser = user; });

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required.' });
    }

    // Validate email format (*.hr@companyname.com)
    const emailRegex = /^[a-zA-Z0-9._%+-]+\.hr@companyname\.com$/i;
    if (!emailRegex.test(email)) {
      return res.status(403).json({ status: 'error', message: 'Access denied. Only authorized HR personnel can log in.' });
    }

    // In a real application, verify against the DB. Here, we use the mock user.
    if (email !== mockHrUser.email) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, mockHrUser.password);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials.' });
    }

    const payload = {
      user: {
        email: mockHrUser.email,
        role: mockHrUser.role
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          status: 'success',
          token,
          user: {
            email: mockHrUser.email,
            role: mockHrUser.role
          }
        });
      }
    );

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ status: 'error', message: 'Server error during login.' });
  }
});

module.exports = router;
