import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'tourism_management.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // Create tables according to MySQL relational specifications
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS destinations (
      destination_id INTEGER PRIMARY KEY AUTOINCREMENT,
      destination_name TEXT NOT NULL,
      country TEXT NOT NULL,
      state TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      category TEXT NOT NULL,
      rating REAL DEFAULT 4.8,
      best_time TEXT,
      climate TEXT,
      attractions TEXT,
      latitude REAL,
      longitude REAL
    );

    CREATE TABLE IF NOT EXISTS hotels (
      hotel_id INTEGER PRIMARY KEY AUTOINCREMENT,
      hotel_name TEXT NOT NULL,
      destination_id INTEGER NOT NULL,
      location TEXT NOT NULL,
      price_per_night REAL NOT NULL,
      available_rooms INTEGER NOT NULL,
      rating REAL DEFAULT 4.5,
      image TEXT NOT NULL,
      amenities TEXT,
      description TEXT,
      FOREIGN KEY (destination_id) REFERENCES destinations (destination_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS trips (
      trip_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      starting_location TEXT NOT NULL,
      destination_id INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      travelers INTEGER NOT NULL DEFAULT 1,
      budget REAL NOT NULL,
      preferences TEXT,
      itinerary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
      FOREIGN KEY (destination_id) REFERENCES destinations (destination_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS hotel_bookings (
      booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      hotel_id INTEGER NOT NULL,
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      rooms INTEGER NOT NULL DEFAULT 1,
      total_amount REAL NOT NULL,
      booking_status TEXT NOT NULL DEFAULT 'Confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
      FOREIGN KEY (hotel_id) REFERENCES hotels (hotel_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transport (
      transport_id INTEGER PRIMARY KEY AUTOINCREMENT,
      transport_type TEXT NOT NULL,
      source TEXT NOT NULL,
      destination TEXT NOT NULL,
      departure_time TEXT NOT NULL,
      arrival_time TEXT NOT NULL,
      ticket_price REAL NOT NULL,
      available_seats INTEGER NOT NULL,
      operator TEXT,
      duration TEXT
    );

    CREATE TABLE IF NOT EXISTS transport_bookings (
      transport_booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      transport_id INTEGER NOT NULL,
      number_of_tickets INTEGER NOT NULL DEFAULT 1,
      total_amount REAL NOT NULL,
      booking_status TEXT NOT NULL DEFAULT 'Confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
      FOREIGN KEY (transport_id) REFERENCES transport (transport_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
      payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      booking_id INTEGER NOT NULL,
      booking_type TEXT NOT NULL DEFAULT 'hotel',
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'Completed',
      transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      review_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      destination_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      review_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
      FOREIGN KEY (destination_id) REFERENCES destinations (destination_id) ON DELETE CASCADE
    );
  `);

  // Seed sample data if empty
  const userCount = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  console.log('Seeding initial tourism management database records...');

  const adminPassword = bcrypt.hashSync('admin123', 10);
  const userPassword = bcrypt.hashSync('traveler123', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, phone, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertUser.run('Super Admin', 'admin@wanderlust.com', adminPassword, '+1 (555) 019-2834', 'admin');
  insertUser.run('Sarah Jenkins', 'traveler@wanderlust.com', userPassword, '+1 (555) 482-9102', 'customer');
  insertUser.run('Marco Rossi', 'marco@example.com', userPassword, '+39 02 8845 1200', 'customer');

  const insertDest = db.prepare(`
    INSERT INTO destinations (destination_name, country, state, description, image, category, rating, best_time, climate, attractions, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const dests = [
    {
      name: 'Bali Island Paradise',
      country: 'Indonesia',
      state: 'Bali',
      desc: 'Known as the Island of the Gods, Bali captivates with dramatic volcanoes, lush terraced rice fields, spiritual temples, and vibrant coastal beaches.',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
      category: 'Beach',
      rating: 4.9,
      best_time: 'April to October',
      climate: 'Tropical (26°C - 31°C)',
      attractions: JSON.stringify(['Uluwatu Temple', 'Tegallalang Rice Terraces', 'Seminyak Beach', 'Mount Batur Sunrise Hike']),
      lat: -8.4095,
      lng: 115.1889
    },
    {
      name: 'Swiss Alpine Wonder',
      country: 'Switzerland',
      state: 'Bernese Oberland',
      desc: 'Breathtaking peaks, crystalline turquoise lakes, world-class ski slopes, and charming car-free villages surrounded by the Swiss Alps.',
      image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
      category: 'Mountain',
      rating: 4.95,
      best_time: 'June to September & Dec to March',
      climate: 'Alpine (15°C summer / -3°C winter)',
      attractions: JSON.stringify(['Jungfraujoch Top of Europe', 'Lake Brienz', 'Grindelwald First', 'Lauterbrunnen Valley']),
      lat: 46.5772,
      lng: 7.9084
    },
    {
      name: 'Kyoto Cultural Heritage',
      country: 'Japan',
      state: 'Kansai',
      desc: 'The cultural heart of Japan boasting thousands of classical Buddhist temples, serene Zen rock gardens, imperial palaces, and geisha districts.',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      category: 'Cultural',
      rating: 4.88,
      best_time: 'March to May & Oct to Nov',
      climate: 'Temperate (18°C - 24°C)',
      attractions: JSON.stringify(['Fushimi Inari Shrine', 'Kinkaku-ji (Golden Pavilion)', 'Arashiyama Bamboo Grove', 'Gion Historic District']),
      lat: 35.0116,
      lng: 135.7681
    },
    {
      name: 'Santorini Sunset Caldera',
      country: 'Greece',
      state: 'Cyclades',
      desc: 'Iconic whitewashed cubic houses perched on soaring cliff edges overlooking the cerulean Aegean Sea, famous for mesmerizing sunsets and volcanic beaches.',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
      category: 'Beach',
      rating: 4.85,
      best_time: 'May to October',
      climate: 'Mediterranean (22°C - 29°C)',
      attractions: JSON.stringify(['Oia Sunset Point', 'Red Beach Akrotiri', 'Fira to Oia Caldera Trail', 'Santo Wines Winery']),
      lat: 36.3932,
      lng: 25.4615
    },
    {
      name: 'Serengeti Wildlife Safari',
      country: 'Tanzania',
      state: 'Mara',
      desc: 'Vast golden plains hosting the annual Great Migration of over two million wildebeest, zebras, and apex predators across untamed African savanna.',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
      category: 'Wildlife',
      rating: 4.96,
      best_time: 'June to October',
      climate: 'Savanna (20°C - 28°C)',
      attractions: JSON.stringify(['Great Migration River Crossing', 'Ngorongoro Crater', 'Hot Air Balloon Safari', 'Seronera Valley']),
      lat: -2.3333,
      lng: 34.8333
    },
    {
      name: 'Parisian Arts & Romance',
      country: 'France',
      state: 'Île-de-France',
      desc: 'The global epicenter of art, fashion, gastronomy, and architectural grandeur along the historic banks of the romantic Seine River.',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      category: 'City',
      rating: 4.82,
      best_time: 'April to June & Sept to Nov',
      climate: 'Oceanic (16°C - 23°C)',
      attractions: JSON.stringify(['Eiffel Tower', 'Louvre Museum', 'Cathédrale Notre-Dame', 'Montmartre & Sacré-Cœur']),
      lat: 48.8566,
      lng: 2.3522
    },
    {
      name: 'Queenstown Adventure Capital',
      country: 'New Zealand',
      state: 'Otago',
      desc: 'Nestled beside Lake Wakatipu beneath the dramatic Remarkables mountain range, world-renowned for bungee jumping, jet boating, and fjord trekking.',
      image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1200&q=80',
      category: 'Adventure',
      rating: 4.92,
      best_time: 'December to February (Summer) & July to August (Ski)',
      climate: 'Temperate (10°C - 22°C)',
      attractions: JSON.stringify(['Milford Sound Cruise', 'Nevis Bungy Jump', 'Skyline Gondola & Luge', 'Shotover Jet Canyon']),
      lat: -45.0312,
      lng: 168.6626
    },
    {
      name: 'Pyramids & Nile Wonders',
      country: 'Egypt',
      state: 'Giza & Cairo',
      desc: 'One of humankind’s greatest ancient civilizations with towering stone pyramids, the Great Sphinx, the Khan el-Khalili bazaar, and luxury Nile river cruises.',
      image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80',
      category: 'Cultural',
      rating: 4.79,
      best_time: 'October to April',
      climate: 'Subtropical Desert (20°C - 28°C)',
      attractions: JSON.stringify(['Great Pyramid of Giza', 'The Grand Egyptian Museum', 'Karnak Temple Luxor', 'Valley of the Kings']),
      lat: 29.9792,
      lng: 31.1342
    }
  ];

  for (const d of dests) {
    insertDest.run(d.name, d.country, d.state, d.desc, d.image, d.category, d.rating, d.best_time, d.climate, d.attractions, d.lat, d.lng);
  }

  // Seed Hotels
  const insertHotel = db.prepare(`
    INSERT INTO hotels (hotel_name, destination_id, location, price_per_night, available_rooms, rating, image, amenities, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const hotels = [
    {
      name: 'Ayana Resort & Rock Bar',
      dest_id: 1,
      loc: 'Jimbaran Coast, Bali',
      price: 240,
      rooms: 18,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      amenities: JSON.stringify(['Oceanfront Pool', 'Rock Bar Access', 'Spa & Thalassotherapy', 'Free High-speed WiFi', 'Airport Shuttle']),
      desc: 'World-renowned cliffside luxury sanctuary with sweeping views of the Indian Ocean and legendary sunset dining.'
    },
    {
      name: 'Ubud Hanging Gardens Eco Villa',
      dest_id: 1,
      loc: 'Payangan, Ubud, Bali',
      price: 310,
      rooms: 9,
      rating: 4.95,
      image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
      amenities: JSON.stringify(['Infinity Valley Pool', 'Private Butler', 'Organic Farm Restaurant', 'Morning Yoga Pavilion']),
      desc: 'Award-winning twin-tiered cascading pool hanging over the Ayung River valley rainforest canopy.'
    },
    {
      name: 'The Chedi Andermatt Alpine Lodge',
      dest_id: 2,
      loc: 'Gotthard Pass, Switzerland',
      price: 520,
      rooms: 12,
      rating: 4.92,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      amenities: JSON.stringify(['Ski-in / Ski-out', 'Thermal Spa & Hydrotherapy', 'Michelin-starred Japanese Dining', 'Wine & Cigar Lounge']),
      desc: 'Masterful blend of Swiss alpine chalet warmth with Asian architectural elegance and 2,400-sqm wellness oasis.'
    },
    {
      name: 'Grindelwald Mountain Chalet',
      dest_id: 2,
      loc: 'Dorfstrasse, Grindelwald, Switzerland',
      price: 280,
      rooms: 15,
      rating: 4.75,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      amenities: JSON.stringify(['Eiger View Balconies', 'Sauna & Steam Bath', 'Traditional Fondue Stübli', 'Ski Storage']),
      desc: 'Cozy timber lodge situated directly facing the formidable Eiger North Face with direct cable car access.'
    },
    {
      name: 'Hoshinoya Kyoto River Sanctuary',
      dest_id: 3,
      loc: 'Arashiyama, Kyoto, Japan',
      price: 650,
      rooms: 6,
      rating: 4.97,
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      amenities: JSON.stringify(['Private Boat Arrival', 'Kaiseki Culinary Journey', 'Tea Ceremony Pavilion', 'Tatami Suites']),
      desc: 'A preserved riverside pavilion accessible only by traditional wooden boat along the emerald Oi River.'
    },
    {
      name: 'Canaves Oia Suites & Infinity Pools',
      dest_id: 4,
      loc: 'Oia Cliff, Santorini, Greece',
      price: 490,
      rooms: 8,
      rating: 4.93,
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
      amenities: JSON.stringify(['Caldera View Plunge Pool', 'Gourmet Wine Cellar', 'Champagne Breakfast', 'Helicopter Transfer']),
      desc: 'Carved seamlessly into the dramatic volcanic cliffside with private sea-facing infinity plunge pools.'
    },
    {
      name: 'Four Seasons Safari Lodge Serengeti',
      dest_id: 5,
      loc: 'Central Serengeti, Tanzania',
      price: 880,
      rooms: 14,
      rating: 4.98,
      image: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?auto=format&fit=crop&w=800&q=80',
      amenities: JSON.stringify(['Active Watering Hole Pool', 'Bush Safari Land Cruisers', 'Boma Cultural Dining', 'Discovery Centre']),
      desc: 'Elevated walkways looking out over an active animal watering hole frequented daily by elephant herds.'
    },
    {
      name: 'Hôtel Plaza Athénée Haute Couture',
      dest_id: 6,
      loc: 'Avenue Montaigne, Paris, France',
      price: 750,
      rooms: 10,
      rating: 4.89,
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
      amenities: JSON.stringify(['Eiffel View Balcony', 'Dior Spa Institut', 'Cour Jardin Courtyard', 'Valet Limousine']),
      desc: 'The Parisian palace of Haute Couture adorned with signature geraniums on the prestigious Avenue Montaigne.'
    },
    {
      name: 'Matakauri Alpine Fjord Lodge',
      dest_id: 7,
      loc: 'Lake Wakatipu, Queenstown, NZ',
      price: 620,
      rooms: 11,
      rating: 4.91,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      amenities: JSON.stringify(['Panoramic Lake Glass Suites', 'Helipad Access', 'Farm-to-Table Gastronomy', 'Outdoor Hot Tub']),
      desc: 'Spectacular lodge poised on a lakeside cliff with unobstructed panoramas of Cecil Peak and Walter Peak.'
    },
    {
      name: 'Mena House Historic Pyramid Palace',
      dest_id: 8,
      loc: 'Pyramids Road, Giza, Cairo, Egypt',
      price: 290,
      rooms: 25,
      rating: 4.84,
      image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
      amenities: JSON.stringify(['Pyramid View Terraces', '40-acre Palm Gardens', 'Heated Outdoor Pool', 'Royal Brass Lounge']),
      desc: 'Legendary hotel with roots from 1869 offering breakfast directly beneath the shadow of the Great Pyramid.'
    }
  ];

  for (const h of hotels) {
    insertHotel.run(h.name, h.dest_id, h.loc, h.price, h.rooms, h.rating, h.image, h.amenities, h.desc);
  }

  // Seed Transport
  const insertTransport = db.prepare(`
    INSERT INTO transport (transport_type, source, destination, departure_time, arrival_time, ticket_price, available_seats, operator, duration)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transports = [
    { type: 'Flight', src: 'Singapore (SIN)', dst: 'Bali (DPS)', dep: '09:30', arr: '12:15', price: 145, seats: 42, op: 'Garuda Indonesia GA841', dur: '2h 45m' },
    { type: 'Flight', src: 'Sydney (SYD)', dst: 'Bali (DPS)', dep: '11:15', arr: '15:45', price: 280, seats: 28, op: 'Qantas Airways QF43', dur: '6h 30m' },
    { type: 'Flight', src: 'London (LHR)', dst: 'Zurich (ZRH)', dep: '08:20', arr: '11:05', price: 175, seats: 35, op: 'Swiss International LX317', dur: '1h 45m' },
    { type: 'Train', src: 'Zurich HB', dst: 'Interlaken / Grindelwald', dep: '12:02', arr: '14:00', price: 65, seats: 85, op: 'SBB GoldenPass Express', dur: '1h 58m' },
    { type: 'Train', src: 'Tokyo Central', dst: 'Kyoto Station', dep: '10:00', arr: '12:15', price: 110, seats: 120, op: 'Shinkansen Nozomi Bullet', dur: '2h 15m' },
    { type: 'Flight', src: 'Athens (ATH)', dst: 'Santorini (JTR)', dep: '14:20', arr: '15:10', price: 95, seats: 24, op: 'Aegean Airlines A3358', dur: '50m' },
    { type: 'Bus', src: 'Fira Port', dst: 'Oia Village', dep: '16:00', arr: '16:40', price: 12, seats: 32, op: 'KTEL Santorini Express Bus', dur: '40m' },
    { type: 'Flight', src: 'Nairobi (NBO)', dst: 'Serengeti Seronera (SEU)', dep: '08:45', arr: '10:30', price: 340, seats: 14, op: 'Coastal Aviation Safari Fly', dur: '1h 45m' },
    { type: 'Train', src: 'London St Pancras', dst: 'Paris Gare du Nord', dep: '09:01', arr: '12:20', price: 135, seats: 64, op: 'Eurostar High Speed 9014', dur: '2h 19m' },
    { type: 'Flight', src: 'Auckland (AKL)', dst: 'Queenstown (ZQN)', dep: '13:00', arr: '14:55', price: 160, seats: 45, op: 'Air New Zealand NZ617', dur: '1h 55m' },
    { type: 'Bus', src: 'Queenstown Central', dst: 'Milford Sound Fjord', dep: '07:15', arr: '11:30', price: 78, seats: 26, op: 'RealNZ Scenic Luxury Coach', dur: '4h 15m' },
    { type: 'Flight', src: 'Rome Fiumicino (FCO)', dst: 'Cairo Intl (CAI)', dep: '13:40', arr: '17:50', price: 215, seats: 38, op: 'EgyptAir MS792', dur: '3h 10m' }
  ];

  for (const t of transports) {
    insertTransport.run(t.type, t.src, t.dst, t.dep, t.arr, t.price, t.seats, t.op, t.dur);
  }

  // Seed sample bookings
  const insertHBooking = db.prepare(`
    INSERT INTO hotel_bookings (user_id, hotel_id, check_in, check_out, rooms, total_amount, booking_status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertHBooking.run(2, 1, '2026-12-05', '2026-12-09', 1, 960, 'Confirmed');
  insertHBooking.run(2, 3, '2027-01-15', '2027-01-18', 1, 1560, 'Confirmed');
  insertHBooking.run(3, 6, '2026-11-20', '2026-11-24', 2, 3920, 'Confirmed');

  const insertTBooking = db.prepare(`
    INSERT INTO transport_bookings (user_id, transport_id, number_of_tickets, total_amount, booking_status)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertTBooking.run(2, 1, 2, 290, 'Confirmed');
  insertTBooking.run(2, 4, 2, 130, 'Confirmed');
  insertTBooking.run(3, 9, 1, 135, 'Confirmed');

  // Seed sample payments
  const insertPayment = db.prepare(`
    INSERT INTO payments (user_id, booking_id, booking_type, amount, payment_method, payment_status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertPayment.run(2, 1, 'hotel', 960, 'Credit Card', 'Completed');
  insertPayment.run(2, 2, 'hotel', 1560, 'Credit Card', 'Completed');
  insertPayment.run(3, 3, 'hotel', 3920, 'PayPal', 'Completed');
  insertPayment.run(2, 1, 'transport', 290, 'Debit Card', 'Completed');
  insertPayment.run(2, 2, 'transport', 130, 'UPI', 'Completed');
  insertPayment.run(3, 3, 'transport', 135, 'Credit Card', 'Completed');

  // Seed reviews
  const insertReview = db.prepare(`
    INSERT INTO reviews (user_id, destination_id, rating, review_text)
    VALUES (?, ?, ?, ?)
  `);
  insertReview.run(2, 1, 5, 'Bali exceeded all my expectations! The sunrise trek over Mount Batur and the cliffside sunsets in Uluwatu are unforgettable.');
  insertReview.run(3, 2, 5, 'The train journey through the Bernese Oberland felt like stepping directly into a storybook. Pristine air and stunning panoramas.');
  insertReview.run(2, 3, 5, 'Wandering through the Fushimi Inari torii gates in the quiet dawn was deeply tranquil. Kyoto is truly timeless.');
  insertReview.run(3, 4, 5, 'Canaves Oia was sensational. The caldera views and sunset wine tasting cannot be captured adequately by photos alone.');

  // Seed sample trip
  const insertTrip = db.prepare(`
    INSERT INTO trips (user_id, starting_location, destination_id, start_date, end_date, travelers, budget, preferences, itinerary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sampleItinerary = [
    { day: 1, title: 'Arrival & Seaside Welcome', activities: ['Check in to coastal resort', 'Sunset cocktails at Rock Bar', 'Fresh seafood dinner at Jimbaran beach'] },
    { day: 2, title: 'Cultural Temples & Terraces', activities: ['Early morning visit to Tegallalang rice terraces', 'Tirta Empul water blessing temple', 'Traditional Balinese dance performance'] },
    { day: 3, title: 'Mount Batur & Hot Springs', activities: ['4:00 AM guided sunrise volcano hike', 'Soak in Toya Devasya lakeside thermal pools', 'Coffee plantation tour & Luwak tasting'] },
    { day: 4, title: 'Coastal Relaxation & Departure', activities: ['Morning surfing lesson in Canggu', 'Artisan shopping in Seminyak boutiques', 'Transfer to DPS airport'] }
  ];

  insertTrip.run(
    2,
    'San Francisco, USA',
    1,
    '2026-12-05',
    '2026-12-09',
    2,
    2500,
    'Cultural & Relaxation',
    JSON.stringify(sampleItinerary)
  );

  console.log('Database seeded successfully.');
}

export { db };
