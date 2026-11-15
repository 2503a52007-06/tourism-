import React, { useState, useEffect } from 'react';
import { Destination, Hotel, Transport, AdminStats, User, Payment } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  Hotel as HotelIcon,
  Plane,
  Ticket,
  Users,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Download,
  Search,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Calendar,
  X,
  Save,
  Check,
  Compass
} from 'lucide-react';

interface AdminDashboardProps {
  destinations: Destination[];
  hotels: Hotel[];
  transports: Transport[];
  onRefreshData: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  destinations,
  hotels,
  transports,
  onRefreshData,
  showToast
}) => {
  const { user, token, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'destinations' | 'hotels' | 'transport' | 'bookings' | 'users' | 'payments'>('overview');

  // Stats state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Bookings list state
  const [allHotelBookings, setAllHotelBookings] = useState<any[]>([]);
  const [allTransportBookings, setAllTransportBookings] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);

  // Modals for CRUD
  const [destModalOpen, setDestModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<Destination | null>(null);

  const [hotelModalOpen, setHotelModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  const [transportModalOpen, setTransportModalOpen] = useState(false);

  // Destination Form State
  const [destName, setDestName] = useState('');
  const [destCountry, setDestCountry] = useState('');
  const [destState, setDestState] = useState('');
  const [destCategory, setDestCategory] = useState<'Beach' | 'Mountain' | 'Cultural' | 'Wildlife' | 'City' | 'Adventure'>('Beach');
  const [destDesc, setDestDesc] = useState('');
  const [destImage, setDestImage] = useState('');
  const [destRating, setDestRating] = useState('4.8');
  const [destBestTime, setDestBestTime] = useState('April to October');
  const [destClimate, setDestClimate] = useState('Tropical');
  const [destAttractions, setDestAttractions] = useState('Temple Tour, Sunset Beach, Rice Terraces');

  // Hotel Form State
  const [hotelName, setHotelName] = useState('');
  const [hotelDestId, setHotelDestId] = useState(destinations[0]?.destination_id || 1);
  const [hotelLocation, setHotelLocation] = useState('');
  const [hotelPrice, setHotelPrice] = useState('250');
  const [hotelRooms, setHotelRooms] = useState('15');
  const [hotelRating, setHotelRating] = useState('4.8');
  const [hotelImage, setHotelImage] = useState('');
  const [hotelAmenities, setHotelAmenities] = useState('Pool, Free WiFi, Spa, Breakfast');
  const [hotelDesc, setHotelDesc] = useState('');

  // Transport Form State
  const [transType, setTransType] = useState<'Flight' | 'Train' | 'Bus'>('Flight');
  const [transSource, setTransSource] = useState('');
  const [transDestination, setTransDestination] = useState('');
  const [transDepTime, setTransDepTime] = useState('10:00');
  const [transArrTime, setTransArrTime] = useState('12:30');
  const [transPrice, setTransPrice] = useState('150');
  const [transSeats, setTransSeats] = useState('50');
  const [transOperator, setTransOperator] = useState('Global Airlines');
  const [transDuration, setTransDuration] = useState('2h 30m');

  useEffect(() => {
    if (isAdmin && token) {
      loadStats();
      loadBookings();
      loadUsers();
      loadPayments();
    }
  }, [isAdmin, token]);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Stats error:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadBookings = async () => {
    try {
      const [hRes, tRes] = await Promise.all([
        fetch('/api/bookings/hotels', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/bookings/transport', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (hRes.ok) setAllHotelBookings(await hRes.json());
      if (tRes.ok) setAllTransportBookings(await tRes.json());
    } catch (err) {
      console.error('Bookings load error:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setAllUsers(await res.json());
    } catch (err) {
      console.error('Users load error:', err);
    }
  };

  const loadPayments = async () => {
    try {
      const res = await fetch('/api/payments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setAllPayments(await res.json());
    } catch (err) {
      console.error('Payments load error:', err);
    }
  };

  // ----------------------------------------------------
  // DESTINATION CRUD
  // ----------------------------------------------------
  const handleOpenDestModal = (dest?: Destination) => {
    if (dest) {
      setEditingDest(dest);
      setDestName(dest.destination_name);
      setDestCountry(dest.country);
      setDestState(dest.state);
      setDestCategory(dest.category);
      setDestDesc(dest.description);
      setDestImage(dest.image);
      setDestRating(String(dest.rating || 4.8));
      setDestBestTime(dest.best_time || '');
      setDestClimate(dest.climate || '');
      setDestAttractions(dest.attractions ? dest.attractions.join(', ') : '');
    } else {
      setEditingDest(null);
      setDestName('');
      setDestCountry('');
      setDestState('');
      setDestCategory('Beach');
      setDestDesc('');
      setDestImage('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80');
      setDestRating('4.8');
      setDestBestTime('April to October');
      setDestClimate('Tropical');
      setDestAttractions('Sunset Beach, Island Cruise, Snorkeling');
    }
    setDestModalOpen(true);
  };

  const handleSaveDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    const attractionsArr = destAttractions.split(',').map((s) => s.trim()).filter(Boolean);
    const payload = {
      destination_name: destName,
      country: destCountry,
      state: destState,
      category: destCategory,
      description: destDesc,
      image: destImage,
      rating: parseFloat(destRating),
      best_time: destBestTime,
      climate: destClimate,
      attractions: attractionsArr
    };

    try {
      let res;
      if (editingDest) {
        res = await fetch(`/api/destinations/${editingDest.destination_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/destinations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        showToast(editingDest ? 'Destination updated successfully' : 'New destination added', 'success');
        setDestModalOpen(false);
        await onRefreshData();
        loadStats();
      } else {
        showToast('Operation failed', 'error');
      }
    } catch {
      showToast('Error saving destination', 'error');
    }
  };

  const handleDeleteDestination = async (id: number) => {
    if (!confirm('Are you sure you want to delete this destination? Linked hotels and trips will be affected.')) return;
    try {
      const res = await fetch(`/api/destinations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Destination deleted', 'info');
        await onRefreshData();
        loadStats();
      }
    } catch {
      showToast('Error deleting destination', 'error');
    }
  };

  // ----------------------------------------------------
  // HOTEL CRUD & ROOM AVAILABILITY
  // ----------------------------------------------------
  const handleOpenHotelModal = (hotel?: Hotel) => {
    if (hotel) {
      setEditingHotel(hotel);
      setHotelName(hotel.hotel_name);
      setHotelDestId(hotel.destination_id);
      setHotelLocation(hotel.location);
      setHotelPrice(String(hotel.price_per_night));
      setHotelRooms(String(hotel.available_rooms));
      setHotelRating(String(hotel.rating));
      setHotelImage(hotel.image);
      setHotelAmenities(hotel.amenities ? hotel.amenities.join(', ') : '');
      setHotelDesc(hotel.description || '');
    } else {
      setEditingHotel(null);
      setHotelName('');
      setHotelDestId(destinations[0]?.destination_id || 1);
      setHotelLocation('');
      setHotelPrice('250');
      setHotelRooms('15');
      setHotelRating('4.8');
      setHotelImage('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80');
      setHotelAmenities('Infinity Pool, Free WiFi, Spa, Restaurant');
      setHotelDesc('');
    }
    setHotelModalOpen(true);
  };

  const handleSaveHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    const amenitiesArr = hotelAmenities.split(',').map((s) => s.trim()).filter(Boolean);
    const payload = {
      hotel_name: hotelName,
      destination_id: hotelDestId,
      location: hotelLocation,
      price_per_night: parseFloat(hotelPrice),
      available_rooms: parseInt(hotelRooms),
      rating: parseFloat(hotelRating),
      image: hotelImage,
      amenities: amenitiesArr,
      description: hotelDesc
    };

    try {
      let res;
      if (editingHotel) {
        res = await fetch(`/api/hotels/${editingHotel.hotel_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/hotels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        showToast(editingHotel ? 'Hotel updated successfully' : 'New hotel added', 'success');
        setHotelModalOpen(false);
        await onRefreshData();
        loadStats();
      } else {
        showToast('Operation failed', 'error');
      }
    } catch {
      showToast('Error saving hotel', 'error');
    }
  };

  const handleUpdateRooms = async (hotelId: number, currentRooms: number, delta: number) => {
    const updated = Math.max(0, currentRooms + delta);
    try {
      const res = await fetch(`/api/hotels/${hotelId}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ available_rooms: updated })
      });
      if (res.ok) {
        await onRefreshData();
        showToast(`Available rooms updated to ${updated}`, 'info');
      }
    } catch {
      showToast('Error updating rooms', 'error');
    }
  };

  const handleDeleteHotel = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return;
    try {
      const res = await fetch(`/api/hotels/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Hotel deleted', 'info');
        await onRefreshData();
        loadStats();
      }
    } catch {
      showToast('Error deleting hotel', 'error');
    }
  };

  // ----------------------------------------------------
  // TRANSPORT CRUD
  // ----------------------------------------------------
  const handleSaveTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      transport_type: transType,
      source: transSource,
      destination: transDestination,
      departure_time: transDepTime,
      arrival_time: transArrTime,
      ticket_price: parseFloat(transPrice),
      available_seats: parseInt(transSeats),
      operator: transOperator,
      duration: transDuration
    };

    try {
      const res = await fetch('/api/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('Transport route added', 'success');
        setTransportModalOpen(false);
        await onRefreshData();
        loadStats();
      }
    } catch {
      showToast('Failed to add transport', 'error');
    }
  };

  const handleDeleteTransport = async (id: number) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    try {
      const res = await fetch(`/api/transport/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Transport route deleted', 'info');
        await onRefreshData();
        loadStats();
      }
    } catch {
      showToast('Error deleting transport', 'error');
    }
  };

  // ----------------------------------------------------
  // BOOKING STATUS TOGGLE (APPROVE / REJECT)
  // ----------------------------------------------------
  const handleUpdateBookingStatus = async (type: 'hotel' | 'transport', id: number, newStatus: string) => {
    try {
      const url = type === 'hotel' ? `/api/bookings/hotels/${id}/status` : `/api/bookings/transport/${id}/status`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ booking_status: newStatus })
      });
      if (res.ok) {
        showToast(`Booking marked as ${newStatus}`, 'success');
        loadBookings();
        loadStats();
      }
    } catch {
      showToast('Status update failed', 'error');
    }
  };

  // ----------------------------------------------------
  // USER ROLE TOGGLE & DELETE
  // ----------------------------------------------------
  const handleToggleUserRole = async (userId: number, currentRole: string) => {
    const nextRole = currentRole === 'admin' ? 'customer' : 'admin';
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: nextRole })
      });
      if (res.ok) {
        showToast(`User role updated to ${nextRole}`, 'success');
        loadUsers();
      }
    } catch {
      showToast('Failed to change user role', 'error');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user account?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast('User account deleted', 'info');
        loadUsers();
        loadStats();
      } else {
        showToast(data.error || 'Failed to delete user', 'error');
      }
    } catch {
      showToast('Error deleting user', 'error');
    }
  };

  // ----------------------------------------------------
  // EXPORT CSV FINANCIAL REPORT
  // ----------------------------------------------------
  const handleExportCSV = () => {
    if (allPayments.length === 0) {
      showToast('No payment transactions to export', 'info');
      return;
    }

    const headers = ['Payment ID', 'User Email', 'Type', 'Amount USD', 'Method', 'Status', 'Date'];
    const rows = allPayments.map((p) => [
      p.payment_id,
      p.user_email || 'customer',
      p.booking_type || 'hotel',
      p.amount,
      p.payment_method,
      p.payment_status,
      p.transaction_date
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wanderlust_revenue_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Financial CSV report downloaded!', 'success');
  };

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Restricted Administrator Area</h2>
        <p className="text-sm text-slate-500">
          You must be logged in as an authorized administrator to view the Tourism Management System Control Dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/70 border border-teal-300 text-teal-800 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            Tourism Management Dashboard
          </h1>
          <p className="text-slate-500 text-sm">
            Live MySQL records management: Destinations, Hotels, Multimodal Transport, Bookings, Users & Financial Reports.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition self-start md:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Revenue Report (CSV)</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Revenue
          </span>
          <span className="text-2xl font-black text-teal-600">
            ${stats ? stats.totalRevenue.toLocaleString() : '---'}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Recorded successful payments</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Registered Users
          </span>
          <span className="text-2xl font-black text-slate-900">
            {stats ? stats.totalUsers : '---'}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Active tourist accounts</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Destinations
          </span>
          <span className="text-2xl font-black text-slate-900">
            {stats ? stats.totalDestinations : destinations.length}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Active tourism spots</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Hotel Bookings
          </span>
          <span className="text-2xl font-black text-slate-900">
            {stats ? stats.totalHotelBookings : allHotelBookings.length}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Stays reserved</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Transport Bookings
          </span>
          <span className="text-2xl font-black text-slate-900">
            {stats ? stats.totalTransportBookings : allTransportBookings.length}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Tickets allocated</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 pb-px text-sm">
        {[
          { id: 'overview', label: 'Analytics & Trends', icon: BarChart3 },
          { id: 'destinations', label: `Destinations (${destinations.length})`, icon: MapPin },
          { id: 'hotels', label: `Hotels (${hotels.length})`, icon: HotelIcon },
          { id: 'transport', label: `Transport (${transports.length})`, icon: Plane },
          { id: 'bookings', label: `All Customer Bookings (${allHotelBookings.length + allTransportBookings.length})`, icon: Ticket },
          { id: 'users', label: `Registered Users (${allUsers.length})`, icon: Users },
          { id: 'payments', label: `Financial Transactions (${allPayments.length})`, icon: DollarSign }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-teal-600 text-teal-800 bg-teal-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------ */}
      {/* 1. OVERVIEW & ANALYTICS CHARTS */}
      {/* ------------------------------------------------ */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Revenue Bars */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span>Monthly Revenue Performance ($ USD)</span>
            </h3>

            <div className="h-64 flex items-end justify-between gap-4 pt-6 px-2">
              {stats.revenueByMonth.map((m) => {
                const maxVal = Math.max(...stats.revenueByMonth.map((r) => r.revenue), 10000);
                const heightPercent = Math.round((m.revenue / maxVal) * 100);

                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition">
                      ${m.revenue}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-teal-600 to-sky-500 rounded-t-xl group-hover:from-teal-700 group-hover:to-sky-600 transition shadow-xs"
                    />
                    <span className="text-xs font-semibold text-slate-500">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bookings by Category */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-600" />
              <span>Bookings Distribution by Travel Category</span>
            </h3>

            <div className="space-y-3 pt-2">
              {stats.bookingsByCategory.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{c.category} Getaways</span>
                    <span className="text-sky-600">{c.count} bookings</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, c.count * 15 + 10)}%` }}
                      className="h-full bg-gradient-to-r from-sky-500 to-teal-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* 2. DESTINATIONS MANAGEMENT */}
      {/* ------------------------------------------------ */}
      {activeTab === 'destinations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Registered Tourist Destinations</h3>
            <button
              onClick={() => handleOpenDestModal()}
              className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Destination</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-[10px] text-slate-400 font-bold">
                  <tr>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Best Season</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {destinations.map((d) => (
                    <tr key={d.destination_id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img src={d.image} alt={d.destination_name} className="w-10 h-10 rounded-xl object-cover" />
                        <span className="font-bold text-slate-900">{d.destination_name}</span>
                      </td>
                      <td className="py-3 px-4">{d.state}, {d.country}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {d.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-amber-600">★ {d.rating || 4.8}</td>
                      <td className="py-3 px-4 text-slate-500">{d.best_time?.split('&')[0]}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenDestModal(d)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition"
                          title="Edit Destination"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDestination(d.destination_id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Destination"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* 3. HOTELS MANAGEMENT & AVAILABILITY */}
      {/* ------------------------------------------------ */}
      {activeTab === 'hotels' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Hotels & Room Inventory</h3>
            <button
              onClick={() => handleOpenHotelModal()}
              className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Hotel</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-[10px] text-slate-400 font-bold">
                  <tr>
                    <th className="py-3 px-4">Hotel Name</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Price / Night</th>
                    <th className="py-3 px-4">Available Rooms</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {hotels.map((h) => (
                    <tr key={h.hotel_id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img src={h.image} alt={h.hotel_name} className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <p className="font-bold text-slate-900">{h.hotel_name}</p>
                          <p className="text-[11px] text-slate-400">{h.location}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-teal-700">{h.destination_name || 'Dest #' + h.destination_id}</td>
                      <td className="py-3 px-4 font-black text-slate-900">${h.price_per_night}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateRooms(h.hotel_id, h.available_rooms, -1)}
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700"
                            title="Decrease Room Availability"
                          >
                            -
                          </button>
                          <span className={`font-bold ${h.available_rooms === 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                            {h.available_rooms}
                          </span>
                          <button
                            onClick={() => handleUpdateRooms(h.hotel_id, h.available_rooms, 1)}
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700"
                            title="Increase Room Availability"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-amber-600">★ {h.rating}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenHotelModal(h)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition"
                          title="Edit Hotel"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteHotel(h.hotel_id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Hotel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* 4. TRANSPORTATION MANAGEMENT */}
      {/* ------------------------------------------------ */}
      {activeTab === 'transport' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Transportation Routes & Inventory</h3>
            <button
              onClick={() => setTransportModalOpen(true)}
              className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Transport Route</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-[10px] text-slate-400 font-bold">
                  <tr>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Operator</th>
                    <th className="py-3 px-4">Route</th>
                    <th className="py-3 px-4">Timing</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Available Seats</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {transports.map((t) => (
                    <tr key={t.transport_id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-800">{t.transport_type}</td>
                      <td className="py-3 px-4">{t.operator}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{t.source} → {t.destination}</td>
                      <td className="py-3 px-4 text-slate-500">{t.departure_time} - {t.arrival_time}</td>
                      <td className="py-3 px-4 font-black text-slate-900">${t.ticket_price}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{t.available_seats} seats</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteTransport(t.transport_id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Route"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* 5. ALL CUSTOMER BOOKINGS & STATUS TOGGLE */}
      {/* ------------------------------------------------ */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* Hotel Bookings Table */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">Customer Hotel Bookings</h3>
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-[10px] text-slate-400 font-bold">
                    <tr>
                      <th className="py-3 px-4">Ref #</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Hotel</th>
                      <th className="py-3 px-4">Dates</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Confirm / Reject</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {allHotelBookings.map((hb) => (
                      <tr key={hb.booking_id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-500">#{hb.booking_id}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{hb.user_name}</p>
                          <p className="text-[11px] text-slate-400">{hb.user_email}</p>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{hb.hotel_name}</td>
                        <td className="py-3 px-4 text-slate-500">{hb.check_in} to {hb.check_out}</td>
                        <td className="py-3 px-4 font-black text-slate-900">${hb.total_amount}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              hb.booking_status === 'Confirmed'
                                ? 'bg-emerald-50 text-emerald-700'
                                : hb.booking_status === 'Cancelled'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {hb.booking_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => handleUpdateBookingStatus('hotel', hb.booking_id, 'Confirmed')}
                            className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold transition"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleUpdateBookingStatus('hotel', hb.booking_id, 'Cancelled')}
                            className="px-2 py-1 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-bold transition"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Transport Bookings Table */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">Customer Transport Reservations</h3>
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-[10px] text-slate-400 font-bold">
                    <tr>
                      <th className="py-3 px-4">Ref #</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Route</th>
                      <th className="py-3 px-4">Tickets</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Confirm / Reject</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {allTransportBookings.map((tb) => (
                      <tr key={tb.transport_booking_id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-500">#{tb.transport_booking_id}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{tb.user_name}</p>
                          <p className="text-[11px] text-slate-400">{tb.user_email}</p>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{tb.source} → {tb.destination}</td>
                        <td className="py-3 px-4">{tb.number_of_tickets} Passenger(s)</td>
                        <td className="py-3 px-4 font-black text-slate-900">${tb.total_amount}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              tb.booking_status === 'Confirmed'
                                ? 'bg-emerald-50 text-emerald-700'
                                : tb.booking_status === 'Cancelled'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {tb.booking_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => handleUpdateBookingStatus('transport', tb.transport_booking_id, 'Confirmed')}
                            className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold transition"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleUpdateBookingStatus('transport', tb.transport_booking_id, 'Cancelled')}
                            className="px-2 py-1 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-bold transition"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* 6. USERS MANAGEMENT */}
      {/* ------------------------------------------------ */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Registered Accounts</h3>
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-[10px] text-slate-400 font-bold">
                  <tr>
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Current Role</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {allUsers.map((u) => (
                    <tr key={u.user_id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-400">#{u.user_id}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                      <td className="py-3 px-4 text-slate-600">{u.email}</td>
                      <td className="py-3 px-4 text-slate-500">{u.phone || '---'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleUserRole(u.user_id, u.role)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold transition"
                        >
                          Make {u.role === 'admin' ? 'Customer' : 'Admin'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.user_id)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* 7. FINANCIAL TRANSACTIONS LEDGER */}
      {/* ------------------------------------------------ */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Payment Transactions Ledger</h3>
            <button
              onClick={handleExportCSV}
              className="py-2 px-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-[10px] text-slate-400 font-bold">
                  <tr>
                    <th className="py-3 px-4">Txn #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {allPayments.map((p) => (
                    <tr key={p.payment_id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-sky-600">#TXN-{p.payment_id}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{p.user_name || 'Customer'}</p>
                        <p className="text-[11px] text-slate-400">{p.user_email}</p>
                      </td>
                      <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-600">{p.booking_type}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{p.payment_method}</td>
                      <td className="py-3 px-4 font-black text-slate-900">${p.amount}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.payment_status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {p.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{p.transaction_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* DESTINATION EDIT / ADD MODAL */}
      {/* ------------------------------------------------ */}
      {destModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-teal-700 to-sky-700 p-6 text-white relative">
              <button
                onClick={() => setDestModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold">{editingDest ? 'Edit Destination' : 'Add New Destination'}</h3>
              <p className="text-xs text-teal-100 mt-0.5">Records are persisted in MySQL relational tables.</p>
            </div>

            <form onSubmit={handleSaveDestination} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Destination Name</label>
                  <input
                    type="text"
                    required
                    value={destName}
                    onChange={(e) => setDestName(e.target.value)}
                    placeholder="e.g. Serengeti National Park"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={destCategory}
                    onChange={(e) => setDestCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {['Beach', 'Mountain', 'Cultural', 'Wildlife', 'City', 'Adventure'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={destCountry}
                    onChange={(e) => setDestCountry(e.target.value)}
                    placeholder="e.g. Tanzania"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">State / Region</label>
                  <input
                    type="text"
                    required
                    value={destState}
                    onChange={(e) => setDestState(e.target.value)}
                    placeholder="e.g. Mara Region"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={destImage}
                  onChange={(e) => setDestImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={destDesc}
                  onChange={(e) => setDestDesc(e.target.value)}
                  placeholder="Detailed background and highlights of this destination..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={destRating}
                    onChange={(e) => setDestRating(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Best Season</label>
                  <input
                    type="text"
                    value={destBestTime}
                    onChange={(e) => setDestBestTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Climate</label>
                  <input
                    type="text"
                    value={destClimate}
                    onChange={(e) => setDestClimate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Key Attractions (comma separated)
                </label>
                <input
                  type="text"
                  value={destAttractions}
                  onChange={(e) => setDestAttractions(e.target.value)}
                  placeholder="Attraction 1, Attraction 2, Attraction 3"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setDestModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-sm"
                >
                  Save Destination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* HOTEL EDIT / ADD MODAL */}
      {/* ------------------------------------------------ */}
      {hotelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-teal-700 to-sky-700 p-6 text-white relative">
              <button
                onClick={() => setHotelModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold">{editingHotel ? 'Edit Hotel' : 'Add New Hotel'}</h3>
              <p className="text-xs text-teal-100 mt-0.5">Manage rates, amenities, and room availability.</p>
            </div>

            <form onSubmit={handleSaveHotel} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Hotel Name</label>
                  <input
                    type="text"
                    required
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    placeholder="e.g. Grand Alpine Resort"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Destination</label>
                  <select
                    value={hotelDestId}
                    onChange={(e) => setHotelDestId(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {destinations.map((d) => (
                      <option key={d.destination_id} value={d.destination_id}>
                        {d.destination_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Location Address</label>
                <input
                  type="text"
                  required
                  value={hotelLocation}
                  onChange={(e) => setHotelLocation(e.target.value)}
                  placeholder="e.g. Coastal Road, Nusa Dua, Bali"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Price per Night ($)</label>
                  <input
                    type="number"
                    required
                    value={hotelPrice}
                    onChange={(e) => setHotelPrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Available Rooms</label>
                  <input
                    type="number"
                    required
                    value={hotelRooms}
                    onChange={(e) => setHotelRooms(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Star Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={hotelRating}
                    onChange={(e) => setHotelRating(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={hotelImage}
                  onChange={(e) => setHotelImage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Amenities (comma separated)
                </label>
                <input
                  type="text"
                  value={hotelAmenities}
                  onChange={(e) => setHotelAmenities(e.target.value)}
                  placeholder="Pool, Spa, Breakfast, High-speed WiFi"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={hotelDesc}
                  onChange={(e) => setHotelDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setHotelModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-sm"
                >
                  Save Hotel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* TRANSPORT ADD MODAL */}
      {/* ------------------------------------------------ */}
      {transportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-sky-700 to-teal-700 p-6 text-white relative">
              <button
                onClick={() => setTransportModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold">Add Transport Route</h3>
              <p className="text-xs text-sky-100 mt-0.5">Define multi-modal schedules, pricing, and available seats.</p>
            </div>

            <form onSubmit={handleSaveTransport} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Type</label>
                  <select
                    value={transType}
                    onChange={(e) => setTransType(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="Flight">Flight</option>
                    <option value="Train">Train</option>
                    <option value="Bus">Bus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Operator</label>
                  <input
                    type="text"
                    required
                    value={transOperator}
                    onChange={(e) => setTransOperator(e.target.value)}
                    placeholder="e.g. Eurostar or Swiss Air"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Departure City</label>
                  <input
                    type="text"
                    required
                    value={transSource}
                    onChange={(e) => setTransSource(e.target.value)}
                    placeholder="e.g. London (LHR)"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Destination City</label>
                  <input
                    type="text"
                    required
                    value={transDestination}
                    onChange={(e) => setTransDestination(e.target.value)}
                    placeholder="e.g. Zurich (ZRH)"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Departure Time</label>
                  <input
                    type="text"
                    required
                    value={transDepTime}
                    onChange={(e) => setTransDepTime(e.target.value)}
                    placeholder="09:30"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Arrival Time</label>
                  <input
                    type="text"
                    required
                    value={transArrTime}
                    onChange={(e) => setTransArrTime(e.target.value)}
                    placeholder="12:15"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Ticket Price ($)</label>
                  <input
                    type="number"
                    required
                    value={transPrice}
                    onChange={(e) => setTransPrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Seats</label>
                  <input
                    type="number"
                    required
                    value={transSeats}
                    onChange={(e) => setTransSeats(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    value={transDuration}
                    onChange={(e) => setTransDuration(e.target.value)}
                    placeholder="2h 45m"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setTransportModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-sm"
                >
                  Add Transport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
