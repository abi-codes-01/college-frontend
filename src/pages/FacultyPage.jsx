import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Mail,
  MapPin,
  Phone,
  Award,
  Search,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { getPublicFaculty, getPublicDepartments } from '../services/api';

export default function FacultyPage() {
  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadFacultyAndDepts() {
      setLoading(true);
      setError('');
      try {
        const [facultyData, deptData] = await Promise.all([
          getPublicFaculty(),
          getPublicDepartments(),
        ]);
        if (isMounted) {
          setFacultyList(facultyData || []);
          setDepartments(deptData || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            'System updates in progress. Campus data will be available shortly.'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadFacultyAndDepts();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredFaculty = facultyList.filter((member) => {
    const matchesDept =
      selectedDept === 'All' ||
      (member.department &&
        member.department.toLowerCase() === selectedDept.toLowerCase());
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      member.name?.toLowerCase().includes(query) ||
      member.specialization?.toLowerCase().includes(query) ||
      member.department?.toLowerCase().includes(query);
    return matchesDept && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-left"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-3">
          <Users className="w-3.5 h-3.5" /> Mentors, Researchers & Educators
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Distinguished Faculty Directory
        </h1>
        <p className="text-slate-300 mt-2 max-w-2xl text-sm sm:text-base leading-relaxed">
          Meet our professors and department chairs leading pioneering research across engineering, computing, and applied sciences.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Department Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, research area, or department..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedDept('All')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedDept === 'All'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({facultyList.length})
          </button>
          {departments.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDept(d.name)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedDept === d.name
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d.code}
            </button>
          ))}
        </div>
      </div>

      {/* Faculty Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredFaculty.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <p className="text-slate-600 font-medium">
            No faculty members matched your current filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((f) => {
            const initials = f.name
              ? f.name
                  .replace('Dr. ', '')
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)
              : 'FA';

            return (
              <motion.div
                key={f.id}
                layout
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md shrink-0">
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{f.name}</h3>
                      <p className="text-xs font-semibold text-indigo-600">
                        {f.designation || 'Faculty Member'}
                      </p>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                        {f.department}
                      </span>
                    </div>
                  </div>

                  {f.bio && (
                    <p className="text-xs text-slate-600 leading-relaxed">{f.bio}</p>
                  )}

                  <div className="space-y-1.5 pt-1 text-xs text-slate-600">
                    {f.qualification && (
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{f.qualification}</span>
                      </div>
                    )}
                    {f.specialization && (
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-slate-700">Research:</strong>{' '}
                          {f.specialization}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a
                      href={`mailto:${f.email}`}
                      className="text-indigo-600 hover:underline truncate"
                    >
                      {f.email}
                    </a>
                  </div>
                  {f.office && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Office: {f.office}</span>
                    </div>
                  )}
                  {f.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{f.phone}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
