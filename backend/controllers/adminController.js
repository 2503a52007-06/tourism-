const db = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const [[users]] = await db.execute('SELECT COUNT(*) as count FROM users');
    const [[destinations]] = await db.execute('SELECT COUNT(*) as count FROM destinations');
    const [[hotels]] = await db.execute('SELECT COUNT(*) as count FROM hotels');
    const [[transport]] = await db.execute('SELECT COUNT(*) as count FROM transport');
    const [[hotelBookings]] = await db.execute('SELECT COUNT(*) as count FROM hotel_bookings');
    const [[transportBookings]] = await db.execute('SELECT COUNT(*) as count FROM transport_bookings');
    const [[revenue]] = await db.execute("SELECT SUM(amount) as total FROM payments WHERE payment_status = 'Completed'");

    const [categoryCounts] = await db.execute(`
      SELECT d.category, COUNT(hb.booking_id) as count
      FROM hotel_bookings hb
      JOIN hotels h ON hb.hotel_id = h.hotel_id
      JOIN destinations d ON h.destination_id = d.destination_id
      GROUP BY d.category
    `);

    res.json({
      totalUsers: users.count,
      totalDestinations: destinations.count,
      totalHotels: hotels.count,
      totalTransport: transport.count,
      totalHotelBookings: hotelBookings.count,
      totalTransportBookings: transportBookings.count,
      totalRevenue: revenue.total || 0,
      bookingsByCategory: categoryCounts,
      revenueByMonth: [
        { month: 'Jun', revenue: 4200 },
        { month: 'Jul', revenue: 6800 },
        { month: 'Aug', revenue: 8400 },
        { month: 'Sep', revenue: 5900 },
        { month: 'Oct', revenue: 7100 },
        { month: 'Nov', revenue: revenue.total || 8240 }
      ]
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve admin stats' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.execute('SELECT user_id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    await db.execute('UPDATE users SET role = ? WHERE user_id = ?', [role, req.params.id]);
    res.json({ message: 'User role updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.user_id) {
      return res.status(400).json({ error: 'Cannot delete current logged-in admin' });
    }
    await db.execute('DELETE FROM users WHERE user_id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
