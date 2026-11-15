import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  MapPin,
  Calendar,
  Hotel,
  Plane,
  Ticket,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Info,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAuthModal: () => void;
  bookingCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openAuthModal,
  bookingCount = 0
}) => {
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'destinations', label: 'Destinations', icon: MapPin },
    { id: 'planner', label: 'Trip Planner', icon: Calendar },
    { id: 'hotels', label: 'Hotels', icon: Hotel },
    { id: 'transport', label: 'Transport', icon: Plane },
    { id: 'bookings', label: 'My Bookings', icon: Ticket, badge: bookingCount > 0 ? bookingCount : undefined },
    { id: 'about', label: 'About & Contact', icon: Info }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center">
                Wander<span className="text-sky-600">Lust</span>
              </span>
              <span className="text-[10px] block uppercase tracking-widest font-semibold text-slate-400 -mt-1">
                Tourism & Travel
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'text-sky-700 bg-sky-50 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Admin Dashboard shortcut if admin */}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  activeTab === 'admin'
                    ? 'text-teal-800 bg-teal-100/70 border border-teal-300'
                    : 'text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-teal-600" />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>

          {/* Right Action / User Profile */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                      {user.name}
                    </p>
                    <span className="text-[10px] font-medium text-slate-500 capitalize">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-xs font-semibold text-slate-800 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => handleNavClick('profile')}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>My Profile & Trips</span>
                    </button>

                    <button
                      onClick={() => handleNavClick('bookings')}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Ticket className="w-4 h-4 text-slate-400" />
                      <span>My Reservations</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-teal-700 hover:bg-teal-50 transition font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 text-teal-600" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 shadow-md hover:shadow-lg transition"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            {user && (
              <button
                onClick={() => handleNavClick('profile')}
                className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs font-bold"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-fadeIn shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'text-sky-700 bg-sky-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {isAdmin && (
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-teal-800 bg-teal-50 border border-teal-200"
            >
              <LayoutDashboard className="w-5 h-5 text-teal-600" />
              <span>Admin Dashboard</span>
            </button>
          )}

          <div className="border-t border-slate-100 pt-3">
            {user ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleNavClick('profile')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <UserIcon className="w-5 h-5 text-slate-400" />
                  <span>Account Profile</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-sky-600 text-center shadow-md"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
