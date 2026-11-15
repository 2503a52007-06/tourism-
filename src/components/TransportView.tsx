import React, { useState } from 'react';
import { Transport } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Plane,
  Train,
  Bus,
  Search,
  MapPin,
  Clock,
  Users,
  Calendar,
  ShieldCheck,
  Ticket,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface TransportViewProps {
  transports: Transport[];
  onBookTransport: (transport: Transport, tickets: number, total: number) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const TransportView: React.FC<TransportViewProps> = ({
  transports,
  onBookTransport,
  showToast
}) => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<'All' | 'Flight' | 'Train' | 'Bus'>('All');
  const [searchSource, setSearchSource] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [ticketCount, setTicketCount] = useState<Record<number, number>>({});

  const getTicketsFor = (id: number) => ticketCount[id] || 1;
  const setTicketsFor = (id: number, count: number) => {
    setTicketCount((prev) => ({ ...prev, [id]: count }));
  };

  const filtered = transports.filter((t) => {
    const matchType = selectedType === 'All' || t.transport_type === selectedType;
    const matchSource =
      searchSource.trim() === '' || t.source.toLowerCase().includes(searchSource.toLowerCase());
    const matchDest =
      searchDestination.trim() === '' ||
      t.destination.toLowerCase().includes(searchDestination.toLowerCase());
    return matchType && matchSource && matchDest;
  });

  const handleReserve = (transport: Transport) => {
    const tickets = getTicketsFor(transport.transport_id);
    if (transport.available_seats < tickets) {
      showToast(`Only ${transport.available_seats} seats remaining.`, 'error');
      return;
    }
    const total = transport.ticket_price * tickets;
    onBookTransport(transport, tickets, total);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider">
          <Plane className="w-3.5 h-3.5" />
          <span>Multimodal Travel Reservations</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Transportation Booking
        </h1>
        <p className="text-slate-500 text-sm max-w-2xl">
          Reserve scheduled flights, high-speed rail lines, and scenic intercity coaches with transparent pricing and instant seat allocation.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Type Selector */}
        <div className="flex flex-wrap gap-2">
          {(['All', 'Flight', 'Train', 'Bus'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedType === type
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'Flight' && <Plane className="w-3.5 h-3.5" />}
              {type === 'Train' && <Train className="w-3.5 h-3.5" />}
              {type === 'Bus' && <Bus className="w-3.5 h-3.5" />}
              <span>{type === 'All' ? 'All Transport Options' : `${type}s`}</span>
            </button>
          ))}
        </div>

        {/* Origin / Destination Search */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-2 border-t border-slate-100">
          <div className="md:col-span-5 relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Departure location (e.g. London, Zurich, Tokyo)..."
              value={searchSource}
              onChange={(e) => setSearchSource(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 font-medium"
            />
          </div>

          <div className="md:col-span-5 relative">
            <MapPin className="w-4 h-4 text-teal-600 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Destination city or airport..."
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 font-medium"
            />
          </div>

          <div className="md:col-span-2 text-right">
            <span className="text-xs font-semibold text-slate-500">
              <strong className="text-sky-600">{filtered.length}</strong> schedules
            </span>
          </div>
        </div>
      </div>

      {/* Schedules List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
          <Plane className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">No transport routes found</h3>
          <p className="text-sm text-slate-400">Try broadening your source or destination search terms.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((t) => {
            const count = getTicketsFor(t.transport_id);
            const total = t.ticket_price * count;

            return (
              <div
                key={t.transport_id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 hover:border-sky-300 shadow-xs hover:shadow-md transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                {/* Left: Mode Icon & Operator */}
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                      t.transport_type === 'Flight'
                        ? 'bg-sky-50 text-sky-600'
                        : t.transport_type === 'Train'
                        ? 'bg-teal-50 text-teal-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {t.transport_type === 'Flight' && <Plane className="w-7 h-7" />}
                    {t.transport_type === 'Train' && <Train className="w-7 h-7" />}
                    {t.transport_type === 'Bus' && <Bus className="w-7 h-7" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {t.transport_type}
                      </span>
                      <span className="text-xs text-slate-400">
                        {t.operator || 'Scheduled Service'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {t.source} → {t.destination}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Duration: {t.duration || '2h 30m'}</span>
                    </p>
                  </div>
                </div>

                {/* Middle: Timing schedule */}
                <div className="flex items-center gap-6 sm:gap-10 border-t sm:border-t-0 sm:border-l sm:border-r border-slate-100 sm:px-8 py-2 w-full lg:w-auto justify-between sm:justify-start">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Departs</span>
                    <span className="text-lg font-black text-slate-900">{t.departure_time}</span>
                    <span className="text-xs text-slate-500 block truncate max-w-[120px]">{t.source}</span>
                  </div>

                  <div className="flex flex-col items-center text-slate-300">
                    <span className="text-[10px] font-mono text-slate-400">{t.duration}</span>
                    <div className="w-16 h-0.5 bg-slate-200 relative my-1">
                      <div className="w-2 h-2 rounded-full bg-sky-500 absolute -top-[3px] right-0" />
                    </div>
                    <span className="text-[10px] text-slate-400">Direct Route</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Arrives</span>
                    <span className="text-lg font-black text-slate-900">{t.arrival_time}</span>
                    <span className="text-xs text-slate-500 block truncate max-w-[120px]">{t.destination}</span>
                  </div>
                </div>

                {/* Right: Price & Reservation Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-5 w-full lg:w-auto">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Price per passenger
                    </span>
                    <span className="text-xl font-black text-slate-900">${t.ticket_price}</span>
                    <span className="text-xs text-slate-400"> / ticket</span>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                      {t.available_seats} seats left
                    </p>
                  </div>

                  {/* Passengers Selector */}
                  <div className="flex items-center gap-2">
                    <select
                      value={count}
                      onChange={(e) => setTicketsFor(t.transport_id, parseInt(e.target.value))}
                      className="px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n} ticket{n > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      disabled={t.available_seats < count}
                      onClick={() => handleReserve(t)}
                      className="py-2.5 px-5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 shadow-sm hover:shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>Reserve (${total})</span>
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
