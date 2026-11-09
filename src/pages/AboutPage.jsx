import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Award,
  Globe,
  BookOpen,
  Users,
  Building2,
  GraduationCap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { getPublicStats, getPublicDepartments } from '../services/api';

export default function AboutPage() {
  const [stats, setStats] = useState({
    departments: 0,
    courses: 0,
    faculty: 0,
    students: 0,
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadAboutData() {
      try {
        const [sData, dData] = await Promise.all([
          getPublicStats(),
          getPublicDepartments(),
        ]);
        if (isMounted) {
          setStats(sData || {});
          setDepartments(dData || []);
        }
      } catch {
        // Fallback handled gracefully by empty/0 state
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadAboutData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-left"
    >
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-900 rounded-3xl p-8 sm:p-14 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Heritage, Vision & Academic Excellence
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            About Apex University
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Founded in 1990, Apex University is an autonomous research-intensive institution dedicated to advancing science, engineering, and human knowledge through rigorous scholarship and real-world innovation.
          </p>
        </div>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Our Mission</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            To cultivate ethical, globally competent engineers and scientists equipped to solve complex societal challenges in clean energy, artificial intelligence, and sustainable infrastructure.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Research & Accreditation</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Accredited with NAAC A++ and ISO 9001:2015 certification, hosting interdisciplinary centers of excellence across {loading ? '—' : stats.departments || departments.length} specialized academic departments.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Digital Campus Governance</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Powered by a role-based Academic ERP providing transparent attendance tracking, real-time assessment analytics, and seamless student-faculty collaboration.
          </p>
        </motion.div>
      </div>

      {/* Live Institutional Footprint */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Live Institutional Footprint
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time metrics fetched directly from the University PostgreSQL database
            </p>
          </div>
          <Link
            to="/departments"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            Explore Academic Programs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
            <Building2 className="w-8 h-8 text-indigo-600 shrink-0" />
            <div>
              <div className="text-2xl font-extrabold text-slate-900">
                {loading ? '—' : stats.departments ?? departments.length}
              </div>
              <div className="text-xs text-slate-500 font-medium">Departments</div>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
            <BookOpen className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <div className="text-2xl font-extrabold text-slate-900">
                {loading ? '—' : stats.courses ?? 0}
              </div>
              <div className="text-xs text-slate-500 font-medium">Active Courses</div>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
            <Users className="w-8 h-8 text-violet-600 shrink-0" />
            <div>
              <div className="text-2xl font-extrabold text-slate-900">
                {loading ? '—' : stats.faculty ?? 0}
              </div>
              <div className="text-xs text-slate-500 font-medium">Faculty Members</div>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
            <GraduationCap className="w-8 h-8 text-amber-600 shrink-0" />
            <div>
              <div className="text-2xl font-extrabold text-slate-900">
                {loading ? '—' : stats.students ?? 0}
              </div>
              <div className="text-xs text-slate-500 font-medium">Enrolled Scholars</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
