import React, { useState } from 'react';
import { Destination, Trip } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Compass,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Bookmark,
  Share2,
  Hotel as HotelIcon,
  Plane,
  AlertCircle
} from 'lucide-react';

interface TripPlannerViewProps {
  destinations: Destination[];
  preselectedDestination?: Destination | null;
  onNavigate: (tab: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const TripPlannerView: React.FC<TripPlannerViewProps> = ({
  destinations,
  preselectedDestination,
  onNavigate,
  showToast
}) => {
  const { user } = useAuth();
  const [startingLocation, setStartingLocation] = useState('New York, USA');
  const [destinationId, setDestinationId] = useState<number>(
    preselectedDestination ? preselectedDestination.destination_id : (destinations[0]?.destination_id || 1)
  );
  const [startDate, setStartDate] = useState('2026-12-10');
  const [endDate, setEndDate] = useState('2026-12-14');
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(2400);
  const [preference, setPreference] = useState('Relaxed & Leisure');

  // Generated Plan State
  const [generatedItinerary, setGeneratedItinerary] = useState<any[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentDestination = destinations.find((d) => d.destination_id === Number(destinationId)) || destinations[0];

  // Calculate days between dates
  const calculateDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 3;
  };

  const daysCount = calculateDays();

  // Smart Itinerary Generator
  const handleGenerateItinerary = () => {
    setIsGenerating(true);
    setSavedSuccess(false);

    setTimeout(() => {
      const attractions = currentDestination?.attractions || ['City Center Tour', 'Local Cultural Market', 'Scenic Viewpoint'];
      const planDays = [];

      for (let day = 1; day <= Math.min(daysCount, 7); day++) {
        let title = '';
        let acts: string[] = [];

        if (day === 1) {
          title = 'Arrival, Check-in & Orientation';
          acts = [
            `Arrive from ${startingLocation} & private transfer to stay`,
            `Check-in, relax, and unpack`,
            `Sunset orientation walk around ${currentDestination.state}`,
            `Welcome dinner at an authentic local restaurant`
          ];
        } else if (day === daysCount) {
          title = 'Souvenir Shopping & Departure';
          acts = [
            `Morning leisurely breakfast & check-out`,
            `Last-minute handicraft & local market exploration`,
            `Scenic lunch with panoramic views`,
            `Transfer to international departure terminal`
          ];
        } else {
          const mainAttr = attractions[(day - 2) % attractions.length] || 'Panoramic Explorer';
          title = `Exploration of ${mainAttr}`;
          acts = [
            `Morning guided exploration of ${mainAttr}`,
            `Lunch break featuring regional specialties`,
            `Afternoon leisure: ${preference} focused activities`,
            `Evening cultural performance or sunset photography session`
          ];
        }

        planDays.push({
          day,
          title,
          activities: acts
        });
      }

      setGeneratedItinerary(planDays);
      setIsGenerating(false);
    }, 600);
  };

  // Cost estimates
  const estHotelCost = Math.round(daysCount * 180);
  const estTransportCost = Math.round(travelers * 220);
  const estDailyActivities = Math.round(daysCount * travelers * 85);
  const estTotalCost = estHotelCost + estTransportCost + estDailyActivities;
  const budgetDifference = budget - estTotalCost;

  const handleSaveTrip = async () => {
    if (!user) {
      showToast('Please sign in to save your personalized trip plan.', 'info');
      return;
    }

    if (!generatedItinerary) {
      handleGenerateItinerary();
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('wanderlust_token');
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          starting_location: startingLocation,
          destination_id: destinationId,
          start_date: startDate,
          end_date: endDate,
          travelers,
          budget,
          preferences: preference,
          itinerary: generatedItinerary || []
        })
      });

      if (res.ok) {
        setSavedSuccess(true);
        showToast('Trip plan saved to your profile!', 'success');
      } else {
        showToast('Failed to save trip. Please try again.', 'error');
      }
    } catch {
      showToast('Error saving trip', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart Itinerary Generator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Personalized Trip Planner
        </h1>
        <p className="text-slate-500 text-sm max-w-2xl">
          Customize your starting point, target destination, budget, and travel preferences.
          We generate day-by-day itineraries with estimated budgets and easy bookings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Planner Input Parameters Form */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-600" />
            <span>Trip Parameters</span>
          </h3>

          <div className="space-y-4 text-sm">
            {/* Starting Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Starting Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={startingLocation}
                  onChange={(e) => setStartingLocation(e.target.value)}
                  placeholder="e.g. London, New York, Tokyo..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 font-medium"
                />
              </div>
            </div>

            {/* Destination Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target Destination
              </label>
              <select
                value={destinationId}
                onChange={(e) => {
                  setDestinationId(Number(e.target.value));
                  setGeneratedItinerary(null);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-white font-medium cursor-pointer"
              >
                {destinations.map((d) => (
                  <option key={d.destination_id} value={d.destination_id}>
                    {d.destination_name} ({d.country}) - {d.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Travel Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Departure Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                />
              </div>
            </div>

            {/* Travelers & Budget */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Travelers
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={travelers}
                    onChange={(e) => setTravelers(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Total Budget ($ USD)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="number"
                    step={100}
                    value={budget}
                    onChange={(e) => setBudget(Math.max(100, parseInt(e.target.value) || 100))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Travel Preferences */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Travel Style Preference
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  'Relaxed & Leisure',
                  'Adventure & Trekking',
                  'Cultural & Historic',
                  'Luxury & Spa',
                  'Family Vacation'
                ].map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setPreference(pref)}
                    className={`p-2 rounded-xl border font-medium transition text-left ${
                      preference === pref
                        ? 'border-sky-600 bg-sky-50 text-sky-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateItinerary}
            disabled={isGenerating}
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Smart Itinerary</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output: Itinerary & Budget Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Destination Preview Card */}
          {currentDestination && (
            <div className="relative rounded-3xl overflow-hidden shadow-xs border border-slate-200/80 bg-white">
              <div className="h-44 sm:h-52 relative">
                <img
                  src={currentDestination.image}
                  alt={currentDestination.destination_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white flex items-end justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-500 text-white text-[10px] font-bold uppercase">
                      {currentDestination.category}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black mt-1">
                      {currentDestination.destination_name}
                    </h3>
                    <p className="text-xs text-sky-200">{currentDestination.state}, {currentDestination.country}</p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-slate-300 block">Duration</span>
                    <span className="font-bold text-white text-sm">{daysCount} Days / {daysCount - 1} Nights</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Budget Estimation Breakdown */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-teal-600" />
              <span>Projected Expense Breakdown</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block">Hotels ({daysCount}n)</span>
                <span className="text-base font-bold text-slate-800">${estHotelCost}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block">Transport ({travelers} pax)</span>
                <span className="text-base font-bold text-slate-800">${estTransportCost}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block">Food & Sights</span>
                <span className="text-base font-bold text-slate-800">${estDailyActivities}</span>
              </div>
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
                <span className="text-sky-700 font-semibold block">Total Estimated</span>
                <span className="text-base font-black text-sky-900">${estTotalCost}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500">
                Your Allocated Budget: <strong className="text-slate-800">${budget}</strong>
              </span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  budgetDifference >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {budgetDifference >= 0 ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Within Budget (${budgetDifference} buffer)
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    Exceeds Budget by ${Math.abs(budgetDifference)}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Daily Itinerary Timeline */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Suggested Daily Schedule</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Optimized for {preference} style with {travelers} traveler{travelers > 1 ? 's' : ''}.
                </p>
              </div>

              {generatedItinerary && (
                <button
                  type="button"
                  onClick={handleSaveTrip}
                  disabled={isSaving || savedSuccess}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                    savedSuccess
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-sky-600 hover:bg-sky-700 text-white'
                  }`}
                >
                  {savedSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Trip Saved!</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving...' : 'Save to Profile'}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {!generatedItinerary ? (
              <div className="text-center py-12 space-y-3">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-600">
                  Ready to map your days?
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click "Generate Smart Itinerary" on the left to create a customized schedule for {currentDestination.destination_name}.
                </p>
                <button
                  onClick={handleGenerateItinerary}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 transition"
                >
                  Generate Now
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {generatedItinerary.map((dayItem: any) => (
                  <div key={dayItem.day} className="flex gap-4 group">
                    {/* Day Marker */}
                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        D{dayItem.day}
                      </div>
                      <div className="w-0.5 flex-1 bg-slate-200 my-1 group-last:hidden" />
                    </div>

                    {/* Day Content */}
                    <div className="flex-1 pb-4">
                      <h4 className="font-bold text-slate-900 text-sm">
                        Day {dayItem.day}: {dayItem.title}
                      </h4>
                      <ul className="mt-2 space-y-1.5">
                        {dayItem.activities.map((act: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions at Bottom of Itinerary */}
            {generatedItinerary && (
              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3 items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Ready to reserve accommodations?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onNavigate('hotels')}
                    className="py-2 px-3.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <HotelIcon className="w-4 h-4" />
                    <span>Reserve Hotels</span>
                  </button>
                  <button
                    onClick={() => onNavigate('transport')}
                    className="py-2 px-3.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Plane className="w-4 h-4" />
                    <span>Book Transport</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
