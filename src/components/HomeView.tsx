import React, { useState } from 'react';
import { Destination, Hotel } from '../types';
import {
  Search,
  Compass,
  MapPin,
  Calendar,
  Star,
  Hotel as HotelIcon,
  Plane,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag,
  CheckCircle2,
  Users
} from 'lucide-react';

interface HomeViewProps {
  destinations: Destination[];
  hotels: Hotel[];
  onSelectDestination: (dest: Destination) => void;
  onSelectHotel: (hotel: Hotel) => void;
  onNavigate: (tab: string) => void;
  onSearch: (searchTerm: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  destinations,
  hotels,
  onSelectDestination,
  onSelectHotel,
  onNavigate,
  onSearch
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
    onNavigate('destinations');
  };

  const featuredDestinations = destinations.slice(0, 4);
  const featuredHotels = hotels.slice(0, 4);

  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center text-white overflow-hidden rounded-b-3xl">
        {/* Background Image with Dark Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=80"
            alt="Scenic mountain landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-sky-200 text-xs sm:text-sm font-semibold tracking-wide animate-fadeIn">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Discover Over 500+ Handpicked Global Destinations</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
            Unforgettable Journeys, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">
              Effortlessly Managed.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-200 font-normal leading-relaxed drop-shadow-sm">
            Explore world-class destinations, create smart daily itineraries, reserve luxury resorts,
            and book flights or trains in one seamless full-stack tourism platform.
          </p>

          {/* Quick Search Floating Bar */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-3xl shadow-2xl border border-white/40 text-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
          >
            <div className="sm:col-span-5 text-left px-3">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Where to?
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sky-600 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Bali, Swiss Alps, Kyoto, Paris..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="sm:col-span-4 text-left px-3 sm:border-l border-slate-200">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Travel Category
              </label>
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 focus:outline-none bg-transparent cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Beach">Tropical Beaches</option>
                  <option value="Mountain">Alpine Mountains</option>
                  <option value="Cultural">Historic & Cultural</option>
                  <option value="Wildlife">Wildlife Safaris</option>
                  <option value="City">Metropolitan Cities</option>
                  <option value="Adventure">Extreme Adventure</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Search className="w-4 h-4 group-hover:scale-110 transition" />
                <span>Search Trips</span>
              </button>
            </div>
          </form>

          {/* Quick Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300 pt-2">
            <span className="font-semibold text-slate-400">Popular Searches:</span>
            {['Bali Beach', 'Swiss Alps', 'Kyoto Temples', 'Santorini Sunset', 'Serengeti Safari'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  onSearch(tag.split(' ')[0]);
                  onNavigate('destinations');
                }}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white transition border border-white/10"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE HIGHLIGHTS / STATS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{destinations.length}+</p>
              <p className="text-xs font-medium text-slate-500">World Destinations</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
              <HotelIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{hotels.length}+</p>
              <p className="text-xs font-medium text-slate-500">Verified Luxury Hotels</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">100%</p>
              <p className="text-xs font-medium text-slate-500">Instant Confirmation</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">4.9 / 5.0</p>
              <p className="text-xs font-medium text-slate-500">Customer Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR DESTINATIONS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-wider mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>Trending Worldwide</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Popular Tourist Destinations
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-xl">
              From sun-drenched tropical coasts to mystical alpine peaks, explore travelers' favorite getaways.
            </p>
          </div>

          <button
            onClick={() => onNavigate('destinations')}
            className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700 transition group self-start md:self-auto"
          >
            <span>View All Destinations</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDestinations.map((dest) => (
            <div
              key={dest.destination_id}
              onClick={() => onSelectDestination(dest)}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-sky-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.destination_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md text-white text-xs font-semibold">
                  {dest.category}
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold flex items-center gap-1 shadow-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{dest.rating || 4.8}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-xs font-medium text-slate-400 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-500" />
                    <span>{dest.state}, {dest.country}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition">
                    {dest.destination_name}
                  </h3>
                  <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                    {dest.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Best: {dest.best_time?.split('&')[0]}</span>
                  <span className="font-bold text-sky-600 group-hover:translate-x-1 transition flex items-center gap-1">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED TRAVEL PACKAGES BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-sky-950 to-teal-950 p-8 sm:p-12 text-white border border-slate-800 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider border border-sky-400/30">
              Interactive Itinerary Builder
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Plan Your Dream Vacation with Our Smart Trip Planner
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Input your origin, destination, travel dates, and budget. Our smart planner creates a tailored
              day-by-day itinerary with automated cost estimations, recommended activities, and instant reservation.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate('planner')}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 font-bold text-sm text-white shadow-lg transition flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Launch Trip Planner</span>
              </button>
              <button
                onClick={() => onNavigate('hotels')}
                className="py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md font-semibold text-sm text-white transition border border-white/20"
              >
                Browse Hotels First
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* RECOMMENDED HOTELS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wider mb-2">
              <HotelIcon className="w-4 h-4" />
              <span>Premium Hospitality</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Recommended Luxury Stays
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-xl">
              Hand-verified resorts, eco-villas, and mountain lodges with first-class amenities.
            </p>
          </div>

          <button
            onClick={() => onNavigate('hotels')}
            className="inline-flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 transition group self-start md:self-auto"
          >
            <span>View All Hotels</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredHotels.map((hotel) => (
            <div
              key={hotel.hotel_id}
              onClick={() => onSelectHotel(hotel)}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-teal-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={hotel.image}
                  alt={hotel.hotel_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold flex items-center gap-1 shadow-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{hotel.rating}</span>
                </div>
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-[11px] font-medium">
                  {hotel.available_rooms} rooms left
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-xs font-medium text-slate-400 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span>{hotel.location}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition line-clamp-1">
                    {hotel.hotel_name}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1.5 line-clamp-2">
                    {hotel.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Starting from</span>
                    <span className="text-base font-black text-slate-900">${hotel.price_per_night}</span>
                    <span className="text-xs text-slate-500"> / night</span>
                  </div>
                  <span className="py-1.5 px-3 rounded-xl bg-teal-50 text-teal-700 text-xs font-bold group-hover:bg-teal-600 group-hover:text-white transition">
                    Book Now
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SPECIAL PROMO OFFERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-sky-600 to-sky-800 text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10 space-y-3">
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
                Limited Season Offer
              </span>
              <h3 className="text-2xl font-bold">15% Off Your First Hotel Stay</h3>
              <p className="text-sky-100 text-sm max-w-sm">
                Apply coupon code <span className="font-mono font-bold text-white bg-sky-900/50 px-2 py-0.5 rounded">WANDER15</span> at checkout for instant savings.
              </p>
              <button
                onClick={() => onNavigate('hotels')}
                className="pt-2 text-xs font-bold text-white underline underline-offset-4 hover:text-sky-200 transition"
              >
                Claim Discount & Book →
              </button>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10 space-y-3">
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
                Multi-Modal Transport
              </span>
              <h3 className="text-2xl font-bold">Connecting Trains, Flights & Buses</h3>
              <p className="text-emerald-100 text-sm max-w-sm">
                Fast booking with real-time seat inventory, operator schedules, and digital boarding tickets.
              </p>
              <button
                onClick={() => onNavigate('transport')}
                className="pt-2 text-xs font-bold text-white underline underline-offset-4 hover:text-emerald-200 transition"
              >
                Check Transportation Timetables →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
