const db = require('../config/db');

exports.getAllHotels = async (req, res) => {
  try {
    const { destination_id, search } = req.query;
    let query = `
      SELECT h.*, d.destination_name
      FROM hotels h
      LEFT JOIN destinations d ON h.destination_id = d.destination_id
      WHERE 1=1
    `;
    const params = [];

    if (destination_id && destination_id !== 'All') {
      query += ' AND h.destination_id = ?';
      params.push(destination_id);
    }
    if (search && search.trim() !== '') {
      query += ' AND (h.hotel_name LIKE ? OR h.location LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s);
    }

    query += ' ORDER BY h.rating DESC';
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
};

exports.getHotelById = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT h.*, d.destination_name FROM hotels h LEFT JOIN destinations d ON h.destination_id = d.destination_id WHERE h.hotel_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Hotel not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hotel' });
  }
};

exports.createHotel = async (req, res) => {
  try {
    const { hotel_name, destination_id, location, price_per_night, available_rooms, rating, image, amenities, description } = req.body;
    const amenitiesStr = typeof amenities === 'string' ? amenities : JSON.stringify(amenities || []);

    const [result] = await db.execute(
      `INSERT INTO hotels (hotel_name, destination_id, location, price_per_night, available_rooms, rating, image, amenities, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [hotel_name, destination_id, location, price_per_night, available_rooms || 10, rating || 4.5, image, amenitiesStr, description || '']
    );

    res.status(201).json({ message: 'Hotel added', hotel_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create hotel' });
  }
};

exports.updateHotel = async (req, res) => {
  try {
    const { hotel_name, destination_id, location, price_per_night, available_rooms, rating, image, amenities, description } = req.body;
    const amenitiesStr = typeof amenities === 'string' ? amenities : JSON.stringify(amenities || []);

    await db.execute(
      `UPDATE hotels SET hotel_name=?, destination_id=?, location=?, price_per_night=?, available_rooms=?, rating=?, image=?, amenities=?, description=?
       WHERE hotel_id=?`,
      [hotel_name, destination_id, location, price_per_night, available_rooms, rating, image, amenitiesStr, description, req.params.id]
    );

    res.json({ message: 'Hotel updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update hotel' });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { available_rooms } = req.body;
    await db.execute('UPDATE hotels SET available_rooms = ? WHERE hotel_id = ?', [available_rooms, req.params.id]);
    res.json({ message: 'Availability updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update availability' });
  }
};

exports.deleteHotel = async (req, res) => {
  try {
    await db.execute('DELETE FROM hotels WHERE hotel_id = ?', [req.params.id]);
    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete hotel' });
  }
};
