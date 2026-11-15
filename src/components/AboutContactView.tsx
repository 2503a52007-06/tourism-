import React, { useState } from 'react';
import {
  Compass,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  Globe2,
  Users,
  Send,
  MessageSquare
} from 'lucide-react';

interface AboutContactViewProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AboutContactView: React.FC<AboutContactViewProps> = ({ showToast }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      showToast('Thank you! Your message has been received by our 24/7 concierge.', 'success');
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* About Section */}
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>About WanderLust Tourism</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Connecting Curious Travelers to the Wonders of the World
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Founded with a passion for genuine exploration, WanderLust delivers an end-to-end full-stack tourism
            platform where adventurers, families, and luxury seekers discover destinations, build itineraries,
            and manage all bookings under one unified portal.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Hand-Curated Destinations</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Every beach, alpine peak, safari plain, and heritage site is cataloged with real coordinates,
              climate benchmarks, and nearby attraction insights.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Relational Trust & Security</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Backed by robust MySQL relational integrity, parameterized REST APIs, JWT authentication,
              and instant confirmation tokens.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">24/7 Global Concierge</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Dedicated tourism representatives available around the clock to assist with booking changes,
              cancellations, and personalized recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-sky-950 p-8 rounded-3xl text-white space-y-6 shadow-xl">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-sky-300 block">
              Direct Contact
            </span>
            <h3 className="text-2xl font-black mt-1">Get in Touch With Our Team</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Have questions about destination visas, group bookings, or administrative accounts?
              We are here to assist.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">Headquarters</strong>
                <span className="text-slate-300">742 Evergreen Promenade, Tourism District, Suite 500</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">Phone Support</strong>
                <span className="text-slate-300">+1 (800) 555-WANDER / +1 (555) 019-2834</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">Email Inquiries</strong>
                <span className="text-slate-300">support@wanderlust-tourism.com</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">Operating Hours</strong>
                <span className="text-slate-300">Monday - Sunday: 24/7 Global Live Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Send an Inquiry</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill out this form and our support desk will respond within 2 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Question regarding Swiss Alps hotel booking"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Message Details
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your inquiry, dates, or travel assistance needs..."
                className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="py-3 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{sending ? 'Transmitting Message...' : 'Submit Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
