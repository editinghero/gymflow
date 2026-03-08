import express from 'express';
import { query } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.get('/public/businesses/by-code/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const result = await query('SELECT * FROM businesses WHERE access_code = $1', [code]);
    res.json({ data: result.rows[0] || null, error: null });
  } catch (error: any) {
    console.error('Query error');
    res.status(500).json({ data: null, error: { message: 'Query failed' } });
  }
});

router.use(authenticate);

router.get('/:table', async (req: AuthRequest, res) => {
  try {
    const { table } = req.params;
    const queryString = req.url.split('?')[1] || '';
    const params: any[] = [];
    let sql = `SELECT * FROM ${table}`;
    let paramIndex = 1;
    let whereAdded = false;
    let orderClause = '';

    if (queryString) {
      const parts = queryString.split('&');
      
      parts.forEach(part => {
        const [key, value] = part.split('=');
        
        if (key === 'order') {
          const [column, direction] = value.split('.');
          orderClause = ` ORDER BY ${column} ${direction === 'desc' ? 'DESC' : 'ASC'}`;
          return;
        }
        
        if (!value) return;
        
        if (value.startsWith('eq.')) {
          const actualValue = decodeURIComponent(value.substring(3));
          if (!whereAdded) {
            sql += ` WHERE ${key} = $${paramIndex}`;
            whereAdded = true;
          } else {
            sql += ` AND ${key} = $${paramIndex}`;
          }
          params.push(actualValue);
          paramIndex++;
        } else if (value.startsWith('gte.')) {
          const actualValue = decodeURIComponent(value.substring(4));
          if (!whereAdded) {
            sql += ` WHERE ${key} >= $${paramIndex}`;
            whereAdded = true;
          } else {
            sql += ` AND ${key} >= $${paramIndex}`;
          }
          params.push(actualValue);
          paramIndex++;
        } else if (value.startsWith('lte.')) {
          const actualValue = decodeURIComponent(value.substring(4));
          if (!whereAdded) {
            sql += ` WHERE ${key} <= $${paramIndex}`;
            whereAdded = true;
          } else {
            sql += ` AND ${key} <= $${paramIndex}`;
          }
          params.push(actualValue);
          paramIndex++;
        } else if (value.startsWith('gt.')) {
          const actualValue = decodeURIComponent(value.substring(3));
          if (!whereAdded) {
            sql += ` WHERE ${key} > $${paramIndex}`;
            whereAdded = true;
          } else {
            sql += ` AND ${key} > $${paramIndex}`;
          }
          params.push(actualValue);
          paramIndex++;
        } else if (value.startsWith('lt.')) {
          const actualValue = decodeURIComponent(value.substring(3));
          if (!whereAdded) {
            sql += ` WHERE ${key} < $${paramIndex}`;
            whereAdded = true;
          } else {
            sql += ` AND ${key} < $${paramIndex}`;
          }
          params.push(actualValue);
          paramIndex++;
        }
      });
    }

    sql += orderClause;
    const result = await query(sql, params);
    res.json({ data: result.rows, error: null });
  } catch (error: any) {
    console.error('Query error');
    res.status(500).json({ data: null, error: { message: 'Query failed' } });
  }
});

router.post('/:table', async (req: AuthRequest, res) => {
  try {
    const { table } = req.params;
    const data = req.body;

    if (Array.isArray(data)) {
      if (data.length === 0) {
        return res.json({ data: [], error: null });
      }

      const columns = Object.keys(data[0]);
      const results = [];

      for (const row of data) {
        const values = columns.map(col => row[col]);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        const result = await query(sql, values);
        results.push(result.rows[0]);
      }

      res.json({ data: results, error: null });
    } else {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

      const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
      const result = await query(sql, values);

      res.json({ data: result.rows[0], error: null });
    }
  } catch (error: any) {
    console.error('Insert error');
    res.status(500).json({ data: null, error: { message: 'Insert failed' } });
  }
});

router.patch('/:table', async (req: AuthRequest, res) => {
  try {
    const { table } = req.params;
    const data = req.body;
    const queryString = req.url.split('?')[1] || '';

    const updates = Object.entries(data)
      .map(([key], i) => `${key} = $${i + 1}`)
      .join(', ');
    const values = Object.values(data);

    let whereClause = '';
    if (queryString) {
      const parts = queryString.split('&');
      parts.forEach(part => {
        const [key, value] = part.split('=');
        if (value && value.startsWith('eq.')) {
          const actualValue = decodeURIComponent(value.substring(3));
          whereClause = ` WHERE ${key} = $${values.length + 1}`;
          values.push(actualValue);
        }
      });
    }

    const sql = `UPDATE ${table} SET ${updates}${whereClause} RETURNING *`;
    const result = await query(sql, values);

    res.json({ data: result.rows, error: null });
  } catch (error: any) {
    console.error('Update error');
    res.status(500).json({ data: null, error: { message: 'Update failed' } });
  }
});

router.delete('/:table', async (req: AuthRequest, res) => {
  try {
    const { table } = req.params;
    const queryString = req.url.split('?')[1] || '';

    let whereClause = '';
    const params: any[] = [];

    if (queryString) {
      const parts = queryString.split('&');
      parts.forEach(part => {
        const [key, value] = part.split('=');
        if (value && value.startsWith('eq.')) {
          const actualValue = decodeURIComponent(value.substring(3));
          whereClause = ` WHERE ${key} = $1`;
          params.push(actualValue);
        }
      });
    }

    const sql = `DELETE FROM ${table}${whereClause}`;
    await query(sql, params);

    res.json({ data: null, error: null });
  } catch (error: any) {
    console.error('Delete error');
    res.status(500).json({ data: null, error: { message: 'Delete failed' } });
  }
});

export default router;
