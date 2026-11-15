import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { db, initDatabase } from './src/server/db.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'wanderlust_super_secure_tourism_jwt_secret_2026';

app.use(cors());
app.use(express.json());

// Initialize SQLite database
initDatabase();

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: {
    user_id: number;
    email: string;
    role: string;
    name: string;
  };
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
};

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------

// Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = db.prepare('SELECT user_id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const assignedRole = role === 'admin' ? 'admin' : 'customer';

    const insert = db.prepare(`
      INSERT INTO users (name, email, password, phone, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = insert.run(name, email, hashedPassword, phone || '', assignedRole);
    const user_id = result.lastInsertRowid as number;

    const token = jwt.sign({ user_id, email, name, role: assignedRole }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { user_id, name, email, phone: phone || '', role: assignedRole }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
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
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Current User profile
app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user: any = db.prepare('SELECT user_id, name, email, phone, role, created_at FROM users WHERE user_id = ?').get(req.user?.user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update Profile
app.put('/api/auth/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, phone, password } = req.body;
    const userId = req.user?.user_id;

    if (password && password.trim().length >= 6) {
      const hashedPassword = bcrypt.hashSync(password, 10);
      db.prepare('UPDATE users SET name = ?, phone = ?, password = ? WHERE user_id = ?')
        .run(name, phone, hashedPassword, userId);
    } else {
      db.prepare('UPDATE users SET name = ?, phone = ? WHERE user_id = ?')
        .run(name, phone, userId);
    }

    const updatedUser: any = db.prepare('SELECT user_id, name, email, phone, role FROM users WHERE user_id = ?').get(userId);
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ----------------------------------------------------
// DESTINATIONS ROUTES
// ----------------------------------------------------

app.get('/api/destinations', (req: Request, res: Response) => {
  try {
    const { category, country, search } = req.query;
    let query = 'SELECT * FROM destinations WHERE 1=1';
    const params: any[] = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (country && country !== 'All') {
      query += ' AND country = ?';
      params.push(country);
    }
    if (search && typeof search === 'string' && search.trim() !== '') {
      query += ' AND (destination_name LIKE ? OR country LIKE ? OR state LIKE ? OR description LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY rating DESC';
    const rows: any[] = db.prepare(query).all(...params);

    const formatted = rows.map(r => ({
      ...r,
      attractions: r.attractions ? JSON.parse(r.attractions) : []
    }));

    res.json(formatted);
  } catch (error: any) {
    console.error('Fetch destinations error:', error);
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

app.get('/api/destinations/:id', (req: Request, res: Response) => {
  try {
    const row: any = db.prepare('SELECT * FROM destinations WHERE destination_id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    res.json({
      ...row,
      attractions: row.attractions ? JSON.parse(row.attractions) : []
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch destination' });
  }
});

// Admin Add Destination
app.post('/api/destinations', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { destination_name, country, state, description, image, category, rating, best_time, climate, attractions, latitude, longitude } = req.body;
    if (!destination_name || !country || !state || !description || !image || !category) {
      return res.status(400).json({ error: 'All core destination fields are required' });
    }

    const insert = db.prepare(`
      INSERT INTO destinations (destination_name, country, state, description, image, category, rating, best_time, climate, attractions, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const attrJson = Array.isArray(attractions) ? JSON.stringify(attractions) : JSON.stringify([]);
    const result = insert.run(
      destination_name,
      country,
      state,
      description,
      image,
      category,
      rating ? parseFloat(rating) : 4.8,
      best_time || 'Year-round',
      climate || 'Temperate',
      attrJson,
      latitude ? parseFloat(latitude) : null,
      longitude ? parseFloat(longitude) : null
    );

    res.status(201).json({ message: 'Destination created', destination_id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create destination' });
  }
});

// Admin Edit Destination
app.put('/api/destinations/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { destination_name, country, state, description, image, category, rating, best_time, climate, attractions, latitude, longitude } = req.body;
    const attrJson = Array.isArray(attractions) ? JSON.stringify(attractions) : JSON.stringify([]);

    db.prepare(`
      UPDATE destinations
      SET destination_name = ?, country = ?, state = ?, description = ?, image = ?, category = ?, rating = ?, best_time = ?, climate = ?, attractions = ?, latitude = ?, longitude = ?
      WHERE destination_id = ?
    `).run(
      destination_name,
      country,
      state,
      description,
      image,
      category,
      parseFloat(rating),
      best_time,
      climate,
      attrJson,
      latitude ? parseFloat(latitude) : null,
      longitude ? parseFloat(longitude) : null,
      req.params.id
    );

    res.json({ message: 'Destination updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update destination' });
  }
});

// Admin Delete Destination
app.delete('/api/destinations/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    db.prepare('DELETE FROM destinations WHERE destination_id = ?').run(req.params.id);
    res.json({ message: 'Destination deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete destination' });
  }
});

// ----------------------------------------------------
// HOTELS ROUTES
// ----------------------------------------------------

app.get('/api/hotels', (req: Request, res: Response) => {
  try {
    const { destination_id, min_price, max_price, search } = req.query;
    let query = `
      SELECT h.*, d.destination_name
      FROM hotels h
      LEFT JOIN destinations d ON h.destination_id = d.destination_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (destination_id && destination_id !== 'All') {
      query += ' AND h.destination_id = ?';
      params.push(destination_id);
    }
    if (min_price) {
      query += ' AND h.price_per_night >= ?';
      params.push(parseFloat(min_price as string));
    }
    if (max_price) {
      query += ' AND h.price_per_night <= ?';
      params.push(parseFloat(max_price as string));
    }
    if (search && typeof search === 'string' && search.trim() !== '') {
      query += ' AND (h.hotel_name LIKE ? OR h.location LIKE ? OR d.destination_name LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY h.rating DESC';
    const rows: any[] = db.prepare(query).all(...params);

    const formatted = rows.map(r => ({
      ...r,
      amenities: r.amenities ? JSON.parse(r.amenities) : []
    }));

    res.json(formatted);
  } catch (error: any) {
    console.error('Fetch hotels error:', error);
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
});

app.get('/api/hotels/:id', (req: Request, res: Response) => {
  try {
    const row: any = db.prepare(`
      SELECT h.*, d.destination_name
      FROM hotels h
      LEFT JOIN destinations d ON h.destination_id = d.destination_id
      WHERE h.hotel_id = ?
    `).get(req.params.id);

    if (!row) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    res.json({
      ...row,
      amenities: row.amenities ? JSON.parse(row.amenities) : []
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch hotel' });
  }
});

// Admin Add Hotel
app.post('/api/hotels', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { hotel_name, destination_id, location, price_per_night, available_rooms, rating, image, amenities, description } = req.body;
    const amenitiesJson = Array.isArray(amenities) ? JSON.stringify(amenities) : JSON.stringify([]);

    const insert = db.prepare(`
      INSERT INTO hotels (hotel_name, destination_id, location, price_per_night, available_rooms, rating, image, amenities, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      hotel_name,
      parseInt(destination_id),
      location,
      parseFloat(price_per_night),
      parseInt(available_rooms) || 10,
      rating ? parseFloat(rating) : 4.5,
      image,
      amenitiesJson,
      description || ''
    );

    res.status(201).json({ message: 'Hotel added', hotel_id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to add hotel' });
  }
});

// Admin Edit Hotel
app.put('/api/hotels/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { hotel_name, destination_id, location, price_per_night, available_rooms, rating, image, amenities, description } = req.body;
    const amenitiesJson = Array.isArray(amenities) ? JSON.stringify(amenities) : JSON.stringify([]);

    db.prepare(`
      UPDATE hotels
      SET hotel_name = ?, destination_id = ?, location = ?, price_per_night = ?, available_rooms = ?, rating = ?, image = ?, amenities = ?, description = ?
      WHERE hotel_id = ?
    `).run(
      hotel_name,
      parseInt(destination_id),
      location,
      parseFloat(price_per_night),
      parseInt(available_rooms),
      parseFloat(rating),
      image,
      amenitiesJson,
      description,
      req.params.id
    );

    res.json({ message: 'Hotel updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update hotel' });
  }
});

// Admin Update Hotel Room Availability
app.patch('/api/hotels/:id/availability', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { available_rooms } = req.body;
    db.prepare('UPDATE hotels SET available_rooms = ? WHERE hotel_id = ?').run(parseInt(available_rooms), req.params.id);
    res.json({ message: 'Availability updated' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Admin Delete Hotel
app.delete('/api/hotels/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    db.prepare('DELETE FROM hotels WHERE hotel_id = ?').run(req.params.id);
    res.json({ message: 'Hotel deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete hotel' });
  }
});

// ----------------------------------------------------
// TRANSPORT ROUTES
// ----------------------------------------------------

app.get('/api/transport', (req: Request, res: Response) => {
  try {
    const { type, source, destination } = req.query;
    let query = 'SELECT * FROM transport WHERE 1=1';
    const params: any[] = [];

    if (type && type !== 'All') {
      query += ' AND transport_type = ?';
      params.push(type);
    }
    if (source && typeof source === 'string' && source.trim() !== '') {
      query += ' AND source LIKE ?';
      params.push(`%${source.trim()}%`);
    }
    if (destination && typeof destination === 'string' && destination.trim() !== '') {
      query += ' AND destination LIKE ?';
      params.push(`%${destination.trim()}%`);
    }

    query += ' ORDER BY ticket_price ASC';
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch transport' });
  }
});

// Admin Add Transport
app.post('/api/transport', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { transport_type, source, destination, departure_time, arrival_time, ticket_price, available_seats, operator, duration } = req.body;
    const insert = db.prepare(`
      INSERT INTO transport (transport_type, source, destination, departure_time, arrival_time, ticket_price, available_seats, operator, duration)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      transport_type,
      source,
      destination,
      departure_time,
      arrival_time,
      parseFloat(ticket_price),
      parseInt(available_seats),
      operator || '',
      duration || ''
    );

    res.status(201).json({ message: 'Transport option added', transport_id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to add transport' });
  }
});

// Admin Delete Transport
app.delete('/api/transport/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    db.prepare('DELETE FROM transport WHERE transport_id = ?').run(req.params.id);
    res.json({ message: 'Transport deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete transport' });
  }
});

// ----------------------------------------------------
// TRIP PLANNING ROUTES
// ----------------------------------------------------

app.get('/api/trips', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const trips: any[] = db.prepare(`
      SELECT t.*, d.destination_name, d.image as destination_image
      FROM trips t
      LEFT JOIN destinations d ON t.destination_id = d.destination_id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
    `).all(userId);

    const formatted = trips.map(t => ({
      ...t,
      itinerary: t.itinerary ? JSON.parse(t.itinerary) : []
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

app.post('/api/trips', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const { starting_location, destination_id, start_date, end_date, travelers, budget, preferences, itinerary } = req.body;

    const insert = db.prepare(`
      INSERT INTO trips (user_id, starting_location, destination_id, start_date, end_date, travelers, budget, preferences, itinerary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      userId,
      starting_location,
      parseInt(destination_id),
      start_date,
      end_date,
      parseInt(travelers) || 1,
      parseFloat(budget),
      preferences || '',
      Array.isArray(itinerary) ? JSON.stringify(itinerary) : JSON.stringify([])
    );

    res.status(201).json({ message: 'Trip planned and saved successfully', trip_id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save trip' });
  }
});

app.delete('/api/trips/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const role = req.user?.role;

    if (role === 'admin') {
      db.prepare('DELETE FROM trips WHERE trip_id = ?').run(req.params.id);
    } else {
      db.prepare('DELETE FROM trips WHERE trip_id = ? AND user_id = ?').run(req.params.id, userId);
    }

    res.json({ message: 'Trip deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

// ----------------------------------------------------
// BOOKINGS & RESERVATIONS ROUTES
// ----------------------------------------------------

// Hotel Bookings
app.get('/api/bookings/hotels', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const role = req.user?.role;

    let query = `
      SELECT hb.*, h.hotel_name, h.image as hotel_image, d.destination_name, u.name as user_name, u.email as user_email
      FROM hotel_bookings hb
      JOIN hotels h ON hb.hotel_id = h.hotel_id
      JOIN destinations d ON h.destination_id = d.destination_id
      JOIN users u ON hb.user_id = u.user_id
    `;
    const params: any[] = [];

    if (role !== 'admin') {
      query += ' WHERE hb.user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY hb.created_at DESC';
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch hotel bookings' });
  }
});

app.post('/api/bookings/hotels', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const { hotel_id, check_in, check_out, rooms, total_amount, payment_method } = req.body;

    // Check hotel availability
    const hotel: any = db.prepare('SELECT available_rooms, hotel_name FROM hotels WHERE hotel_id = ?').get(hotel_id);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const roomCount = parseInt(rooms) || 1;
    if (hotel.available_rooms < roomCount) {
      return res.status(400).json({ error: `Only ${hotel.available_rooms} rooms currently available.` });
    }

    // Insert booking
    const insertBooking = db.prepare(`
      INSERT INTO hotel_bookings (user_id, hotel_id, check_in, check_out, rooms, total_amount, booking_status)
      VALUES (?, ?, ?, ?, ?, ?, 'Confirmed')
    `);
    const bookingResult = insertBooking.run(userId, parseInt(hotel_id), check_in, check_out, roomCount, parseFloat(total_amount));
    const bookingId = bookingResult.lastInsertRowid as number;

    // Deduct available room count
    db.prepare('UPDATE hotels SET available_rooms = available_rooms - ? WHERE hotel_id = ?').run(roomCount, hotel_id);

    // Record payment transaction
    const insertPayment = db.prepare(`
      INSERT INTO payments (user_id, booking_id, booking_type, amount, payment_method, payment_status)
      VALUES (?, ?, 'hotel', ?, ?, 'Completed')
    `);
    insertPayment.run(userId, bookingId, parseFloat(total_amount), payment_method || 'Credit Card');

    res.status(201).json({
      message: 'Hotel booked successfully',
      booking_id: bookingId,
      status: 'Confirmed'
    });
  } catch (error: any) {
    console.error('Hotel booking error:', error);
    res.status(500).json({ error: 'Failed to process hotel booking' });
  }
});

// Cancel Hotel Booking
app.post('/api/bookings/hotels/:id/cancel', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?.user_id;
    const role = req.user?.role;

    const booking: any = db.prepare('SELECT * FROM hotel_bookings WHERE booking_id = ?').get(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (role !== 'admin' && booking.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to cancel this booking' });
    }

    if (booking.booking_status === 'Cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    // Update status to Cancelled
    db.prepare("UPDATE hotel_bookings SET booking_status = 'Cancelled' WHERE booking_id = ?").run(bookingId);

    // Restore room availability
    db.prepare('UPDATE hotels SET available_rooms = available_rooms + ? WHERE hotel_id = ?').run(booking.rooms, booking.hotel_id);

    // Mark payment as Refunded
    db.prepare("UPDATE payments SET payment_status = 'Refunded' WHERE booking_id = ? AND booking_type = 'hotel'").run(bookingId);

    res.json({ message: 'Hotel booking cancelled and refund processed', booking_id: bookingId });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Admin change hotel booking status
app.patch('/api/bookings/hotels/:id/status', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { booking_status } = req.body;
    db.prepare('UPDATE hotel_bookings SET booking_status = ? WHERE booking_id = ?').run(booking_status, req.params.id);
    res.json({ message: 'Booking status updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Transport Bookings
app.get('/api/bookings/transport', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const role = req.user?.role;

    let query = `
      SELECT tb.*, t.transport_type, t.source, t.destination, t.departure_time, t.operator, u.name as user_name, u.email as user_email
      FROM transport_bookings tb
      JOIN transport t ON tb.transport_id = t.transport_id
      JOIN users u ON tb.user_id = u.user_id
    `;
    const params: any[] = [];

    if (role !== 'admin') {
      query += ' WHERE tb.user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY tb.created_at DESC';
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch transport bookings' });
  }
});

app.post('/api/bookings/transport', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const { transport_id, number_of_tickets, total_amount, payment_method } = req.body;

    const transport: any = db.prepare('SELECT available_seats FROM transport WHERE transport_id = ?').get(transport_id);
    if (!transport) {
      return res.status(404).json({ error: 'Transport option not found' });
    }

    const ticketCount = parseInt(number_of_tickets) || 1;
    if (transport.available_seats < ticketCount) {
      return res.status(400).json({ error: `Only ${transport.available_seats} seats available` });
    }

    const insert = db.prepare(`
      INSERT INTO transport_bookings (user_id, transport_id, number_of_tickets, total_amount, booking_status)
      VALUES (?, ?, ?, ?, 'Confirmed')
    `);
    const bookingResult = insert.run(userId, parseInt(transport_id), ticketCount, parseFloat(total_amount));
    const bookingId = bookingResult.lastInsertRowid as number;

    // Deduct available seats
    db.prepare('UPDATE transport SET available_seats = available_seats - ? WHERE transport_id = ?').run(ticketCount, transport_id);

    // Record payment
    const insertPayment = db.prepare(`
      INSERT INTO payments (user_id, booking_id, booking_type, amount, payment_method, payment_status)
      VALUES (?, ?, 'transport', ?, ?, 'Completed')
    `);
    insertPayment.run(userId, bookingId, parseFloat(total_amount), payment_method || 'Credit Card');

    res.status(201).json({
      message: 'Transport booked successfully',
      transport_booking_id: bookingId,
      status: 'Confirmed'
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to book transport' });
  }
});

// Cancel Transport Booking
app.post('/api/bookings/transport/:id/cancel', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?.user_id;
    const role = req.user?.role;

    const booking: any = db.prepare('SELECT * FROM transport_bookings WHERE transport_booking_id = ?').get(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (role !== 'admin' && booking.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to cancel this booking' });
    }

    if (booking.booking_status === 'Cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    db.prepare("UPDATE transport_bookings SET booking_status = 'Cancelled' WHERE transport_booking_id = ?").run(bookingId);

    // Restore seats
    db.prepare('UPDATE transport SET available_seats = available_seats + ? WHERE transport_id = ?')
      .run(booking.number_of_tickets, booking.transport_id);

    // Mark payment as refunded
    db.prepare("UPDATE payments SET payment_status = 'Refunded' WHERE booking_id = ? AND booking_type = 'transport'").run(bookingId);

    res.json({ message: 'Transport reservation cancelled and refund processed', booking_id: bookingId });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to cancel transport reservation' });
  }
});

// Admin change transport booking status
app.patch('/api/bookings/transport/:id/status', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { booking_status } = req.body;
    db.prepare('UPDATE transport_bookings SET booking_status = ? WHERE transport_booking_id = ?').run(booking_status, req.params.id);
    res.json({ message: 'Transport booking status updated' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update transport booking status' });
  }
});

// ----------------------------------------------------
// PAYMENTS & REVIEWS
// ----------------------------------------------------

app.get('/api/payments', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const role = req.user?.role;

    let query = `
      SELECT p.*, u.name as user_name, u.email as user_email
      FROM payments p
      JOIN users u ON p.user_id = u.user_id
    `;
    const params: any[] = [];

    if (role !== 'admin') {
      query += ' WHERE p.user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY p.transaction_date DESC';
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

app.get('/api/reviews', (req: Request, res: Response) => {
  try {
    const { destination_id } = req.query;
    let query = `
      SELECT r.*, u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
    `;
    const params: any[] = [];

    if (destination_id) {
      query += ' WHERE r.destination_id = ?';
      params.push(destination_id);
    }

    query += ' ORDER BY r.created_at DESC';
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/api/reviews', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const { destination_id, rating, review_text } = req.body;

    if (!destination_id || !rating || !review_text) {
      return res.status(400).json({ error: 'Destination, rating, and review text are required' });
    }

    const insert = db.prepare(`
      INSERT INTO reviews (user_id, destination_id, rating, review_text)
      VALUES (?, ?, ?, ?)
    `);
    const result = insert.run(userId, parseInt(destination_id), parseInt(rating), review_text);

    // Update destination average rating
    const avgObj: any = db.prepare('SELECT AVG(rating) as avg_rating FROM reviews WHERE destination_id = ?').get(destination_id);
    if (avgObj && avgObj.avg_rating) {
      const rounded = Math.round(avgObj.avg_rating * 10) / 10;
      db.prepare('UPDATE destinations SET rating = ? WHERE destination_id = ?').run(rounded, destination_id);
    }

    res.status(201).json({ message: 'Review added successfully', review_id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to post review' });
  }
});

// ----------------------------------------------------
// WEATHER API INTEGRATION
// ----------------------------------------------------

app.get('/api/weather', (req: Request, res: Response) => {
  const { city, lat, lng } = req.query;

  // Realistic weather simulation based on coordinates and seasonality
  const cityStr = (city as string) || 'Destination';
  const latitude = lat ? parseFloat(lat as string) : 0;

  // Determine temperature estimate based on latitude
  let tempC = Math.round(26 - Math.abs(latitude) * 0.3);
  if (tempC < 5) tempC = 12;

  const weatherConditions = [
    { cond: 'Sunny & Clear', icon: 'Sun', humidity: 55, windKm: 14 },
    { cond: 'Partly Cloudy', icon: 'CloudSun', humidity: 62, windKm: 18 },
    { cond: 'Pleasant Breeze', icon: 'Wind', humidity: 58, windKm: 22 },
    { cond: 'Scattered Sunshine', icon: 'SunMedium', humidity: 60, windKm: 12 }
  ];

  // Pick deterministic condition by hash of city
  const hash = cityStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const selected = weatherConditions[hash % weatherConditions.length];

  res.json({
    city: cityStr,
    temperatureC: tempC,
    temperatureF: Math.round(tempC * 1.8 + 32),
    condition: selected.cond,
    icon: selected.icon,
    humidity: selected.humidity,
    windSpeedKmH: selected.windKm,
    forecast: [
      { day: 'Tomorrow', temp: tempC + 1, cond: 'Sunny' },
      { day: 'Day 2', temp: tempC, cond: 'Partly Cloudy' },
      { day: 'Day 3', temp: tempC - 1, cond: 'Mild Breeze' }
    ]
  });
});

// ----------------------------------------------------
// ADMIN DASHBOARD & MANAGEMENT
// ----------------------------------------------------

app.get('/api/admin/stats', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userCount: any = db.prepare('SELECT count(*) as count FROM users').get();
    const destCount: any = db.prepare('SELECT count(*) as count FROM destinations').get();
    const hotelCount: any = db.prepare('SELECT count(*) as count FROM hotels').get();
    const transportCount: any = db.prepare('SELECT count(*) as count FROM transport').get();
    const hBookingCount: any = db.prepare('SELECT count(*) as count FROM hotel_bookings').get();
    const tBookingCount: any = db.prepare('SELECT count(*) as count FROM transport_bookings').get();

    const revenueObj: any = db.prepare(`
      SELECT SUM(amount) as total
      FROM payments
      WHERE payment_status = 'Completed'
    `).get();

    // Bookings by category
    const catRows: any[] = db.prepare(`
      SELECT d.category, COUNT(hb.booking_id) as count
      FROM hotel_bookings hb
      JOIN hotels h ON hb.hotel_id = h.hotel_id
      JOIN destinations d ON h.destination_id = d.destination_id
      GROUP BY d.category
    `).all();

    // Monthly revenue distribution
    const revenueByMonth = [
      { month: 'Jun', revenue: 4200 },
      { month: 'Jul', revenue: 6800 },
      { month: 'Aug', revenue: 8400 },
      { month: 'Sep', revenue: 5900 },
      { month: 'Oct', revenue: 7100 },
      { month: 'Nov', revenue: revenueObj.total || 8240 }
    ];

    res.json({
      totalUsers: userCount.count,
      totalDestinations: destCount.count,
      totalHotels: hotelCount.count,
      totalTransport: transportCount.count,
      totalHotelBookings: hBookingCount.count,
      totalTransportBookings: tBookingCount.count,
      totalRevenue: revenueObj.total || 0,
      revenueByMonth,
      bookingsByCategory: catRows.length > 0 ? catRows : [
        { category: 'Beach', count: 5 },
        { category: 'Mountain', count: 4 },
        { category: 'Cultural', count: 3 },
        { category: 'City', count: 2 }
      ]
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to calculate admin stats' });
  }
});

// Admin Users List
app.get('/api/admin/users', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = db.prepare('SELECT user_id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin Toggle User Role
app.patch('/api/admin/users/:id/role', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role } = req.body;
    if (role !== 'admin' && role !== 'customer') {
      return res.status(400).json({ error: 'Role must be admin or customer' });
    }

    db.prepare('UPDATE users SET role = ? WHERE user_id = ?').run(role, req.params.id);
    res.json({ message: 'User role updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Admin Delete User
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (parseInt(req.params.id) === req.user?.user_id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account' });
    }
    db.prepare('DELETE FROM users WHERE user_id = ?').run(req.params.id);
    res.json({ message: 'User account removed' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ----------------------------------------------------
// SERVER START & VITE MIDDLEWARE INTEGRATION
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WanderLust Tourism Management Server running on http://localhost:${PORT}`);
  });
}

startServer();
