import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Home,
  Info,
  Building2,
  Users,
  LogIn,
  Menu,
  X,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-react';

export default function PublicLayout({ user }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/about', label: 'About', icon: Info },
    { to: '/departments', label: 'Departments', icon: Building2 },
    { to: '/faculty', label: 'Faculty', icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Announcement Ribbon */}
      <div className="bg-indigo-950 text-indigo-100 text-xs py-2 px-4 border-b border-indigo-900">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-400 text-slate-950">
              NAAC A++ Accredited
            </span>
            <span className="hidden sm:inline text-indigo-200">
              Admissions Open for 2026–2027 • B.Tech, M.Tech & Doctoral Programs
            </span>
          </div>
          <div className="flex items-center gap-4 text-indigo-300">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> admissions@apexuniversity.edu
            </span>
            <span className="hidden md:flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> +1 (555) 234-5600
            </span>
          </div>
        </div>
      </div>

      {/* Main Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="block text-xl font-extrabold tracking-tight text-slate-900">
                Apex University
              </span>
              <span className="block text-xs font-medium text-slate-500">
                Institute of Science & Technology
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-blue-900 bg-blue-50/90 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Action CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/portal"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-900 to-indigo-700 hover:from-blue-800 hover:to-indigo-600 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              {user ? `ERP Portal (${user.username})` : 'Student Login / Register'}
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 overflow-hidden"
            >
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                      isActive
                        ? 'bg-blue-50 text-blue-900'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
              <Link
                to="/portal"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full mt-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-900 to-indigo-700"
              >
                <LogIn className="w-4 h-4" />
                {user ? 'Open ERP Dashboard' : 'Student Login / Register'}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Modern University Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white">Apex University</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Empowering the next generation of engineers, scientists, and innovators through world-class research laboratories, interdisciplinary curricula, and industry collaboration.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium pt-1">
              <ShieldCheck className="w-4 h-4" />
              ISO 9001:2015 Certified & National Research Excellence Hub
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Explore Campus
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home & Announcements
                </Link>
              </li>
              <li>
                <Link to="/departments" className="hover:text-white transition-colors">
                  Academic Departments & Courses
                </Link>
              </li>
              <li>
                <Link to="/faculty" className="hover:text-white transition-colors">
                  Distinguished Faculty Directory
                </Link>
              </li>
              <li>
                <Link to="/portal" className="hover:text-white transition-colors">
                  Student & Faculty ERP Portal
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5 text-sm">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Campus Address
            </h4>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-1" />
              <span>University Innovation Parkway, Knowledge City, Sector 14</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>registrar@apexuniversity.edu</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>+1 (555) 234-5600</span>
            </p>
          </div>
        </div>
        <div className="border-t border-slate-900 py-5 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Apex University ERP & Academic Information System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
