import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Destination, Hotel, Transport, HotelBooking, TransportBooking } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { DestinationsView } from './components/DestinationsView';
import { TripPlannerView } from './components/TripPlannerView';
import { HotelsView } from './components/HotelsView';
import { TransportView } from './components/TransportView';
import { BookingsView } from './components/BookingsView';
import { ProfileView } from './components/ProfileView';
import { AdminDashboard } from './components/AdminDashboard';
import { AboutContactView } from './components/AboutContactView';
import { AuthModal } from './components/AuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { Toast, ToastMessage } from './components/Toast';

function TourismApp() {
  const { user, token, isAdmin } = useAuth();

  // Tab navigation
  const [activeTab, setActiveTab] = useState<string>('home');

  // Shared Data States
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [hotelBookings, setHotelBookings] = useState<HotelBooking[]>([]);
  const [transportBookings, setTransportBookings] = useState<TransportBooking[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Cross-view selections
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [preselectedDestForPlanner, setPreselectedDestForPlanner] = useState<Destination | null>(null);
  const [hotelDestFilter, setHotelDestFilter] = useState<number | null>(null);
  const [destinationSearchQuery, setDestinationSearchQuery] = useState('');

  // Modals & Toasts
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Checkout Modal State
  const [checkoutConfig, setCheckoutConfig] = useState<{
    isOpen: boolean;
    bookingType: 'hotel' | 'transport';
    title: string;
    itemSubtitle: string;
    itemImage?: string;
    baseAmount: number;
    details: { label: string; value: string }[];
    onConfirm: (method: string, total: number) => Promise<boolean>;
  }>({
    isOpen: false,
    bookingType: 'hotel',
    title: '',
    itemSubtitle: '',
    baseAmount: 0,
    details: [],
    onConfirm: async () => false
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [dRes, hRes, tRes] = await Promise.all([
        fetch('/api/destinations'),
        fetch('/api/hotels'),
        fetch('/api/transport')
      ]);

      if (dRes.ok) setDestinations(await dRes.json());
      if (hRes.ok) setHotels(await hRes.json());
      if (tRes.ok) setTransports(await tRes.json());
    } catch (err) {
      console.error('Failed to load initial tourism data:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  // Fetch user bookings
  const fetchUserBookings = async () => {
    if (!token) {
      setHotelBookings([]);
      setTransportBookings([]);
      return;
    }
    try {
      const [hbRes, tbRes] = await Promise.all([
        fetch('/api/bookings/hotels', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/bookings/transport', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (hbRes.ok) setHotelBookings(await hbRes.json());
      if (tbRes.ok) setTransportBookings(await tbRes.json());
    } catch (err) {
      console.error('Failed to load user bookings:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchUserBookings();
  }, [token]);

  // Navigate & scroll to top
  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Flow: Select destination from home
  const handleSelectDestination = (dest: Destination) => {
    setSelectedDestination(dest);
    setActiveTab('destinations');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Flow: Plan trip from destination
  const handlePlanTripToDest = (dest: Destination) => {
    setPreselectedDestForPlanner(dest);
    setActiveTab('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Flow: Find hotels for destination
  const handleFindHotelsForDest = (destId: number) => {
    setHotelDestFilter(destId);
    setActiveTab('hotels');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Flow: Search from hero
  const handleHeroSearch = (searchTerm: string) => {
    setDestinationSearchQuery(searchTerm);
    setActiveTab('destinations');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Flow: Book Hotel Trigger
  const handleStartHotelBooking = (
    hotel: Hotel,
    checkIn: string,
    checkOut: string,
    rooms: number,
    baseTotal: number
  ) => {
    if (!user) {
      setAuthModalOpen(true);
      showToast('Please sign in to complete your hotel reservation', 'info');
      return;
    }

    setCheckoutConfig({
      isOpen: true,
      bookingType: 'hotel',
      title: hotel.hotel_name,
      itemSubtitle: `${hotel.location} (${hotel.destination_name || 'Destination'})`,
      itemImage: hotel.image,
      baseAmount: baseTotal,
      details: [
        { label: 'Check-In', value: checkIn },
        { label: 'Check-Out', value: checkOut },
        { label: 'Rooms Reserved', value: `${rooms} Room(s)` },
        { label: 'Guest Name', value: user.name }
      ],
      onConfirm: async (method: string, finalTotal: number) => {
        try {
          const res = await fetch('/api/bookings/hotels', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              hotel_id: hotel.hotel_id,
              check_in: checkIn,
              check_out: checkOut,
              rooms,
              total_amount: finalTotal,
              payment_method: method
            })
          });

          const data = await res.json();
          if (res.ok) {
            showToast(`Hotel booking confirmed for ${hotel.hotel_name}!`, 'success');
            await fetchData();
            await fetchUserBookings();
            return true;
          } else {
            showToast(data.error || 'Hotel booking failed', 'error');
            return false;
          }
        } catch {
          showToast('Payment processing error', 'error');
          return false;
        }
      }
    });
  };

  // Flow: Book Transport Trigger
  const handleStartTransportBooking = (
    transport: Transport,
    tickets: number,
    baseTotal: number
  ) => {
    if (!user) {
      setAuthModalOpen(true);
      showToast('Please sign in to reserve transportation', 'info');
      return;
    }

    setCheckoutConfig({
      isOpen: true,
      bookingType: 'transport',
      title: `${transport.source} → ${transport.destination}`,
      itemSubtitle: `${transport.transport_type} • Operator: ${transport.operator || 'Scheduled Service'}`,
      baseAmount: baseTotal,
      details: [
        { label: 'Route', value: `${transport.source} to ${transport.destination}` },
        { label: 'Departs', value: transport.departure_time },
        { label: 'Duration', value: transport.duration || '2h 30m' },
        { label: 'Tickets', value: `${tickets} Passenger(s)` },
        { label: 'Lead Traveler', value: user.name }
      ],
      onConfirm: async (method: string, finalTotal: number) => {
        try {
          const res = await fetch('/api/bookings/transport', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              transport_id: transport.transport_id,
              number_of_tickets: tickets,
              total_amount: finalTotal,
              payment_method: method
            })
          });

          const data = await res.json();
          if (res.ok) {
            showToast(`Transport reservation confirmed!`, 'success');
            await fetchData();
            await fetchUserBookings();
            return true;
          } else {
            showToast(data.error || 'Transport booking failed', 'error');
            return false;
          }
        } catch {
          showToast('Payment error', 'error');
          return false;
        }
      }
    });
  };

  // Cancel Hotel Booking
  const handleCancelHotelBooking = async (id: number) => {
    try {
      const res = await fetch(`/api/bookings/hotels/${id}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Hotel booking cancelled. Refund processed.', 'info');
        await fetchData();
        await fetchUserBookings();
      } else {
        showToast(data.error || 'Failed to cancel', 'error');
      }
    } catch {
      showToast('Error processing cancellation', 'error');
    }
  };

  // Cancel Transport Booking
  const handleCancelTransportBooking = async (id: number) => {
    try {
      const res = await fetch(`/api/bookings/transport/${id}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Transport reservation cancelled. Refund recorded.', 'info');
        await fetchData();
        await fetchUserBookings();
      } else {
        showToast(data.error || 'Failed to cancel reservation', 'error');
      }
    } catch {
      showToast('Error processing cancellation', 'error');
    }
  };

  const totalUserBookings = hotelBookings.length + transportBookings.length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased selection:bg-sky-500 selection:text-white">
      {/* Toast Notification Layer */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        openAuthModal={() => setAuthModalOpen(true)}
        bookingCount={totalUserBookings}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            destinations={destinations}
            hotels={hotels}
            onSelectDestination={handleSelectDestination}
            onSelectHotel={(hotel) => {
              setActiveTab('hotels');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigate={handleNavigate}
            onSearch={handleHeroSearch}
          />
        )}

        {activeTab === 'destinations' && (
          <DestinationsView
            destinations={destinations}
            selectedDestination={selectedDestination}
            onSelectDestination={setSelectedDestination}
            onPlanTrip={handlePlanTripToDest}
            onFindHotels={handleFindHotelsForDest}
            showToast={showToast}
            initialSearch={destinationSearchQuery}
          />
        )}

        {activeTab === 'planner' && (
          <TripPlannerView
            destinations={destinations}
            preselectedDestination={preselectedDestForPlanner}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        )}

        {activeTab === 'hotels' && (
          <HotelsView
            hotels={hotels}
            destinations={destinations}
            initialDestinationId={hotelDestFilter}
            onBookHotel={handleStartHotelBooking}
            showToast={showToast}
          />
        )}

        {activeTab === 'transport' && (
          <TransportView
            transports={transports}
            onBookTransport={handleStartTransportBooking}
            showToast={showToast}
          />
        )}

        {activeTab === 'bookings' && (
          <BookingsView
            hotelBookings={hotelBookings}
            transportBookings={transportBookings}
            onCancelHotelBooking={handleCancelHotelBooking}
            onCancelTransportBooking={handleCancelTransportBooking}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView onNavigate={handleNavigate} showToast={showToast} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            destinations={destinations}
            hotels={hotels}
            transports={transports}
            onRefreshData={fetchData}
            showToast={showToast}
          />
        )}

        {activeTab === 'about' && <AboutContactView showToast={showToast} />}
      </main>

      {/* Global Footer */}
      <Footer onNavClick={handleNavigate} />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          showToast(`Welcome to WanderLust!`, 'success');
          fetchUserBookings();
        }}
      />

      {/* Checkout & Simulated Payment Modal */}
      <CheckoutModal
        isOpen={checkoutConfig.isOpen}
        onClose={() => setCheckoutConfig((prev) => ({ ...prev, isOpen: false }))}
        bookingType={checkoutConfig.bookingType}
        title={checkoutConfig.title}
        itemSubtitle={checkoutConfig.itemSubtitle}
        itemImage={checkoutConfig.itemImage}
        baseAmount={checkoutConfig.baseAmount}
        details={checkoutConfig.details}
        onConfirmPayment={checkoutConfig.onConfirm}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TourismApp />
    </AuthProvider>
  );
}
