const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const [existing] = await db.execute('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role === 'admin' ? 'admin' : 'customer';

    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || '', assignedRole]
    );

    const token = jwt.sign(
      { user_id: result.insertId, email, name, role: assignedRole },
      process.env.JWT_SECRET || 'wanderlust_secret_key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { user_id: result.insertId, name, email, phone, role: assignedRole }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET || 'wanderlust_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT user_id, name, email, phone, role, created_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    );
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    const userId = req.user.user_id;

    if (password && password.trim().length >= 6) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.execute('UPDATE users SET name = ?, phone = ?, password = ? WHERE user_id = ?', [name, phone, hashedPassword, userId]);
    } else {
      await db.execute('UPDATE users SET name = ?, phone = ? WHERE user_id = ?', [name, phone, userId]);
    }

    const [updated] = await db.execute('SELECT user_id, name, email, phone, role FROM users WHERE user_id = ?', [userId]);
    res.json({ message: 'Profile updated', user: updated[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
