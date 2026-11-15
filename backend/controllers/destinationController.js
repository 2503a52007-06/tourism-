const db = require('../config/db');

exports.getAllDestinations = async (req, res) => {
  try {
    const { category, country, search } = req.query;
    let query = 'SELECT * FROM destinations WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (country && country !== 'All') {
      query += ' AND country = ?';
      params.push(country);
    }
    if (search && search.trim() !== '') {
      query += ' AND (destination_name LIKE ? OR country LIKE ? OR state LIKE ? OR description LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY rating DESC';
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Destination error:', error);
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
};

exports.getDestinationById = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM destinations WHERE destination_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Destination not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch destination' });
  }
};

exports.createDestination = async (req, res) => {
  try {
    const { destination_name, country, state, description, image, category, rating, best_time, climate, attractions, latitude, longitude } = req.body;
    const attractionsStr = typeof attractions === 'string' ? attractions : JSON.stringify(attractions || []);

    const [result] = await db.execute(
      `INSERT INTO destinations (destination_name, country, state, description, image, category, rating, best_time, climate, attractions, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [destination_name, country, state, description, image, category, rating || 4.8, best_time, climate, attractionsStr, latitude, longitude]
    );

    res.status(201).json({ message: 'Destination created', destination_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create destination' });
  }
};

exports.updateDestination = async (req, res) => {
  try {
    const { destination_name, country, state, description, image, category, rating, best_time, climate, attractions, latitude, longitude } = req.body;
    const attractionsStr = typeof attractions === 'string' ? attractions : JSON.stringify(attractions || []);

    await db.execute(
      `UPDATE destinations SET destination_name=?, country=?, state=?, description=?, image=?, category=?, rating=?, best_time=?, climate=?, attractions=?, latitude=?, longitude=?
       WHERE destination_id=?`,
      [destination_name, country, state, description, image, category, rating, best_time, climate, attractionsStr, latitude, longitude, req.params.id]
    );

    res.json({ message: 'Destination updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update destination' });
  }
};

exports.deleteDestination = async (req, res) => {
  try {
    await db.execute('DELETE FROM destinations WHERE destination_id = ?', [req.params.id]);
    res.json({ message: 'Destination deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete destination' });
  }
};
