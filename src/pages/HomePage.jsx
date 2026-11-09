import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  BookOpen,
  Users,
  GraduationCap,
  Bell,
  ArrowRight,
  Calendar,
  Cpu,
  Sparkles,
  Target,
  Compass,
  Code2,
  ShieldCheck,
  Monitor,
  Lightbulb,
  Library,
  CheckCircle2,
  RefreshCw,
  Award,
} from 'lucide-react';
import {
  getPublicStats,
  getPublicDepartments,
  getPublicCourses,
  getPublicNotices,
} from '../services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const OPTIMISTIC_ERROR_MESSAGE =
  'System updates in progress. Campus data will be temporarily running in offline mode.';

// --- PROFESSIONAL FALLBACK DATA ---
// This data will display if your database is currently empty.
const FALLBACK_STATS = {
  departments: 4,
  courses: 18,
  faculty: 54,
  students: 1250,
  notices: 12,
};

const FALLBACK_NOTICES = [
  {
    id: 1,
    category: 'Event',
    date: 'Oct 24, 2026',
    title: 'Registration Open: Annual Winter Hackathon',
    content: 'Join over 500 students in our 48-hour campus hackathon. Cloud infrastructure and APIs will be provided by our enterprise partners.',
    author: 'Innovation Cell',
  },
  {
    id: 2,
    category: 'Academics',
    date: 'Oct 20, 2026',
    title: 'End-Semester Examination Schedule Published',
    content: 'The final examination timetable for all B.Tech and M.Tech programs is now available on the student ERP portal.',
    author: 'Registrar Office',
  },
  {
    id: 3,
    category: 'Guest Lecture',
    date: 'Oct 18, 2026',
    title: 'Industry Talk: Modern Full-Stack Architecture',
    content: 'Senior Engineers from leading tech firms will discuss the evolution of React, Spring Boot, and cloud-native deployments.',
    author: 'CS Department',
  },
];

const FALLBACK_DEPARTMENTS = [
  {
    id: 1,
    code: 'CSE',
    establishedYear: '1990',
    name: 'Computer Science & Engineering',
    description: 'Pioneering research in artificial intelligence, distributed systems, and full-stack software architecture with state-of-the-art labs.',
    headOfDepartment: 'Dr. Alan Turing',
  },
  {
    id: 2,
    code: 'AIDS',
    establishedYear: '2020',
    name: 'AI & Data Science',
    description: 'An advanced interdisciplinary center focusing on machine learning algorithms, big data analytics, and neural network engineering.',
    headOfDepartment: 'Dr. Ada Lovelace',
  },
  {
    id: 3,
    code: 'ECE',
    establishedYear: '1995',
    name: 'Electronics & Communication',
    description: 'Bridging software and hardware through advanced VLSI design, IoT ecosystems, and next-generation telecommunications.',
    headOfDepartment: 'Dr. C.V. Raman',
  },
];
// ----------------------------------

export default function HomePage() {
  const [stats, setStats] = useState({
    departments: 0,
    courses: 0,
    faculty: 0,
    students: 0,
    notices: 0,
  });
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function fetchHomeData() {
      setLoading(true);
      setError('');
      try {
        const [statsData, deptData, courseData, noticeData] = await Promise.all([
          getPublicStats(),
          getPublicDepartments(),
          getPublicCourses(),
          getPublicNotices(),
        ]);
        
        if (isMounted) {
          // SMART FALLBACK LOGIC: Use real data if it exists, otherwise use fallbacks
          setStats(statsData && statsData.departments > 0 ? statsData : FALLBACK_STATS);
          setDepartments(deptData && deptData.length > 0 ? deptData : FALLBACK_DEPARTMENTS);
          setNotices(noticeData && noticeData.length > 0 ? noticeData : FALLBACK_NOTICES);
          setCourses(courseData || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(OPTIMISTIC_ERROR_MESSAGE);
          // If the API completely fails, still show the beautiful fallback data
          setStats(FALLBACK_STATS);
          setDepartments(FALLBACK_DEPARTMENTS);
          setNotices(FALLBACK_NOTICES);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  const statCards = [
    {
      label: 'Academic Departments',
      value: stats.departments || departments.length || 0,
      icon: Building2,
      color: 'from-blue-600 to-indigo-700',
    },
    {
      label: 'Specialized Courses',
      value: stats.courses || courses.length || 0,
      icon: BookOpen,
      color: 'from-emerald-600 to-teal-700',
    },
    {
      label: 'Distinguished Faculty',
      value: stats.faculty || 0,
      icon: Users,
      color: 'from-violet-600 to-purple-700',
    },
    {
      label: 'Enrolled Scholars',
      value: stats.students || 0,
      icon: GraduationCap,
      color: 'from-amber-500 to-orange-600',
    },
  ];

  const facilities = [
    {
      title: 'Advanced Computing Labs',
      description:
        'High-performance GPU workstations, cloud-native Kubernetes sandboxes, and dedicated full-stack engineering clusters available 24/7.',
      icon: Cpu,
      badge: 'AI & Cloud Ready',
      accent: 'from-blue-600 to-indigo-600',
      lightBg: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Smart Classrooms',
      description:
        'Interactive 4K digital boards, spatial audio conferencing, automated lecture capture, and real-time collaborative coding environments.',
      icon: Monitor,
      badge: 'Interactive Learning',
      accent: 'from-violet-600 to-purple-600',
      lightBg: 'bg-violet-50 text-violet-700 border-violet-200',
    },
    {
      title: 'Innovation Incubation Center',
      description:
        'Dedicated startup accelerator offering seed funding mentorship, industry partner labs, rapid prototyping tools, and patent support.',
      icon: Lightbulb,
      badge: 'Venture Studio',
      accent: 'from-amber-500 to-orange-600',
      lightBg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      title: 'Central Library',
      description:
        'Over 150,000+ technical volumes, IEEE & ACM digital research repositories, quiet deep-work pods, and collaborative study commons.',
      icon: Library,
      badge: '24/7 Digital Access',
      accent: 'from-emerald-600 to-teal-600',
      lightBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-16 sm:space-y-24 pb-12"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white py-16 sm:py-20 lg:py-28">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center text-left">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Apex University • NAAC A++ Accredited Institute of Science & Technology</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              Empowering the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-amber-300">
                Innovators of Tomorrow.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Founded in 1990, Apex University is a premier autonomous institution dedicated to academic excellence, cutting-edge research, and shaping the next generation of global technology leaders.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 pt-2">
              <Link
                to="/departments"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-white text-slate-950 hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all"
              >
                Explore Programs
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/portal"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-indigo-600/30 hover:bg-indigo-600/50 text-white border border-indigo-400/40 backdrop-blur-sm transition-all"
              >
                Portal Login
              </Link>
            </div>
          </motion.div>

          {/* Hero Live Campus Bulletin / Notice Board */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Live Campus Bulletin</h2>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                Live Updates
              </span>
            </div>

            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-16 rounded-xl bg-white/10 animate-pulse" />
                ))}
              </div>
            ) : notices.length > 0 ? (
              <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                {notices.slice(0, 4).map((notice) => (
                  <motion.div
                    key={notice.id}
                    whileHover={{ x: 4 }}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs text-indigo-300 mb-1">
                      <span className="font-semibold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200">
                        {notice.category || 'Announcement'}
                      </span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Calendar className="w-3 h-3" />
                        {notice.date}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white line-clamp-1">
                      {notice.title}
                    </h3>
                    {notice.content && (
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                        {notice.content}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : null}
          </motion.div>
        </div>
      </section>

      {/* Graceful Status Notification Banner when Backend is Initializing / Updating */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-blue-50 to-slate-50 border border-indigo-200/80 text-indigo-950 text-sm shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <span className="font-medium">{error}</span>
          </motion.div>
        </div>
      )}

      {/* Live Campus Statistics (with Smart Counters) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const isInitializing = loading;
            return (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 shadow-md border border-slate-200/80 flex items-center gap-4 text-left"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center shadow-md shrink-0`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  {isInitializing ? (
                    <div className="flex items-center gap-2 py-1" title="Syncing live campus metrics">
                      <div className="h-7 w-16 rounded-lg bg-gradient-to-r from-slate-200 via-indigo-100 to-slate-200 animate-pulse" />
                    </div>
                  ) : (
                    <div className="text-3xl font-extrabold text-slate-900">
                      {stat.value}+
                    </div>
                  )}
                  <div className="text-sm font-medium text-slate-500">{stat.label}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* About Section: Heritage, Vision & Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 lg:p-12 space-y-10"
        >
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              <Compass className="w-3.5 h-3.5" /> About Apex University
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Heritage, Vision & Academic Excellence
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Founded in 1990, Apex University is an autonomous research-intensive institution dedicated to advancing science, engineering, and human knowledge through rigorous scholarship and real-world innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Vision Card */}
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-indigo-500/20 shadow-lg space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <Target className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                  Our Institutional Vision
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Cultivating Global Innovators
                </h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  To cultivate ethical, globally competent engineers and scientists equipped to solve complex societal challenges in clean energy, artificial intelligence, and sustainable infrastructure.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-indigo-200">
                  NAAC A++ Accredited
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-indigo-200">
                  ISO 9001:2015 Certified
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-indigo-200">
                  Research Excellence
                </span>
              </div>
            </motion.div>

            {/* Mission Card */}
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-slate-50 p-6 sm:p-8 border border-slate-200/90 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Code2 className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                    Digital Campus Governance
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Next-Generation Academic ERP
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    Powered by a role-based Academic ERP providing transparent attendance tracking, real-time assessment analytics, and seamless student-faculty collaboration.
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5 pt-2 border-t border-slate-200/80 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Industry-Aligned Education:</strong> Co-designed curricula with leading technology enterprises.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Full-Stack Mastery:</strong> Hands-on expertise in distributed databases and DevSecOps.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Ethical Leadership:</strong> Instilling responsible AI practices and civic integrity.
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Facilities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              World-Class Campus Infrastructure
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              State-of-the-Art Campus Facilities
            </h2>
          </div>
          <p className="text-sm text-slate-500 max-w-md">
            Purpose-built environments engineered for deep research, collaborative experimentation, and continuous learning.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {facilities.map((facility) => {
            const Icon = facility.icon;
            return (
              <motion.div
                key={facility.title}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${facility.accent} text-white flex items-center justify-center shadow-md shrink-0`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${facility.lightBg}`}
                    >
                      {facility.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{facility.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {facility.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                  <span>Campus Access Enabled</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Notice Board Section (Live from /api/public/notices) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Official Communications
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Campus Notice Board
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
            <Bell className="w-3.5 h-3.5" /> Synchronized with University ERP
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-48 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : notices.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {notices.slice(0, 6).map((notice) => (
              <motion.div
                key={notice.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700">
                      {notice.category || 'Official Notice'}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {notice.date}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {notice.title}
                  </h3>
                  {notice.content && (
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {notice.content}
                    </p>
                  )}
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Posted by: <strong className="text-slate-700">{notice.author || 'Administration'}</strong>
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : null}
      </section>

      {/* Featured Academic Departments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Schools & Centers of Excellence
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Academic Departments
            </h2>
          </div>
          <Link
            to="/departments"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
          >
            View All Departments & Curriculum <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-56 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : departments.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {departments.slice(0, 6).map((dept) => (
              <motion.div
                key={dept.id}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold">
                      {dept.code}
                    </span>
                    {dept.establishedYear && (
                      <span className="text-xs text-slate-400 font-medium">
                        Est. {dept.establishedYear}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{dept.name}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {dept.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    HOD: <strong className="text-slate-700">{dept.headOfDepartment}</strong>
                  </span>
                  <Link
                    to="/departments"
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    Courses →
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : null}
      </section>
    </motion.div>
  );
}