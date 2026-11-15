import React, { useState } from 'react';
import { HotelBooking, TransportBooking } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Ticket,
  Hotel as HotelIcon,
  Plane,
  Calendar,
  MapPin,
  Clock,
  Printer,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  CreditCard
} from 'lucide-react';

interface BookingsViewProps {
  hotelBookings: HotelBooking[];
  transportBookings: TransportBooking[];
  onCancelHotelBooking: (id: number) => Promise<void>;
  onCancelTransportBooking: (id: number) => Promise<void>;
  onNavigate: (tab: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  hotelBookings,
  transportBookings,
  onCancelHotelBooking,
  onCancelTransportBooking,
  onNavigate,
  showToast
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'hotels' | 'transport'>('hotels');
  const [selectedVoucher, setSelectedVoucher] = useState<{
    type: 'hotel' | 'transport';
    data: any;
  } | null>(null);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
          <Ticket className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Sign in to View Your Bookings</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Access your confirmed hotel reservations, train tickets, and flight itineraries.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider">
            <Ticket className="w-3.5 h-3.5" />
            <span>My Travel Dashboard</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Booking Management</h1>
          <p className="text-slate-500 text-sm">
            Review your active travel reservations, view digital vouchers, or manage cancellations.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('hotels')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'hotels' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HotelIcon className="w-4 h-4" />
            <span>Hotels ({hotelBookings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('transport')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'transport' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>Transport ({transportBookings.length})</span>
          </button>
        </div>
      </div>

      {/* Hotel Bookings Tab */}
      {activeTab === 'hotels' && (
        <div className="space-y-4">
          {hotelBookings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
              <HotelIcon className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-700">No hotel bookings yet</h3>
              <p className="text-sm text-slate-400">Ready to explore? Browse luxury stays in world-class destinations.</p>
              <button
                onClick={() => onNavigate('hotels')}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition"
              >
                Browse Hotels
              </button>
            </div>
          ) : (
            hotelBookings.map((hb) => (
              <div
                key={hb.booking_id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-start sm:items-center gap-4">
                  {hb.hotel_image && (
                    <img
                      src={hb.hotel_image}
                      alt={hb.hotel_name}
                      className="w-20 h-20 object-cover rounded-2xl shadow-xs flex-shrink-0"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          hb.booking_status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : hb.booking_status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {hb.booking_status}
                      </span>
                      <span className="text-xs font-mono text-slate-400">Ref #HTL-{hb.booking_id}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{hb.hotel_name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      <span>{hb.destination_name}</span>
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-600 mt-2 font-medium">
                      <span>Check-In: <strong>{hb.check_in}</strong></span>
                      <span>•</span>
                      <span>Check-Out: <strong>{hb.check_out}</strong></span>
                      <span>•</span>
                      <span>{hb.rooms} Room{hb.rooms > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">Total Paid</span>
                    <span className="text-xl font-black text-slate-900">${hb.total_amount}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedVoucher({ type: 'hotel', data: hb })}
                      className="py-2 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span>Voucher</span>
                    </button>

                    {hb.booking_status === 'Confirmed' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Cancel your booking at ${hb.hotel_name}? A full refund will be recorded.`)) {
                            onCancelHotelBooking(hb.booking_id);
                          }
                        }}
                        className="py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Transport Bookings Tab */}
      {activeTab === 'transport' && (
        <div className="space-y-4">
          {transportBookings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
              <Plane className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-700">No transportation reservations yet</h3>
              <p className="text-sm text-slate-400">Book flights, high-speed rail lines, or intercity express coaches.</p>
              <button
                onClick={() => onNavigate('transport')}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition"
              >
                Find Transport
              </button>
            </div>
          ) : (
            transportBookings.map((tb) => (
              <div
                key={tb.transport_booking_id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                    <Ticket className="w-7 h-7" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tb.booking_status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tb.booking_status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {tb.booking_status}
                      </span>
                      <span className="text-xs font-mono text-slate-400">Ref #TRP-{tb.transport_booking_id}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {tb.source} → {tb.destination}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {tb.transport_type} • Departure: {tb.departure_time} • {tb.number_of_tickets} Passenger{tb.number_of_tickets > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">Total Paid</span>
                    <span className="text-xl font-black text-slate-900">${tb.total_amount}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedVoucher({ type: 'transport', data: tb })}
                      className="py-2 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span>Boarding Pass</span>
                    </button>

                    {tb.booking_status === 'Confirmed' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Cancel reservation for ${tb.source} to ${tb.destination}? Seats will be released and refund recorded.`)) {
                            onCancelTransportBooking(tb.transport_booking_id);
                          }
                        }}
                        className="py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VOUCHER / DIGITAL TICKET MODAL */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-sky-600 to-teal-600 p-6 text-white relative">
              <button
                onClick={() => setSelectedVoucher(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-200 block">
                Official Digital Voucher
              </span>
              <h3 className="text-2xl font-black">
                {selectedVoucher.type === 'hotel'
                  ? selectedVoucher.data.hotel_name
                  : `${selectedVoucher.data.source} → ${selectedVoucher.data.destination}`}
              </h3>
              <p className="text-xs text-sky-100 mt-0.5">
                Status: <strong className="text-white">{selectedVoucher.data.booking_status}</strong>
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-medium">Passenger / Guest</span>
                  <span className="font-bold text-slate-800 text-sm">{user?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Booking Reference</span>
                  <span className="font-mono font-bold text-sky-600 text-sm">
                    {selectedVoucher.type === 'hotel'
                      ? `#HTL-${selectedVoucher.data.booking_id}`
                      : `#TRP-${selectedVoucher.data.transport_booking_id}`}
                  </span>
                </div>

                {selectedVoucher.type === 'hotel' ? (
                  <>
                    <div>
                      <span className="text-slate-400 block font-medium">Check-In</span>
                      <span className="font-semibold text-slate-800">{selectedVoucher.data.check_in}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Check-Out</span>
                      <span className="font-semibold text-slate-800">{selectedVoucher.data.check_out}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Rooms Reserved</span>
                      <span className="font-semibold text-slate-800">{selectedVoucher.data.rooms} Room(s)</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-slate-400 block font-medium">Departure Time</span>
                      <span className="font-semibold text-slate-800">{selectedVoucher.data.departure_time}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Tickets / Seats</span>
                      <span className="font-semibold text-slate-800">{selectedVoucher.data.number_of_tickets} Seat(s)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Transport Type</span>
                      <span className="font-semibold text-slate-800">{selectedVoucher.data.transport_type}</span>
                    </div>
                  </>
                )}

                <div>
                  <span className="text-slate-400 block font-medium">Total Paid</span>
                  <span className="font-black text-emerald-600 text-sm">${selectedVoucher.data.total_amount} USD</span>
                </div>
              </div>

              {/* Barcode & Verification */}
              <div className="pt-3 border-t border-dashed border-slate-300 flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span>||||| ||| ||||||| || |||||||| ||||</span>
                <span>AUTHENTICATED RESERVATION</span>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 font-bold text-slate-700 flex items-center justify-center gap-2 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Voucher</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedVoucher(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 font-bold text-white transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
