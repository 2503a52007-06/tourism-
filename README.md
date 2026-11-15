# WanderLust - Full-Stack Tourism Management System

An end-to-end, responsive, full-stack Tourism Management System that allows tourists to explore destinations, plan custom trips, book luxury hotels, reserve multimodal transportation (flights, trains, and buses), and manage travel itineraries through a unified application, accompanied by a dedicated Administrator Control Dashboard.

---

## 🌟 Key Features

### Tourist & Customer Portal
1. **User Authentication & Authorization**:
   - Secure registration and login with bcrypt password hashing and JSON Web Tokens (JWT).
   - Profile management with account info update and password change.
   - Quick one-click demo credentials switcher for rapid testing.
2. **Interactive Homepage**:
   - Hero search bar with multi-parameter filtering (Destinations, Travel Categories).
   - Popular tourist destinations with real-time rating and price previews.
   - Featured travel packages and seasonal discount codes (`WANDER10`, `WANDER15`, `EXPLORE20`).
   - Recommended luxury hotels and customer satisfaction testimonials.
3. **Tourist Destination Explorer**:
   - Search destinations by name, country, state, or keywords.
   - Categorized filtering: Beach, Mountain, Cultural, Wildlife, City, and Adventure.
   - Comprehensive detail modals featuring:
     - Real-time simulated Weather conditions (OpenWeather API compatible).
     - Interactive Location Map with geographic coordinates and direct Google Maps link.
     - Top tourist attractions and points of interest.
     - Genuine traveler reviews with interactive star ratings and submission form.
4. **Smart Daily Trip Planner**:
   - Specify starting location, destination, departure/return dates, travelers, and budget.
   - Generates customized day-by-day itineraries with morning, afternoon, and evening schedules.
   - Itemized expense estimates (Hotels, Transport, Daily Food & Activities) against user budget.
   - One-click saving to customer profile (`trips` table).
5. **Hotel Booking Engine**:
   - Browse hotel inventory with real-time room availability counter.
   - Instant calculation of nights, room quantity, and total pricing.
   - Integrated booking checkout modal with instant availability deduction in MySQL.
6. **Multimodal Transportation Booking**:
   - Browse schedules for Flights, High-Speed Rail lines, and Intercity Coaches.
   - Filter by transport type, departure origin, and arrival destination.
   - Passenger seat reservation with live seat counts.
7. **Booking Management (My Bookings)**:
   - View confirmed, pending, and cancelled hotel and transport reservations.
   - View digital vouchers and boarding passes with booking reference IDs.
   - Cancel bookings with automatic room/seat release and refund recording.
8. **Simulated Payment Gateway**:
   - Itemized invoice breakdown with taxes and discount coupons.
   - Supports Credit Card, Debit Card, UPI, and PayPal sandbox payments.
   - Records transactions in the `payments` table and generates printable receipts.

---

### Administrator Control Dashboard
1. **Key Performance Indicators (KPIs)**:
   - Total Registered Users
   - Total Tourist Destinations
   - Total Hotel Bookings
   - Total Transportation Bookings
   - Total Recorded Revenue ($ USD)
2. **Visual Analytics**:
   - Monthly revenue bar chart.
   - Bookings distribution by travel category.
3. **CRUD Operations**:
   - **Destinations**: Add, edit, and delete tourist destinations.
   - **Hotels**: Add, edit, and delete hotels; live room availability increment/decrement.
   - **Transportation**: Add new routes/schedules, update ticket prices and seat quotas, delete.
   - **Bookings**: Inspect all customer reservations, confirm or reject bookings.
   - **Users**: View user directory, toggle role (`customer` <-> `admin`), delete accounts.
   - **Financial Ledger**: Inspect payment transactions and download CSV reports.

---

## 🛠️ Technologies Used

- **Frontend**: React 19, Tailwind CSS, Lucide Icons, Modern responsive components.
- **Backend**: Node.js, Express.js, JWT (`jsonwebtoken`), bcrypt password hashing (`bcryptjs`), CORS.
- **Database**:
  - **MySQL 8.0+**: Schema and seed scripts provided in `database/tourism_management.sql`.
  - **Embedded SQLite (better-sqlite3)**: Enables instant zero-configuration full-stack execution in Node.js while maintaining 100% relational schema parity with MySQL.
- **APIs & Integrations**:
  - OpenStreetMap & Google Maps location mapping.
  - OpenWeather simulated/live conditions API.

---

## 🗄️ MySQL Database Architecture

The relational database is named **`tourism_management`** with 9 interconnected tables:

```
+-------------------------------------------------------------+
|                          users                              |
| user_id (PK), name, email, password, phone, role, created_at |
+------------------------------+------------------------------+
                               |
       +-----------------------+------------------------+
       |                       |                        |
       v                       v                        v
+--------------+       +---------------+       +------------------+
|    trips     |       | hotel_bookings|       |transport_bookings|
+--------------+       +---------------+       +------------------+
       |                       |                        |
       v                       v                        |
+--------------+       +---------------+                |
| destinations |<------+    hotels     |                |
+--------------+       +---------------+                |
       ^                                                v
       |                                       +------------------+
       +----------------- reviews              |    transport     |
                                               +------------------+
                                                        ^
       +------------------------------------------------+
       |
+---------------+
|   payments    |
+---------------+
```

### Table Definitions:
1. `users`: User identity, hashed passwords, contact details, role (`customer` or `admin`).
2. `destinations`: Destination name, country, state, description, image, category, rating, best time, climate, attractions.
3. `hotels`: Hotel name, destination_id (FK), location, price_per_night, available_rooms, rating, image, amenities.
4. `trips`: Custom planned trip records with travelers, dates, budget, preferences, and day-by-day JSON itineraries.
5. `hotel_bookings`: Hotel reservations with dates, room count, total amount, and status (`Confirmed`, `Cancelled`).
6. `transport`: Multi-modal transit catalog (Flight, Train, Bus), routes, departure/arrival times, price, available seats.
7. `transport_bookings`: Passenger reservations and tickets.
8. `payments`: Financial ledger recording transaction amounts, method, status (`Completed`, `Refunded`), and timestamps.
9. `reviews`: User ratings (1-5 stars) and review text linked to destinations.

---

## 🚀 Running the Project Locally in VS Code

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [MySQL Community Server](https://dev.mysql.com/downloads/mysql/) (version 8.0+) OR [XAMPP](https://www.apachefriends.org/)
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) (optional, for visual DB management)
- Visual Studio Code

---

### Step 1: Clone or Open the Project
Open the project directory in VS Code:
```bash
code .
```

---

### Step 2: Set Up MySQL Database

1. Open **MySQL Workbench** or your MySQL command line client:
   ```bash
   mysql -u root -p
   ```
2. Run the provided SQL script:
   ```sql
   SOURCE ./database/tourism_management.sql;
   ```
   *Alternatively in MySQL Workbench:*
   - Click **File** -> **Open SQL Script...**
   - Select `database/tourism_management.sql`.
   - Click the **Execute (Lightning bolt)** button.
   - This creates the `tourism_management` database with all 9 tables and pre-populated sample records!

---

### Step 3: Install Dependencies
In the root terminal, run:
```bash
npm install
```

---

### Step 4: Run the Application
Start the full-stack Node.js Express & React application:
```bash
npm run dev
```

The application will start on **`http://localhost:3000`**!

---

## 🔑 Pre-Seeded Test Credentials

| Account Role | Email Address | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@wanderlust.com` | `admin123` | Full Admin Dashboard, Destination/Hotel/Transport CRUD, Booking Approvals, Financial Reports |
| **Traveler** | `traveler@wanderlust.com` | `traveler123` | Explore destinations, build trips, book hotels and transport, manage reservations |

*Tip: You can also click the "Admin Demo" or "Traveler Demo" buttons in the Sign In modal for 1-click test credential population.*

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register customer or admin | No |
| `POST` | `/api/auth/login` | Login and receive JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated profile | Yes |
| `PUT` | `/api/auth/profile` | Update profile information | Yes |
| `GET` | `/api/destinations` | List destinations with category/country filters | No |
| `GET` | `/api/destinations/:id`| Get single destination details | No |
| `POST` | `/api/destinations` | Create new tourist destination | Admin |
| `PUT` | `/api/destinations/:id`| Update destination record | Admin |
| `DELETE`| `/api/destinations/:id`| Remove destination record | Admin |
| `GET` | `/api/hotels` | List hotels with filters & availability | No |
| `POST` | `/api/hotels` | Add new hotel | Admin |
| `PATCH` | `/api/hotels/:id/availability` | Update available rooms | Admin |
| `DELETE`| `/api/hotels/:id` | Remove hotel | Admin |
| `GET` | `/api/transport` | List transport schedules | No |
| `POST` | `/api/transport` | Add transport schedule | Admin |
| `DELETE`| `/api/transport/:id` | Delete transport schedule | Admin |
| `GET` | `/api/trips` | Get user saved trips | Yes |
| `POST` | `/api/trips` | Save custom planned trip | Yes |
| `GET` | `/api/bookings/hotels` | Get user or admin hotel bookings | Yes |
| `POST` | `/api/bookings/hotels` | Book hotel room & process payment | Yes |
| `POST` | `/api/bookings/hotels/:id/cancel` | Cancel hotel booking & refund | Yes |
| `GET` | `/api/bookings/transport` | Get transport reservations | Yes |
| `POST` | `/api/bookings/transport` | Reserve tickets & process payment | Yes |
| `POST` | `/api/bookings/transport/:id/cancel` | Cancel transport reservation | Yes |
| `GET` | `/api/weather` | Get destination weather info | No |
| `GET` | `/api/reviews` | List reviews for destination | No |
| `POST` | `/api/reviews` | Post traveler review & star rating | Yes |
| `GET` | `/api/admin/stats` | Retrieve KPI metrics and revenue trends | Admin |
| `GET` | `/api/admin/users` | List registered user directory | Admin |
| `PATCH` | `/api/admin/users/:id/role` | Toggle user role (`customer`/`admin`) | Admin |
| `DELETE`| `/api/admin/users/:id` | Delete user account | Admin |
