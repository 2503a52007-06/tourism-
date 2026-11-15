import React, { useState } from 'react';
import { Hotel, Destination } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Hotel as HotelIcon,
  Search,
  MapPin,
  Star,
  Users,
  Calendar,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Filter,
  DollarSign,
  Coffee,
  Wifi,
  Waves
} from 'lucide-react';

interface HotelsViewProps {
  hotels: Hotel[];
  destinations: Destination[];
  initialDestinationId?: number | null;
  onBookHotel: (hotel: Hotel, checkIn: string, checkOut: string, rooms: number, total: number) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const HotelsView: React.FC<HotelsViewProps> = ({
  hotels,
  destinations,
  initialDestinationId = null,
  onBookHotel,
  showToast
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [destFilter, setDestFilter] = useState<string>(
    initialDestinationId ? String(initialDestinationId) : 'All'
  );
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  // Quick booking state
  const [checkIn, setCheckIn] = useState('2026-12-15');
  const [checkOut, setCheckOut] = useState('2026-12-18');
  const [rooms, setRooms] = useState(1);

  // Filter hotels
  const filtered = hotels.filter((h) => {
    const matchDest = destFilter === 'All' || String(h.destination_id) === destFilter;
    const matchPrice = h.price_per_night <= maxPrice;
    const matchSearch =
      searchTerm.trim() === '' ||
      h.hotel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.destination_name && h.destination_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchDest && matchPrice && matchSearch;
  });

  const calculateNights = () => {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();

  const handleStartBooking = (hotel: Hotel) => {
    if (hotel.available_rooms < rooms) {
      showToast(`Only ${hotel.available_rooms} rooms currently available.`, 'error');
      return;
    }
    const total = hotel.price_per_night * nights * rooms;
    onBookHotel(hotel, checkIn, checkOut, rooms, total);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider">
          <HotelIcon className="w-3.5 h-3.5" />
          <span>Verified Accommodations</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Hotels, Resorts & Lodges
        </h1>
        <p className="text-slate-500 text-sm max-w-2xl">
          Reserve luxury oceanfront suites, alpine chalets, and city boutique hotels with instant room confirmation.
        </p>
      </div>

      {/* Search & Date Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Keyword Search */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search hotel name or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 font-medium"
            />
          </div>

          {/* Destination Selector */}
          <div className="md:col-span-3">
            <select
              value={destFilter}
              onChange={(e) => setDestFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 bg-white cursor-pointer"
            >
              <option value="All">All Destinations</option>
              {destinations.map((d) => (
                <option key={d.destination_id} value={String(d.destination_id)}>
                  {d.destination_name}
                </option>
              ))}
            </select>
          </div>

          {/* Check-In / Check-Out */}
          <div className="md:col-span-3 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Check-In</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Check-Out</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
              />
            </div>
          </div>

          {/* Rooms */}
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase">Rooms</label>
            <select
              value={rooms}
              onChange={(e) => setRooms(parseInt(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white cursor-pointer"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} Room{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Max price filter slider */}
        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-3">
            <span>Price Range (up to):</span>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="accent-teal-600 cursor-pointer"
            />
            <span className="font-bold text-slate-900">${maxPrice}/night</span>
          </div>

          <div className="font-semibold text-teal-700">
            {nights} Night{nights > 1 ? 's' : ''} selected
          </div>
        </div>
      </div>

      {/* Hotels Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
          <HotelIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">No hotels match your filters</h3>
          <p className="text-sm text-slate-400">Try adjusting your price range or destination choice.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setDestFilter('All');
              setMaxPrice(1000);
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map((hotel) => {
            const totalForStay = hotel.price_per_night * nights * rooms;

            return (
              <div
                key={hotel.hotel_id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-teal-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Photo & badges */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={hotel.image}
                    alt={hotel.hotel_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold flex items-center gap-1 shadow-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{hotel.rating}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-[11px] font-medium">
                    {hotel.available_rooms > 0 ? (
                      <span className="text-emerald-300 font-semibold">{hotel.available_rooms} rooms left</span>
                    ) : (
                      <span className="text-rose-300 font-semibold">Fully Booked</span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-teal-600 mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{hotel.location}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {hotel.hotel_name}
                    </h3>
                    <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                      {hotel.description}
                    </p>

                    {/* Amenities Badges */}
                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {hotel.amenities.slice(0, 3).map((a, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                        Rate per night
                      </span>
                      <span className="text-xl font-black text-slate-900">${hotel.price_per_night}</span>
                      <span className="text-xs text-slate-400"> / night</span>
                      <p className="text-[11px] text-teal-700 font-semibold mt-0.5">
                        ${totalForStay} total ({nights}n, {rooms} rm)
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={hotel.available_rooms < rooms}
                      onClick={() => handleStartBooking(hotel)}
                      className="py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 shadow-sm hover:shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {hotel.available_rooms < rooms ? 'Sold Out' : 'Reserve Stay'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
