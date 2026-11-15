import React, { useState, useEffect } from 'react';
import { Destination, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  MapPin,
  Star,
  CloudSun,
  Wind,
  Droplets,
  ExternalLink,
  Calendar,
  Hotel as HotelIcon,
  X,
  Compass,
  MessageSquare,
  Send,
  Sparkles,
  Navigation
} from 'lucide-react';

interface DestinationsViewProps {
  destinations: Destination[];
  selectedDestination: Destination | null;
  onSelectDestination: (dest: Destination | null) => void;
  onPlanTrip: (dest: Destination) => void;
  onFindHotels: (destId: number) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  initialSearch?: string;
}

export const DestinationsView: React.FC<DestinationsViewProps> = ({
  destinations,
  selectedDestination,
  onSelectDestination,
  onPlanTrip,
  onFindHotels,
  showToast,
  initialSearch = ''
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');

  // Modal State
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch weather and reviews when selectedDestination changes
  useEffect(() => {
    if (selectedDestination) {
      // Fetch weather
      setLoadingWeather(true);
      fetch(`/api/weather?city=${encodeURIComponent(selectedDestination.destination_name)}&lat=${selectedDestination.latitude || 0}&lng=${selectedDestination.longitude || 0}`)
        .then((res) => res.json())
        .then((data) => setWeatherData(data))
        .catch((err) => console.error('Weather error:', err))
        .finally(() => setLoadingWeather(false));

      // Fetch reviews
      fetch(`/api/reviews?destination_id=${selectedDestination.destination_id}`)
        .then((res) => res.json())
        .then((data) => setReviews(data))
        .catch((err) => console.error('Reviews error:', err));
    } else {
      setWeatherData(null);
      setReviews([]);
    }
  }, [selectedDestination]);

  // Unique countries for filter
  const countries = ['All', ...Array.from(new Set(destinations.map((d) => d.country)))];
  const categories = ['All', 'Beach', 'Mountain', 'Cultural', 'Wildlife', 'City', 'Adventure'];

  // Filter logic
  const filtered = destinations.filter((dest) => {
    const matchCat = selectedCategory === 'All' || dest.category === selectedCategory;
    const matchCountry = selectedCountry === 'All' || dest.country === selectedCountry;
    const matchSearch =
      searchTerm.trim() === '' ||
      dest.destination_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchCountry && matchSearch;
  });

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to write a traveler review', 'info');
      return;
    }
    if (!newReviewText.trim()) return;

    setSubmittingReview(true);
    try {
      const token = localStorage.getItem('wanderlust_token');
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          destination_id: selectedDestination?.destination_id,
          rating: newRating,
          review_text: newReviewText.trim()
        })
      });

      if (res.ok) {
        showToast('Review submitted successfully!', 'success');
        setNewReviewText('');
        // Refresh reviews
        if (selectedDestination) {
          const revRes = await fetch(`/api/reviews?destination_id=${selectedDestination.destination_id}`);
          const revData = await revRes.json();
          setReviews(revData);
        }
      } else {
        showToast('Failed to submit review', 'error');
      }
    } catch {
      showToast('Error submitting review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5" />
          <span>Curated Travel Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Explore Tourist Destinations
        </h1>
        <p className="text-slate-500 text-sm max-w-2xl">
          Browse verified destinations with location maps, weather conditions, nearby attractions,
          and genuine traveler reviews.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search destination, country, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </div>

          {/* Country Selector */}
          <div className="md:col-span-3">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-white cursor-pointer"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  Country: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Result Count */}
          <div className="md:col-span-3 text-right">
            <span className="text-xs font-semibold text-slate-500">
              Showing <span className="text-sky-600 font-bold">{filtered.length}</span> destinations
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Destinations Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">No destinations match your search</h3>
          <p className="text-sm text-slate-400">
            Try adjusting your search criteria or resetting filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setSelectedCountry('All');
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map((dest) => (
            <div
              key={dest.destination_id}
              onClick={() => onSelectDestination(dest)}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-sky-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
            >
              <div className="relative h-60 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.destination_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md text-white text-xs font-semibold">
                  {dest.category}
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold flex items-center gap-1 shadow-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{dest.rating || 4.8}</span>
                </div>
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5">
                  <CloudSun className="w-3.5 h-3.5 text-amber-300" />
                  <span>{dest.climate?.split(' ')[0] || 'Tropical'}</span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-sky-600 mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{dest.state}, {dest.country}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-sky-600 transition">
                    {dest.destination_name}
                  </h3>
                  <p className="text-slate-500 text-xs mt-2 line-clamp-3 leading-relaxed">
                    {dest.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Best Time:</span>
                    <span className="font-semibold text-slate-700">{dest.best_time?.split('&')[0]}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDestination(dest);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white text-xs font-bold transition text-center"
                    >
                      View Details & Map
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlanTrip(dest);
                      }}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                      title="Plan Itinerary"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DESTINATION DETAILS MODAL */}
      {selectedDestination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
            {/* Modal Header Image */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden flex-shrink-0">
              <img
                src={selectedDestination.image}
                alt={selectedDestination.destination_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
              <button
                onClick={() => onSelectDestination(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-bold uppercase tracking-wider">
                    {selectedDestination.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    {selectedDestination.rating}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black">{selectedDestination.destination_name}</h2>
                <p className="text-sky-200 text-xs sm:text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {selectedDestination.state}, {selectedDestination.country}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-base font-bold text-slate-900">About Destination</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{selectedDestination.description}</p>
              </div>

              {/* Climate & Best Time Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-sky-800 uppercase tracking-wider block">
                      Best Time to Visit
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {selectedDestination.best_time || 'Year-round'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                    <CloudSun className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                      Typical Climate
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {selectedDestination.climate || 'Temperate'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Weather Information Widget */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CloudSun className="w-5 h-5 text-amber-500" />
                    <h4 className="font-bold text-slate-900 text-sm">Live Weather Conditions</h4>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">OpenWeather API Integrated</span>
                </div>

                {loadingWeather ? (
                  <div className="py-4 text-center text-xs text-slate-400">Loading live weather data...</div>
                ) : weatherData ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Temperature</span>
                      <span className="text-xl font-black text-slate-900">{weatherData.temperatureC}°C</span>
                      <span className="text-xs text-slate-400 ml-1">({weatherData.temperatureF}°F)</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Condition</span>
                      <span className="text-sm font-bold text-slate-800">{weatherData.condition}</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Humidity</span>
                      <span className="text-sm font-bold text-slate-800">{weatherData.humidity}%</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Wind Speed</span>
                      <span className="text-sm font-bold text-slate-800">{weatherData.windSpeedKmH} km/h</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Attractions & Nearby Places */}
              {selectedDestination.attractions && selectedDestination.attractions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-slate-900">Key Attractions & Points of Interest</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedDestination.attractions.map((attr, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-semibold text-slate-800"
                      >
                        <Sparkles className="w-4 h-4 text-sky-500 flex-shrink-0" />
                        <span>{attr}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Google Maps / Location Viewer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-sky-600" />
                    <h4 className="text-base font-bold text-slate-900">Interactive Location Map</h4>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      `${selectedDestination.destination_name}, ${selectedDestination.country}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="w-full h-56 rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-100">
                  <iframe
                    title="Destination Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                      (selectedDestination.longitude || 0) - 0.15
                    }%2C${(selectedDestination.latitude || 0) - 0.15}%2C${
                      (selectedDestination.longitude || 0) + 0.15
                    }%2C${(selectedDestination.latitude || 0) + 0.15}&layer=mapnik&marker=${
                      selectedDestination.latitude || 0
                    }%2C${selectedDestination.longitude || 0}`}
                  />
                  <div className="absolute bottom-2 left-2 px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[11px] font-mono text-slate-700 shadow-xs">
                    Coordinates: {selectedDestination.latitude?.toFixed(4)}, {selectedDestination.longitude?.toFixed(4)}
                  </div>
                </div>
              </div>

              {/* Reviews & Ratings Section */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-teal-600" />
                    <h4 className="text-base font-bold text-slate-900">
                      Traveler Reviews ({reviews.length})
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>Average: {selectedDestination.rating} / 5</span>
                  </div>
                </div>

                {/* Add Review Form */}
                <form onSubmit={handlePostReview} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Write Your Experience:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-0.5 focus:outline-none"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= newRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder={user ? "Share your tips, must-visit spots, or trip highlights..." : "Please sign in to write a review."}
                    disabled={!user}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-white"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingReview || !user || !newReviewText.trim()}
                      className="py-2 px-4 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                    </button>
                  </div>
                </form>

                {/* Reviews List */}
                <div className="space-y-3">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      No reviews yet for this destination. Be the first to share your thoughts!
                    </p>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.review_id} className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800">{rev.user_name || 'Traveler'}</span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{rev.review_text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-3 items-center justify-between">
              <button
                onClick={() => onSelectDestination(null)}
                className="py-2.5 px-5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
              >
                Close
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const id = selectedDestination.destination_id;
                    onSelectDestination(null);
                    onFindHotels(id);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-teal-600 text-teal-700 hover:bg-teal-50 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <HotelIcon className="w-4 h-4" />
                  <span>Find Hotels Here</span>
                </button>

                <button
                  onClick={() => {
                    const dest = selectedDestination;
                    onSelectDestination(null);
                    onPlanTrip(dest);
                  }}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Plan Itinerary Here</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
