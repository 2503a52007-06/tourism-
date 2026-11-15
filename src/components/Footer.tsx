import React from 'react';
import { Compass, Mail, Phone, MapPin, Heart, Shield, Globe, Award } from 'lucide-react';

interface FooterProps {
  onNavClick: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Wander<span className="text-sky-400">Lust</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Your comprehensive full-stack Tourism Management System. Curating memorable adventures,
              handpicked luxury stays, seamless multimodal transport, and personalized itineraries worldwide.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold bg-sky-950/60 px-3 py-1.5 rounded-lg border border-sky-800/50">
                <Shield className="w-4 h-4 text-sky-400" />
                <span>Verified Travel Network</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/50">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Award-winning Agency</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavClick('destinations')} className="hover:text-white transition">
                  Tourist Destinations
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('planner')} className="hover:text-white transition">
                  Smart Trip Planner
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('hotels')} className="hover:text-white transition">
                  Luxury Hotels & Resorts
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('transport')} className="hover:text-white transition">
                  Flights, Trains & Coaches
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('about')} className="hover:text-white transition">
                  About Our Organization
                </button>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              Travel Themes
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavClick('destinations')} className="hover:text-white transition">
                  Tropical Beaches & Islands
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('destinations')} className="hover:text-white transition">
                  Alpine Peaks & Skiing
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('destinations')} className="hover:text-white transition">
                  Historical & Cultural Heritage
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('destinations')} className="hover:text-white transition">
                  Savanna Wildlife Safaris
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('destinations')} className="hover:text-white transition">
                  Extreme Outdoor Adventures
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">
              24/7 Concierge
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-slate-400">
                <MapPin className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                <span>742 Evergreen Promenade, Global Travel Center</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Phone className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>+1 (800) 555-WANDER</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Mail className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>concierge@wanderlust-tourism.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 WanderLust Tourism Management System. Built with Node.js, Express & MySQL Database.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Security Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
