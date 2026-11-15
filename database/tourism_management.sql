-- ========================================================
-- TOURISM MANAGEMENT SYSTEM - MySQL Database Schema & Seed Script
-- Database Name: tourism_management
-- Compatible with MySQL 8.0+ / MariaDB 10.4+
-- ========================================================

DROP DATABASE IF EXISTS tourism_management;
CREATE DATABASE tourism_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tourism_management;

-- --------------------------------------------------------
-- 1. Table structure for table `users`
-- --------------------------------------------------------
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(25) NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_email (email),
  INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 2. Table structure for table `destinations`
-- --------------------------------------------------------
CREATE TABLE destinations (
  destination_id INT AUTO_INCREMENT PRIMARY KEY,
  destination_name VARCHAR(150) NOT NULL,
  country VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(500) NOT NULL,
  category ENUM('Beach', 'Mountain', 'Cultural', 'Wildlife', 'City', 'Adventure') NOT NULL,
  rating DECIMAL(3, 2) DEFAULT 4.80,
  best_time VARCHAR(100) NULL,
  climate VARCHAR(100) NULL,
  attractions JSON NULL,
  latitude DECIMAL(10, 8) NULL,
  longitude DECIMAL(11, 8) NULL,
  INDEX idx_destination_category (category),
  INDEX idx_destination_country (country)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 3. Table structure for table `hotels`
-- --------------------------------------------------------
CREATE TABLE hotels (
  hotel_id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_name VARCHAR(150) NOT NULL,
  destination_id INT NOT NULL,
  location VARCHAR(200) NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL,
  available_rooms INT NOT NULL DEFAULT 10,
  rating DECIMAL(3, 2) DEFAULT 4.50,
  image VARCHAR(500) NOT NULL,
  amenities JSON NULL,
  description TEXT NULL,
  FOREIGN KEY (destination_id) REFERENCES destinations (destination_id) ON DELETE CASCADE,
  INDEX idx_hotel_dest (destination_id),
  INDEX idx_hotel_price (price_per_night)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 4. Table structure for table `trips`
-- --------------------------------------------------------
CREATE TABLE trips (
  trip_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  starting_location VARCHAR(150) NOT NULL,
  destination_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  travelers INT NOT NULL DEFAULT 1,
  budget DECIMAL(10, 2) NOT NULL,
  preferences VARCHAR(255) NULL,
  itinerary JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations (destination_id) ON DELETE CASCADE,
  INDEX idx_trip_user (user_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 5. Table structure for table `hotel_bookings`
-- --------------------------------------------------------
CREATE TABLE hotel_bookings (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  hotel_id INT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  rooms INT NOT NULL DEFAULT 1,
  total_amount DECIMAL(10, 2) NOT NULL,
  booking_status ENUM('Pending', 'Confirmed', 'Cancelled') NOT NULL DEFAULT 'Confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  FOREIGN KEY (hotel_id) REFERENCES hotels (hotel_id) ON DELETE CASCADE,
  INDEX idx_hbooking_user (user_id),
  INDEX idx_hbooking_status (booking_status)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 6. Table structure for table `transport`
-- --------------------------------------------------------
CREATE TABLE transport (
  transport_id INT AUTO_INCREMENT PRIMARY KEY,
  transport_type ENUM('Flight', 'Train', 'Bus') NOT NULL,
  source VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  departure_time VARCHAR(20) NOT NULL,
  arrival_time VARCHAR(20) NOT NULL,
  ticket_price DECIMAL(10, 2) NOT NULL,
  available_seats INT NOT NULL DEFAULT 50,
  operator VARCHAR(100) NULL,
  duration VARCHAR(50) NULL,
  INDEX idx_transport_type (transport_type),
  INDEX idx_transport_src_dst (source, destination)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 7. Table structure for table `transport_bookings`
-- --------------------------------------------------------
CREATE TABLE transport_bookings (
  transport_booking_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  transport_id INT NOT NULL,
  number_of_tickets INT NOT NULL DEFAULT 1,
  total_amount DECIMAL(10, 2) NOT NULL,
  booking_status ENUM('Pending', 'Confirmed', 'Cancelled') NOT NULL DEFAULT 'Confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  FOREIGN KEY (transport_id) REFERENCES transport (transport_id) ON DELETE CASCADE,
  INDEX idx_tbooking_user (user_id),
  INDEX idx_tbooking_status (booking_status)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 8. Table structure for table `payments`
-- --------------------------------------------------------
CREATE TABLE payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  booking_id INT NOT NULL,
  booking_type ENUM('hotel', 'transport') NOT NULL DEFAULT 'hotel',
  amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('Credit Card', 'Debit Card', 'UPI', 'PayPal', 'Net Banking') NOT NULL,
  payment_status ENUM('Completed', 'Refunded', 'Failed') NOT NULL DEFAULT 'Completed',
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  INDEX idx_payment_user (user_id),
  INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 9. Table structure for table `reviews`
-- --------------------------------------------------------
CREATE TABLE reviews (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  destination_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations (destination_id) ON DELETE CASCADE,
  INDEX idx_review_dest (destination_id)
) ENGINE=InnoDB;

-- ========================================================
-- SEED DATA INSERTION
-- ========================================================

-- Users (passwords hashed with bcrypt: 'admin123' and 'traveler123')
INSERT INTO users (user_id, name, email, password, phone, role) VALUES
(1, 'Super Admin', 'admin@wanderlust.com', '$2a$10$eE5CjCgQp9xYwQ/O0uBqIec3rL.fQO1hZ5m.r92ZfVfJgW2jW87qK', '+1 (555) 019-2834', 'admin'),
(2, 'Sarah Jenkins', 'traveler@wanderlust.com', '$2a$10$jWq/5r0G7a2FzN/B8c4TNu6fQO1hZ5m.r92ZfVfJgW2jW87qK5mKi', '+1 (555) 482-9102', 'customer'),
(3, 'Marco Rossi', 'marco@example.com', '$2a$10$jWq/5r0G7a2FzN/B8c4TNu6fQO1hZ5m.r92ZfVfJgW2jW87qK5mKi', '+39 02 8845 1200', 'customer');

-- Destinations
INSERT INTO destinations (destination_id, destination_name, country, state, description, image, category, rating, best_time, climate, attractions, latitude, longitude) VALUES
(1, 'Bali Island Paradise', 'Indonesia', 'Bali', 'Known as the Island of the Gods, Bali captivates with dramatic volcanoes, lush terraced rice fields, spiritual temples, and vibrant coastal beaches.', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80', 'Beach', 4.90, 'April to October', 'Tropical (26°C - 31°C)', '["Uluwatu Temple", "Tegallalang Rice Terraces", "Seminyak Beach", "Mount Batur Sunrise Hike"]', -8.4095, 115.1889),
(2, 'Swiss Alpine Wonder', 'Switzerland', 'Bernese Oberland', 'Breathtaking peaks, crystalline turquoise lakes, world-class ski slopes, and charming car-free villages surrounded by the Swiss Alps.', 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80', 'Mountain', 4.95, 'June to Sept & Dec to March', 'Alpine (15°C summer / -3°C winter)', '["Jungfraujoch Top of Europe", "Lake Brienz", "Grindelwald First", "Lauterbrunnen Valley"]', 46.5772, 7.9084),
(3, 'Kyoto Cultural Heritage', 'Japan', 'Kansai', 'The cultural heart of Japan boasting thousands of classical Buddhist temples, serene Zen rock gardens, imperial palaces, and geisha districts.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80', 'Cultural', 4.88, 'March to May & Oct to Nov', 'Temperate (18°C - 24°C)', '["Fushimi Inari Shrine", "Kinkaku-ji (Golden Pavilion)", "Arashiyama Bamboo Grove", "Gion Historic District"]', 35.0116, 135.7681),
(4, 'Santorini Sunset Caldera', 'Greece', 'Cyclades', 'Iconic whitewashed cubic houses perched on soaring cliff edges overlooking the cerulean Aegean Sea, famous for mesmerizing sunsets and volcanic beaches.', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80', 'Beach', 4.85, 'May to October', 'Mediterranean (22°C - 29°C)', '["Oia Sunset Point", "Red Beach Akrotiri", "Fira to Oia Caldera Trail", "Santo Wines Winery"]', 36.3932, 25.4615),
(5, 'Serengeti Wildlife Safari', 'Tanzania', 'Mara', 'Vast golden plains hosting the annual Great Migration of over two million wildebeest, zebras, and apex predators across untamed African savanna.', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80', 'Wildlife', 4.96, 'June to October', 'Savanna (20°C - 28°C)', '["Great Migration River Crossing", "Ngorongoro Crater", "Hot Air Balloon Safari", "Seronera Valley"]', -2.3333, 34.8333),
(6, 'Parisian Arts & Romance', 'France', 'Île-de-France', 'The global epicenter of art, fashion, gastronomy, and architectural grandeur along the historic banks of the romantic Seine River.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80', 'City', 4.82, 'April to June & Sept to Nov', 'Oceanic (16°C - 23°C)', '["Eiffel Tower", "Louvre Museum", "Cathédrale Notre-Dame", "Montmartre & Sacré-Cœur"]', 48.8566, 2.3522),
(7, 'Queenstown Adventure Capital', 'New Zealand', 'Otago', 'Nestled beside Lake Wakatipu beneath the dramatic Remarkables mountain range, world-renowned for bungee jumping, jet boating, and fjord trekking.', 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1200&q=80', 'Adventure', 4.92, 'Dec to Feb & July to August', 'Temperate (10°C - 22°C)', '["Milford Sound Cruise", "Nevis Bungy Jump", "Skyline Gondola & Luge", "Shotover Jet Canyon"]', -45.0312, 168.6626),
(8, 'Pyramids & Nile Wonders', 'Egypt', 'Giza & Cairo', 'One of humankind’s greatest ancient civilizations with towering stone pyramids, the Great Sphinx, the Khan el-Khalili bazaar, and luxury Nile river cruises.', 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80', 'Cultural', 4.79, 'October to April', 'Subtropical Desert (20°C - 28°C)', '["Great Pyramid of Giza", "The Grand Egyptian Museum", "Karnak Temple Luxor", "Valley of the Kings"]', 29.9792, 31.1342);

-- Hotels
INSERT INTO hotels (hotel_id, hotel_name, destination_id, location, price_per_night, available_rooms, rating, image, amenities, description) VALUES
(1, 'Ayana Resort & Rock Bar', 1, 'Jimbaran Coast, Bali', 240.00, 18, 4.90, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80', '["Oceanfront Pool", "Rock Bar Access", "Spa & Thalassotherapy", "Free High-speed WiFi", "Airport Shuttle"]', 'World-renowned cliffside luxury sanctuary with sweeping views of the Indian Ocean and legendary sunset dining.'),
(2, 'Ubud Hanging Gardens Eco Villa', 1, 'Payangan, Ubud, Bali', 310.00, 9, 4.95, 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80', '["Infinity Valley Pool", "Private Butler", "Organic Farm Restaurant", "Morning Yoga Pavilion"]', 'Award-winning twin-tiered cascading pool hanging over the Ayung River valley rainforest canopy.'),
(3, 'The Chedi Andermatt Alpine Lodge', 2, 'Gotthard Pass, Switzerland', 520.00, 12, 4.92, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', '["Ski-in / Ski-out", "Thermal Spa & Hydrotherapy", "Michelin-starred Japanese Dining", "Wine & Cigar Lounge"]', 'Masterful blend of Swiss alpine chalet warmth with Asian architectural elegance and 2,400-sqm wellness oasis.'),
(4, 'Grindelwald Mountain Chalet', 2, 'Dorfstrasse, Grindelwald, Switzerland', 280.00, 15, 4.75, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', '["Eiger View Balconies", "Sauna & Steam Bath", "Traditional Fondue Stübli", "Ski Storage"]', 'Cozy timber lodge situated directly facing the formidable Eiger North Face with direct cable car access.'),
(5, 'Hoshinoya Kyoto River Sanctuary', 3, 'Arashiyama, Kyoto, Japan', 650.00, 6, 4.97, 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', '["Private Boat Arrival", "Kaiseki Culinary Journey", "Tea Ceremony Pavilion", "Tatami Suites"]', 'A preserved riverside pavilion accessible only by traditional wooden boat along the emerald Oi River.'),
(6, 'Canaves Oia Suites & Infinity Pools', 4, 'Oia Cliff, Santorini, Greece', 490.00, 8, 4.93, 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80', '["Caldera View Plunge Pool", "Gourmet Wine Cellar", "Champagne Breakfast", "Helicopter Transfer"]', 'Carved seamlessly into the dramatic volcanic cliffside with private sea-facing infinity plunge pools.'),
(7, 'Four Seasons Safari Lodge Serengeti', 5, 'Central Serengeti, Tanzania', 880.00, 14, 4.98, 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?auto=format&fit=crop&w=800&q=80', '["Active Watering Hole Pool", "Bush Safari Land Cruisers", "Boma Cultural Dining", "Discovery Centre"]', 'Elevated walkways looking out over an active animal watering hole frequented daily by elephant herds.'),
(8, 'Hôtel Plaza Athénée Haute Couture', 6, 'Avenue Montaigne, Paris, France', 750.00, 10, 4.89, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80', '["Eiffel View Balcony", "Dior Spa Institut", "Cour Jardin Courtyard", "Valet Limousine"]', 'The Parisian palace of Haute Couture adorned with signature geraniums on the prestigious Avenue Montaigne.');

-- Transport options
INSERT INTO transport (transport_id, transport_type, source, destination, departure_time, arrival_time, ticket_price, available_seats, operator, duration) VALUES
(1, 'Flight', 'Singapore (SIN)', 'Bali (DPS)', '09:30', '12:15', 145.00, 42, 'Garuda Indonesia GA841', '2h 45m'),
(2, 'Flight', 'Sydney (SYD)', 'Bali (DPS)', '11:15', '15:45', 280.00, 28, 'Qantas Airways QF43', '6h 30m'),
(3, 'Flight', 'London (LHR)', 'Zurich (ZRH)', '08:20', '11:05', 175.00, 35, 'Swiss International LX317', '1h 45m'),
(4, 'Train', 'Zurich HB', 'Interlaken / Grindelwald', '12:02', '14:00', 65.00, 85, 'SBB GoldenPass Express', '1h 58m'),
(5, 'Train', 'Tokyo Central', 'Kyoto Station', '10:00', '12:15', 110.00, 120, 'Shinkansen Nozomi Bullet', '2h 15m'),
(6, 'Flight', 'Athens (ATH)', 'Santorini (JTR)', '14:20', '15:10', 95.00, 24, 'Aegean Airlines A3358', '50m'),
(7, 'Bus', 'Fira Port', 'Oia Village', '16:00', '16:40', 12.00, 32, 'KTEL Santorini Express Bus', '40m'),
(8, 'Flight', 'Nairobi (NBO)', 'Serengeti Seronera (SEU)', '08:45', '10:30', 340.00, 14, 'Coastal Aviation Safari Fly', '1h 45m'),
(9, 'Train', 'London St Pancras', 'Paris Gare du Nord', '09:01', '12:20', 135.00, 64, 'Eurostar High Speed 9014', '2h 19m'),
(10, 'Flight', 'Auckland (AKL)', 'Queenstown (ZQN)', '13:00', '14:55', 160.00, 45, 'Air New Zealand NZ617', '1h 55m');

-- Sample Bookings & Payments
INSERT INTO hotel_bookings (booking_id, user_id, hotel_id, check_in, check_out, rooms, total_amount, booking_status) VALUES
(1, 2, 1, '2026-12-05', '2026-12-09', 1, 960.00, 'Confirmed'),
(2, 2, 3, '2027-01-15', '2027-01-18', 1, 1560.00, 'Confirmed');

INSERT INTO transport_bookings (transport_booking_id, user_id, transport_id, number_of_tickets, total_amount, booking_status) VALUES
(1, 2, 1, 2, 290.00, 'Confirmed'),
(2, 2, 4, 2, 130.00, 'Confirmed');

INSERT INTO payments (payment_id, user_id, booking_id, booking_type, amount, payment_method, payment_status) VALUES
(1, 2, 1, 'hotel', 960.00, 'Credit Card', 'Completed'),
(2, 2, 2, 'hotel', 1560.00, 'Credit Card', 'Completed'),
(3, 2, 1, 'transport', 290.00, 'Debit Card', 'Completed'),
(4, 2, 2, 'transport', 130.00, 'UPI', 'Completed');

INSERT INTO reviews (review_id, user_id, destination_id, rating, review_text) VALUES
(1, 2, 1, 5, 'Bali exceeded all my expectations! The sunrise trek over Mount Batur and the cliffside sunsets in Uluwatu are unforgettable.'),
(2, 3, 2, 5, 'The train journey through the Bernese Oberland felt like stepping directly into a storybook. Pristine air and stunning panoramas.');
