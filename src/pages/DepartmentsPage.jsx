import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  BookOpen,
  UserCheck,
  MapPin,
  Users,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { getPublicDepartments, getPublicCourses } from '../services/api';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const [deptList, courseList] = await Promise.all([
          getPublicDepartments(),
          getPublicCourses(),
        ]);
        if (isMounted) {
          setDepartments(deptList || []);
          setCourses(courseList || []);
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
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCourses =
    selectedDept === 'All'
      ? courses
      : courses.filter(
          (c) =>
            c.department &&
            c.department.toLowerCase() === selectedDept.toLowerCase()
        );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14 text-left"
    >
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-3">
          <Building2 className="w-3.5 h-3.5" /> Academic Programs & Curriculum
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Academic Departments & Course Catalog
        </h1>
        <p className="text-slate-300 mt-2 max-w-2xl text-sm sm:text-base leading-relaxed">
          Each department combines rigorous theoretical foundations with modern laboratory research. Select any department below to filter its offered courses.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Departments Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            University Schools & Departments ({departments.length})
          </h2>
          {selectedDept !== 'All' && (
            <button
              onClick={() => setSelectedDept('All')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg bg-indigo-50"
            >
              Reset Course Filter ({selectedDept}) ✕
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => {
              const isSelected = selectedDept === dept.name;
              return (
                <motion.div
                  key={dept.id}
                  whileHover={{ y: -5 }}
                  onClick={() =>
                    setSelectedDept(isSelected ? 'All' : dept.name)
                  }
                  className={`cursor-pointer rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg'
                      : 'bg-white border-slate-200/90 shadow-sm hover:shadow-xl'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-extrabold">
                        {dept.code}
                      </span>
                      {dept.establishedYear && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="w-3.5 h-3.5" /> Est. {dept.establishedYear}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{dept.name}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {dept.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    {dept.headOfDepartment && (
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>
                          Head: <strong className="text-slate-800">{dept.headOfDepartment}</strong>
                        </span>
                      </div>
                    )}
                    {dept.building && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{dept.building}</span>
                      </div>
                    )}
                    {dept.totalSeats && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Annual Intake: {dept.totalSeats} Seats</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Course Catalog Section */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              Offered Courses{' '}
              {selectedDept !== 'All' && (
                <span className="text-indigo-600 text-lg font-semibold">
                  — {selectedDept}
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Showing {filteredCourses.length} credit-bearing university courses
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDept('All')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedDept === 'All'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Departments
            </button>
            {departments.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDept(d.name)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedDept === d.name
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {d.code}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 text-xs font-bold">
                    {course.code}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                    {course.credits} Credits
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{course.name}</h3>
                {course.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {course.description}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                <div>
                  Department: <strong className="text-slate-700">{course.department}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>
                    Instructor: <strong className="text-slate-800">{course.instructor}</strong>
                  </span>
                  {course.semester && (
                    <span className="text-indigo-600 font-medium">{course.semester}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
