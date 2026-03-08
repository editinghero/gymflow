import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ data: null, error: { message: 'User already registered' } });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await query(
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name',
      [email, passwordHash, fullName]
    );

    const user = result.rows[0];

    await query(
      'INSERT INTO profiles (id, email, full_name) VALUES ($1, $2, $3)',
      [user.id, user.email, user.full_name]
    );

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      data: {
        user: { 
          id: user.id, 
          email: user.email, 
          full_name: user.full_name,
          user_metadata: { full_name: user.full_name }
        },
        token,
      },
      error: null,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ data: null, error: { message: error.message || 'Signup failed' } });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      'SELECT id, email, password_hash, full_name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ data: null, error: { message: 'Invalid login credentials' } });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ data: null, error: { message: 'Invalid login credentials' } });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      data: {
        user: { 
          id: user.id, 
          email: user.email, 
          full_name: user.full_name,
          user_metadata: { full_name: user.full_name }
        },
        token,
      },
      error: null,
    });
  } catch (error: any) {
    console.error('Signin error:', error);
    res.status(500).json({ data: null, error: { message: error.message || 'Signin failed' } });
  }
});

export default router;
