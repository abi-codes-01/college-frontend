import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {
  LayoutDashboard,
  CalendarCheck,
  Award,
  User,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  FileBarChart2,
} from 'lucide-react';
import {
  getMyStudentProfile,
  getMyStudentAttendance,
  getMyStudentMarks,
} from '../services/api';
import DashboardShell from './ui/DashboardShell';
import StatCard from './ui/StatCard';
import { CardSkeletonGrid, TableSkeleton } from './ui/LoadingSkeleton';
import EmptyState from './ui/EmptyState';
import { useToast } from './ui/ToastProvider';

function RadialAttendanceRing({ percentage = 0, size = 112, strokeWidth = 10 }) {
  const safePct = Math.min(100, Math.max(0, Number(percentage) || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safePct / 100) * circumference;

  const strokeColor =
    safePct >= 85 ? '#10b981' : safePct >= 75 ? '#4f46e5' : '#ef4444';

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg className="-rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-lg font-extrabold text-slate-900">{safePct}%</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Attendance
        </span>
      </div>
    </div>
  );
}

export default function StudentDashboard({ user, onLogout }) {
  const toast = useToast();
  const [activeSection, setActiveSection] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState({
    overallPercentage: 0,
    totalAttended: 0,
    totalClasses: 0,
    subjects: [],
  });
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchStudentDashboardData() {
      setLoading(true);
      try {
        const [profileData, attendanceData, marksData] = await Promise.all([
          getMyStudentProfile(),
          getMyStudentAttendance(),
          getMyStudentMarks(),
        ]);
        if (isMounted) {
          setProfile(profileData || null);
          setAttendance(
            attendanceData || {
              overallPercentage: 0,
              totalAttended: 0,
              totalClasses: 0,
              subjects: [],
            }
          );
          setMarks(Array.isArray(marksData) ? marksData : []);
        }
      } catch (err) {
        if (isMounted) {
          toast.error(
            'Dashboard Sync Error',
            err.response?.data?.message ||
              'Failed to load your academic dashboard from /api/student/*.'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchStudentDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const averageScore =
    marks.length > 0
      ? Math.round(
          (marks.reduce((acc, m) => acc + (Number(m.percentage) || 0), 0) /
            marks.length) *
            10
        ) / 10
      : null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'attendance', label: 'My Attendance', icon: CalendarCheck },
    { id: 'marks', label: 'My Marks', icon: Award },
  ];

  return (
    <DashboardShell
      badge={`${profile?.enrollmentNumber || 'STUDENT PORTAL'} • ${profile?.course || 'B.Tech'} • ${profile?.semester || 'Active Semester'}`}
      title={profile?.name || user?.fullName || user?.username}
      subtitle={`${profile?.department || 'Academic Scholar'} • ${profile?.email || user?.email}`}
      headerIcon={User}
      tabs={tabs}
      activeTab={activeSection}
      onTabChange={setActiveSection}
      onLogout={onLogout}
    >
      {loading ? (
        <div className="space-y-6">
          <CardSkeletonGrid count={3} cols="md:grid-cols-3" />
          <TableSkeleton rows={4} />
        </div>
      ) : (
        <>
          {/* SECTION 1: OVERVIEW */}
          {activeSection === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Overall Attendance Ring Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Overall Attendance
                    </span>
                    <h3 className="text-2xl font-extrabold text-slate-900">
                      {attendance.totalClasses > 0
                        ? `${attendance.overallPercentage}%`
                        : 'No Classes Yet'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {attendance.totalAttended} of {attendance.totalClasses} classes attended
                    </p>
                    {attendance.totalClasses > 0 && (
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          attendance.overallPercentage >= 75
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}
                      >
                        {attendance.overallPercentage >= 75 ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Eligible for Exams (≥75%)
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5" /> Below 75% Requirement
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <RadialAttendanceRing
                    percentage={attendance.overallPercentage}
                    size={100}
                    strokeWidth={9}
                  />
                </div>

                {/* Cumulative Average Score Card */}
                <StatCard
                  label="Cumulative Average Score"
                  value={averageScore !== null ? averageScore : 'N/A'}
                  suffix={averageScore !== null ? '%' : ''}
                  subtitle={`Across ${marks.length} published assessment(s)`}
                  icon={Award}
                  iconBg="bg-indigo-50 text-indigo-600"
                  valueClass="text-indigo-700"
                />

                {/* Profile Snapshot Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md space-y-2.5 text-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Academic Profile Details
                  </span>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Enrollment ID:</span>
                    <strong className="text-slate-900 font-mono">
                      {profile?.enrollmentNumber || 'N/A'}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Department:</span>
                    <strong className="text-slate-900 truncate max-w-[180px]">
                      {profile?.department || 'N/A'}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Program & Semester:</span>
                    <strong className="text-slate-900">
                      {profile?.course || 'B.Tech'} • {profile?.semester || 'N/A'}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Account Status:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                      {profile?.status || 'APPROVED'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stacked on Mobile, Side-by-Side on Desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Subject-Wise Performance (%)
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">
                    Live assessment scores retrieved from your student record
                  </p>

                  {marks.length === 0 ? (
                    <EmptyState
                      icon={FileBarChart2}
                      title="No assessments have been published yet."
                      description="Once faculty publish your examination marks, interactive charts will appear here."
                    />
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={marks}
                          margin={{ top: 10, right: 16, left: -10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="courseCode" tick={{ fontSize: 12, fill: '#475569' }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#475569' }} />
                          <Tooltip
                            formatter={(value, _name, props) => [
                              `${value}% (${props.payload.marksObtained}/${props.payload.maxMarks})`,
                              props.payload.courseName,
                            ]}
                          />
                          <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                            {marks.map((entry, idx) => (
                              <Cell
                                key={entry.id || idx}
                                fill={entry.percentage >= 85 ? '#4f46e5' : '#0ea5e9'}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Subject Attendance Snapshot
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">
                    Minimum 75% attendance required in each subject
                  </p>

                  {!attendance.subjects || attendance.subjects.length === 0 ? (
                    <EmptyState
                      icon={CalendarCheck}
                      title="No attendance records have been logged yet."
                      description="Your subject-wise attendance rings will appear here once class sessions are recorded."
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {attendance.subjects.map((sub) => (
                        <div
                          key={sub.courseId}
                          className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-indigo-600">
                              {sub.courseCode}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {sub.courseName}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {sub.attendedClasses}/{sub.totalClasses} classes
                            </p>
                          </div>
                          <RadialAttendanceRing
                            percentage={sub.percentage}
                            size={66}
                            strokeWidth={6}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: MY ATTENDANCE */}
          {activeSection === 'attendance' && (
            <div className="space-y-6">
              {!attendance.subjects || attendance.subjects.length === 0 ? (
                <EmptyState
                  icon={CalendarCheck}
                  title="No attendance records have been published yet."
                  description="Your subject-wise attendance percentages will appear here as soon as faculty record class sessions for your enrolled courses."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {attendance.subjects.map((sub) => (
                    <div
                      key={sub.courseId}
                      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex items-center justify-between gap-6"
                    >
                      <div className="space-y-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold">
                            {sub.courseCode}
                          </span>
                          {sub.shortage ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-bold">
                              Attendance Shortage
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                              On Track
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 truncate">
                          {sub.courseName}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Faculty: <strong className="text-slate-700">{sub.facultyName}</strong>
                        </p>
                        <p className="text-xs font-semibold text-slate-700 pt-1">
                          Attended {sub.attendedClasses} out of {sub.totalClasses} lectures
                        </p>
                      </div>

                      <RadialAttendanceRing
                        percentage={sub.percentage}
                        size={104}
                        strokeWidth={9}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: MY MARKS */}
          {activeSection === 'marks' && (
            <div className="space-y-8">
              {marks.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No assessments have been published yet."
                  description="When examination results or internal assessment marks are published for your account, they will be displayed here with interactive analytics."
                />
              ) : (
                <>
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      Subject-Wise Assessment Analytics
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">
                      Comparison of marks obtained across your registered courses
                    </p>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={marks}
                          margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="courseCode" tick={{ fontSize: 12, fill: '#334155' }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#334155' }} />
                          <Tooltip
                            formatter={(val, _name, item) => [
                              `${item.payload.marksObtained} / ${item.payload.maxMarks} (${val}%)`,
                              item.payload.courseName,
                            ]}
                          />
                          <Bar dataKey="percentage" radius={[8, 8, 0, 0]} barSize={44}>
                            {marks.map((entry, idx) => (
                              <Cell
                                key={entry.id || idx}
                                fill={
                                  entry.percentage >= 90
                                    ? '#10b981'
                                    : entry.percentage >= 80
                                    ? '#4f46e5'
                                    : '#f59e0b'
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Mobile Horizontally Scrollable Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="w-full overflow-x-auto">
                      <table className="w-full min-w-[640px] text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase">
                            <th className="py-3.5 px-4">Course</th>
                            <th className="py-3.5 px-4">Exam Type</th>
                            <th className="py-3.5 px-4">Faculty</th>
                            <th className="py-3.5 px-4">Marks Obtained</th>
                            <th className="py-3.5 px-4">Grade</th>
                            <th className="py-3.5 px-4">Published</th>
                          </tr>
                        </thead>
                        <tbody>
                          {marks.map((m) => (
                            <tr
                              key={m.id}
                              className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                            >
                              <td className="py-3.5 px-4">
                                <span className="font-bold text-indigo-700 mr-2">
                                  {m.courseCode}
                                </span>
                                <span className="font-semibold text-slate-900">
                                  {m.courseName}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-600">{m.examType}</td>
                              <td className="py-3.5 px-4 text-slate-600">{m.facultyName}</td>
                              <td className="py-3.5 px-4 font-bold text-slate-900">
                                {m.marksObtained} / {m.maxMarks} ({m.percentage}%)
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-extrabold">
                                  {m.grade || 'P'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-xs text-slate-500">
                                {m.publishedDate || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}
