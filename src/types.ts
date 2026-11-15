export interface User {
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  created_at?: string;
}

export interface Destination {
  destination_id: number;
  destination_name: string;
  country: string;
  state: string;
  description: string;
  image: string;
  category: 'Beach' | 'Mountain' | 'Cultural' | 'Wildlife' | 'City' | 'Adventure';
  rating?: number;
  featured?: boolean;
  best_time?: string;
  climate?: string;
  attractions?: string[];
  latitude?: number;
  longitude?: number;
}

export interface Hotel {
  hotel_id: number;
  hotel_name: string;
  destination_id: number;
  destination_name?: string;
  location: string;
  price_per_night: number;
  available_rooms: number;
  rating: number;
  image: string;
  amenities?: string[];
  description?: string;
}

export interface Transport {
  transport_id: number;
  transport_type: 'Flight' | 'Train' | 'Bus';
  source: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  ticket_price: number;
  available_seats: number;
  operator?: string;
  duration?: string;
}

export interface Trip {
  trip_id: number;
  user_id: number;
  starting_location: string;
  destination_id: number;
  destination_name?: string;
  destination_image?: string;
  start_date: string;
  end_date: string;
  travelers: number;
  budget: number;
  preferences?: string;
  itinerary?: { day: number; title: string; activities: string[] }[];
  created_at?: string;
}

export interface HotelBooking {
  booking_id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  hotel_id: number;
  hotel_name?: string;
  destination_name?: string;
  hotel_image?: string;
  check_in: string;
  check_out: string;
  rooms: number;
  total_amount: number;
  booking_status: 'Pending' | 'Confirmed' | 'Cancelled';
  created_at?: string;
}

export interface TransportBooking {
  transport_booking_id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  transport_id: number;
  transport_type?: 'Flight' | 'Train' | 'Bus';
  source?: string;
  destination?: string;
  departure_time?: string;
  number_of_tickets: number;
  total_amount: number;
  booking_status: 'Pending' | 'Confirmed' | 'Cancelled';
  created_at?: string;
}

export interface Payment {
  payment_id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  booking_id: number;
  booking_type?: 'hotel' | 'transport';
  amount: number;
  payment_method: 'Credit Card' | 'Debit Card' | 'UPI' | 'PayPal' | 'Net Banking';
  payment_status: 'Completed' | 'Refunded' | 'Failed';
  transaction_date: string;
}

export interface Review {
  review_id: number;
  user_id: number;
  user_name?: string;
  destination_id: number;
  rating: number;
  review_text: string;
  created_at?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalDestinations: number;
  totalHotels: number;
  totalTransport: number;
  totalHotelBookings: number;
  totalTransportBookings: number;
  totalRevenue: number;
  recentBookings: (HotelBooking | TransportBooking)[];
  revenueByMonth: { month: string; revenue: number }[];
  bookingsByCategory: { category: string; count: number }[];
}
