const db = require('../config/db');

// Hotel Bookings
exports.getHotelBookings = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const role = req.user.role;

    let query = `
      SELECT hb.*, h.hotel_name, h.image as hotel_image, d.destination_name, u.name as user_name, u.email as user_email
      FROM hotel_bookings hb
      JOIN hotels h ON hb.hotel_id = h.hotel_id
      JOIN destinations d ON h.destination_id = d.destination_id
      JOIN users u ON hb.user_id = u.user_id
    `;
    const params = [];

    if (role !== 'admin') {
      query += ' WHERE hb.user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY hb.created_at DESC';
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hotel bookings' });
  }
};

exports.createHotelBooking = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { hotel_id, check_in, check_out, rooms, total_amount, payment_method } = req.body;

    // Check hotel availability
    const [hotels] = await db.execute('SELECT available_rooms FROM hotels WHERE hotel_id = ?', [hotel_id]);
    if (hotels.length === 0) return res.status(404).json({ error: 'Hotel not found' });

    const roomCount = parseInt(rooms) || 1;
    if (hotels[0].available_rooms < roomCount) {
      return res.status(400).json({ error: `Only ${hotels[0].available_rooms} rooms available.` });
    }

    // Insert booking
    const [bookingResult] = await db.execute(
      `INSERT INTO hotel_bookings (user_id, hotel_id, check_in, check_out, rooms, total_amount, booking_status)
       VALUES (?, ?, ?, ?, ?, ?, 'Confirmed')`,
      [userId, hotel_id, check_in, check_out, roomCount, total_amount]
    );

    // Update availability
    await db.execute('UPDATE hotels SET available_rooms = available_rooms - ? WHERE hotel_id = ?', [roomCount, hotel_id]);

    // Record payment
    await db.execute(
      `INSERT INTO payments (user_id, booking_id, booking_type, amount, payment_method, payment_status)
       VALUES (?, ?, 'hotel', ?, ?, 'Completed')`,
      [userId, bookingResult.insertId, total_amount, payment_method || 'Credit Card']
    );

    res.status(201).json({ message: 'Hotel booking confirmed', booking_id: bookingResult.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Booking failed' });
  }
};

exports.cancelHotelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.user_id;
    const role = req.user.role;

    const [bookings] = await db.execute('SELECT * FROM hotel_bookings WHERE booking_id = ?', [bookingId]);
    if (bookings.length === 0) return res.status(404).json({ error: 'Booking not found' });

    const booking = bookings[0];
    if (role !== 'admin' && booking.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to cancel this booking' });
    }

    await db.execute("UPDATE hotel_bookings SET booking_status = 'Cancelled' WHERE booking_id = ?", [bookingId]);
    await db.execute('UPDATE hotels SET available_rooms = available_rooms + ? WHERE hotel_id = ?', [booking.rooms, booking.hotel_id]);
    await db.execute("UPDATE payments SET payment_status = 'Refunded' WHERE booking_id = ? AND booking_type = 'hotel'", [bookingId]);

    res.json({ message: 'Booking cancelled and refund recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Cancellation failed' });
  }
};

// Transport Bookings
exports.getTransportBookings = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const role = req.user.role;

    let query = `
      SELECT tb.*, t.transport_type, t.source, t.destination, t.departure_time, t.operator, u.name as user_name, u.email as user_email
      FROM transport_bookings tb
      JOIN transport t ON tb.transport_id = t.transport_id
      JOIN users u ON tb.user_id = u.user_id
    `;
    const params = [];

    if (role !== 'admin') {
      query += ' WHERE tb.user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY tb.created_at DESC';
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transport bookings' });
  }
};

exports.createTransportBooking = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { transport_id, number_of_tickets, total_amount, payment_method } = req.body;

    const [transports] = await db.execute('SELECT available_seats FROM transport WHERE transport_id = ?', [transport_id]);
    if (transports.length === 0) return res.status(404).json({ error: 'Transport option not found' });

    const ticketCount = parseInt(number_of_tickets) || 1;
    if (transports[0].available_seats < ticketCount) {
      return res.status(400).json({ error: `Only ${transports[0].available_seats} seats available` });
    }

    const [result] = await db.execute(
      `INSERT INTO transport_bookings (user_id, transport_id, number_of_tickets, total_amount, booking_status)
       VALUES (?, ?, ?, ?, 'Confirmed')`,
      [userId, transport_id, ticketCount, total_amount]
    );

    await db.execute('UPDATE transport SET available_seats = available_seats - ? WHERE transport_id = ?', [ticketCount, transport_id]);

    await db.execute(
      `INSERT INTO payments (user_id, booking_id, booking_type, amount, payment_method, payment_status)
       VALUES (?, ?, 'transport', ?, ?, 'Completed')`,
      [userId, result.insertId, total_amount, payment_method || 'Credit Card']
    );

    res.status(201).json({ message: 'Transport booking confirmed', transport_booking_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Transport booking failed' });
  }
};

exports.cancelTransportBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.user_id;
    const role = req.user.role;

    const [bookings] = await db.execute('SELECT * FROM transport_bookings WHERE transport_booking_id = ?', [bookingId]);
    if (bookings.length === 0) return res.status(404).json({ error: 'Booking not found' });

    const booking = bookings[0];
    if (role !== 'admin' && booking.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to cancel this booking' });
    }

    await db.execute("UPDATE transport_bookings SET booking_status = 'Cancelled' WHERE transport_booking_id = ?", [bookingId]);
    await db.execute('UPDATE transport SET available_seats = available_seats + ? WHERE transport_id = ?', [booking.number_of_tickets, booking.transport_id]);
    await db.execute("UPDATE payments SET payment_status = 'Refunded' WHERE booking_id = ? AND booking_type = 'transport'", [bookingId]);

    res.json({ message: 'Transport reservation cancelled' });
  } catch (error) {
    res.status(500).json({ error: 'Cancellation failed' });
  }
};
