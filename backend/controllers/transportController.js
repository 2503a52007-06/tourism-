const db = require('../config/db');

exports.getAllTransport = async (req, res) => {
  try {
    const { type, source, destination } = req.query;
    let query = 'SELECT * FROM transport WHERE 1=1';
    const params = [];

    if (type && type !== 'All') {
      query += ' AND transport_type = ?';
      params.push(type);
    }
    if (source && source.trim() !== '') {
      query += ' AND source LIKE ?';
      params.push(`%${source.trim()}%`);
    }
    if (destination && destination.trim() !== '') {
      query += ' AND destination LIKE ?';
      params.push(`%${destination.trim()}%`);
    }

    query += ' ORDER BY ticket_price ASC';
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transport' });
  }
};

exports.createTransport = async (req, res) => {
  try {
    const { transport_type, source, destination, departure_time, arrival_time, ticket_price, available_seats, operator, duration } = req.body;
    const [result] = await db.execute(
      `INSERT INTO transport (transport_type, source, destination, departure_time, arrival_time, ticket_price, available_seats, operator, duration)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [transport_type, source, destination, departure_time, arrival_time, ticket_price, available_seats, operator, duration]
    );
    res.status(201).json({ message: 'Transport added', transport_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add transport' });
  }
};

exports.deleteTransport = async (req, res) => {
  try {
    await db.execute('DELETE FROM transport WHERE transport_id = ?', [req.params.id]);
    res.json({ message: 'Transport deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transport' });
  }
};
