import React, { useState, useEffect } from 'react';
import { User, Trip } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  Calendar,
  Compass,
  MapPin,
  Trash2,
  DollarSign,
  Award,
  CheckCircle2
} from 'lucide-react';

interface ProfileViewProps {
  onNavigate: (tab: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate, showToast }) => {
  const { user, updateUser, token } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Saved trips
  const [savedTrips, setSavedTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  useEffect(() => {
    if (user && token) {
      setName(user.name);
      setPhone(user.phone || '');
      fetchTrips();
    }
  }, [user, token]);

  const fetchTrips = async () => {
    try {
      const res = await fetch('/api/trips', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedTrips(data);
      }
    } catch (err) {
      console.error('Fetch trips error:', err);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone, password })
      });

      const data = await res.json();
      if (res.ok) {
        updateUser(data.user);
        setPassword('');
        showToast('Profile updated successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to update profile', 'error');
      }
    } catch {
      showToast('Error updating profile', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTrip = async (tripId: number) => {
    if (!confirm('Are you sure you want to delete this saved itinerary?')) return;
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSavedTrips((prev) => prev.filter((t) => t.trip_id !== tripId));
        showToast('Trip itinerary deleted', 'info');
      }
    } catch {
      showToast('Failed to delete trip', 'error');
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Please sign in to view your profile</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Profile Overview Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center font-black text-2xl shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  user.role === 'admin'
                    ? 'bg-teal-100 text-teal-800 border border-teal-300'
                    : 'bg-sky-100 text-sky-800 border border-sky-300'
                }`}
              >
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email}
              </span>
              {user.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {user.phone}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Saved Trips</span>
            <span className="text-2xl font-black text-slate-900">{savedTrips.length}</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Status</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-4 h-4" /> Verified
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Edit Profile Form */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-sky-600" />
            <span>Account Settings</span>
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                New Password (Leave blank to keep existing)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-sky-600 hover:bg-sky-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isUpdating ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Right: Saved Trips & Daily Schedules */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Saved Travel Plans</h3>
              <p className="text-xs text-slate-500">Your planned itineraries with day-by-day schedules.</p>
            </div>
            <button
              onClick={() => onNavigate('planner')}
              className="py-1.5 px-3 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-bold transition"
            >
              + Create New Trip
            </button>
          </div>

          {loadingTrips ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading saved itineraries...</div>
          ) : savedTrips.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-600">No trips planned yet</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Use the Smart Trip Planner to generate day-by-day itineraries and save them here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedTrips.map((trip) => (
                <div
                  key={trip.trip_id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">
                        {trip.preferences || 'Custom Journey'}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base">
                        {trip.starting_location} → {trip.destination_name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {trip.start_date} to {trip.end_date} • {trip.travelers} Traveler(s) • Budget: ${trip.budget}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteTrip(trip.trip_id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition"
                      title="Delete Trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Itinerary Preview */}
                  {trip.itinerary && trip.itinerary.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 space-y-2">
                      <span className="text-[11px] font-semibold text-slate-700 block">Daily Highlights:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {trip.itinerary.map((day: any) => (
                          <div key={day.day} className="p-2 rounded-lg bg-white border border-slate-200/70">
                            <span className="font-bold text-sky-700 block text-[11px]">
                              Day {day.day}: {day.title}
                            </span>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                              {day.activities?.[0] || 'Orientation'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
