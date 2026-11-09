import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Award,
  BookOpen,
  Users,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Send,
} from 'lucide-react';
import {
  getTeacherProfile,
  getTeacherCourses,
  getCourseEnrolledStudents,
  submitTeacherAttendance,
  publishTeacherMarks,
} from '../services/api';
import DashboardShell from './ui/DashboardShell';
import StatCard from './ui/StatCard';
import { CardSkeletonGrid, TableSkeleton } from './ui/LoadingSkeleton';
import EmptyState from './ui/EmptyState';
import { useToast } from './ui/ToastProvider';

export default function TeacherDashboard({ user, onLogout }) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [attendanceDate, setAttendanceDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [attendanceMap, setAttendanceMap] = useState({});

  const [examType, setExamType] = useState('Midterm');
  const [maxMarks, setMaxMarks] = useState(100);
  const [marksMap, setMarksMap] = useState({});

  useEffect(() => {
    let isMounted = true;
    async function loadTeacherWorkspace() {
      setLoadingInitial(true);
      try {
        const [profileData, coursesData] = await Promise.all([
          getTeacherProfile(),
          getTeacherCourses(),
        ]);
        if (isMounted) {
          setProfile(profileData || null);
          const list = Array.isArray(coursesData) ? coursesData : [];
          setCourses(list);
          if (list.length > 0) {
            setSelectedCourseId(String(list[0].id));
          }
        }
      } catch (err) {
        if (isMounted) {
          toast.error(
            'Workspace Load Error',
            err.response?.data?.message ||
              'Could not load faculty profile or assigned courses.'
          );
        }
      } finally {
        if (isMounted) setLoadingInitial(false);
      }
    }
    loadTeacherWorkspace();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setEnrolledStudents([]);
      return;
    }
    let isMounted = true;
    async function fetchStudentsForCourse() {
      setLoadingStudents(true);
      try {
        const students = await getCourseEnrolledStudents(selectedCourseId);
        if (isMounted) {
          const list = Array.isArray(students) ? students : [];
          setEnrolledStudents(list);
          const initialAtt = {};
          const initialMarks = {};
          list.forEach((s) => {
            initialAtt[s.id] = { present: true, remarks: '' };
            initialMarks[s.id] = '';
          });
          setAttendanceMap(initialAtt);
          setMarksMap(initialMarks);
        }
      } catch {
        if (isMounted) {
          toast.error(
            'Student Roster Error',
            'Unable to fetch enrolled students for the selected course.'
          );
        }
      } finally {
        if (isMounted) setLoadingStudents(false);
      }
    }
    fetchStudentsForCourse();
    return () => {
      isMounted = false;
    };
  }, [selectedCourseId]);

  const toggleStudentAttendance = (studentId) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        present: !prev[studentId]?.present,
      },
    }));
  };

  const setAllAttendance = (isPresent) => {
    const updated = {};
    enrolledStudents.forEach((s) => {
      updated[s.id] = {
        present: isPresent,
        remarks: attendanceMap[s.id]?.remarks || '',
      };
    });
    setAttendanceMap(updated);
  };

  const handleBatchAttendanceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) {
      toast.error('Validation Error', 'Please select a course first.');
      return;
    }
    if (enrolledStudents.length === 0) {
      toast.error(
        'No Students',
        'There are no enrolled students in this course to mark attendance for.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const records = enrolledStudents.map((s) => ({
        studentId: s.id,
        present: attendanceMap[s.id]?.present ?? true,
        remarks:
          attendanceMap[s.id]?.remarks ||
          (attendanceMap[s.id]?.present ? 'Present' : 'Absent'),
      }));

      const res = await submitTeacherAttendance({
        courseId: Number(selectedCourseId),
        date: attendanceDate,
        records,
      });

      toast.success(
        'Batch Attendance Submitted',
        res?.message ||
          `Attendance recorded for ${records.length} student(s) on ${attendanceDate}.`
      );
    } catch (err) {
      toast.error(
        'Attendance Submission Blocked',
        err.response?.data?.message ||
          'Failed to submit attendance. Check for duplicate date submissions.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatchMarksPublish = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) {
      toast.error('Validation Error', 'Please select a course first.');
      return;
    }

    const filledRecords = enrolledStudents
      .filter(
        (s) =>
          marksMap[s.id] !== undefined &&
          marksMap[s.id] !== null &&
          String(marksMap[s.id]).trim() !== ''
      )
      .map((s) => ({
        studentId: s.id,
        marksObtained: Number(marksMap[s.id]),
      }));

    if (filledRecords.length === 0) {
      toast.error(
        'No Marks Entered',
        'Please input marks for at least one student before publishing.'
      );
      return;
    }

    const invalid = filledRecords.find(
      (r) =>
        Number.isNaN(r.marksObtained) ||
        r.marksObtained < 0 ||
        r.marksObtained > Number(maxMarks)
    );
    if (invalid) {
      toast.error(
        'Invalid Marks Range',
        `Marks obtained must be between 0 and ${maxMarks}.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await publishTeacherMarks({
        courseId: Number(selectedCourseId),
        examType,
        maxMarks: Number(maxMarks),
        records: filledRecords,
      });

      toast.success(
        'Assessment Marks Published',
        res?.message ||
          `Successfully published ${examType} marks for ${filledRecords.length} student(s).`
      );
    } catch (err) {
      toast.error(
        'Publish Failed',
        err.response?.data?.message || 'Error publishing assessment marks.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const calculateGrade = (obtained, max) => {
    if (obtained === '' || obtained === null || obtained === undefined) return '—';
    const num = Number(obtained);
    const maxNum = Number(max) || 100;
    if (Number.isNaN(num) || maxNum <= 0) return '—';
    const pct = (num * 100) / maxNum;
    if (pct >= 90) return 'O';
    if (pct >= 80) return 'A+';
    if (pct >= 70) return 'A';
    if (pct >= 60) return 'B+';
    if (pct >= 50) return 'B';
    return 'F';
  };

  const presentCount = enrolledStudents.filter(
    (s) => attendanceMap[s.id]?.present ?? true
  ).length;
  const absentCount = enrolledStudents.length - presentCount;

  const selectedCourseObj = courses.find(
    (c) => String(c.id) === String(selectedCourseId)
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'attendance', label: 'Mark Attendance', icon: CalendarCheck },
    { id: 'marks', label: 'Publish Marks', icon: Award },
  ];

  return (
    <DashboardShell
      badge={`FACULTY PORTAL • ${profile?.designation || 'Professor'} • ${profile?.office || 'Campus Block'}`}
      title={profile?.name || user?.fullName || user?.username}
      subtitle={`${profile?.department || 'Academic Faculty'} • ${profile?.email || user?.email}`}
      headerIcon={GraduationCap}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={onLogout}
    >
      {loadingInitial ? (
        <div className="space-y-6">
          <CardSkeletonGrid count={3} cols="md:grid-cols-3" />
          <TableSkeleton rows={4} />
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard
                  label="Assigned Subjects"
                  value={courses.length}
                  subtitle="Active semester teaching load"
                  icon={BookOpen}
                  iconBg="bg-indigo-50 text-indigo-600"
                />
                <StatCard
                  label="Enrolled Students"
                  value={profile?.enrolledStudentsCount ?? enrolledStudents.length}
                  subtitle="Approved scholars across your courses"
                  icon={Users}
                  iconBg="bg-emerald-50 text-emerald-600"
                />
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Research & Specialization
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {profile?.specialization || 'Computer Science & Engineering'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {profile?.qualification}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Your Assigned Courses & Teaching Load
                </h2>
                {courses.length === 0 ? (
                  <EmptyState
                    icon={BookOpen}
                    title="No courses assigned yet"
                    description="Once an Administrator assigns you as the instructor for a university course, it will appear here."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between space-y-5"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-extrabold">
                              {course.code}
                            </span>
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                              {course.credits} Credits
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {course.name}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {course.department} • {course.semester || 'Active Semester'}
                          </p>
                          {course.description && (
                            <p className="text-xs text-slate-600 line-clamp-2 pt-1">
                              {course.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCourseId(String(course.id));
                              setActiveTab('attendance');
                            }}
                            className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all hover:-translate-y-0.5"
                          >
                            Mark Attendance
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCourseId(String(course.id));
                              setActiveTab('marks');
                            }}
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all hover:-translate-y-0.5"
                          >
                            Publish Marks
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MARK ATTENDANCE */}
          {activeTab === 'attendance' && (
            <form
              onSubmit={handleBatchAttendanceSubmit}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 max-w-2xl">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Select Course / Subject
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-medium"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} — {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Session Date
                    </label>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAllAttendance(true)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all hover:-translate-y-0.5"
                  >
                    Mark All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllAttendance(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all hover:-translate-y-0.5"
                  >
                    Mark All Absent
                  </button>
                </div>
              </div>

              {loadingStudents ? (
                <TableSkeleton rows={4} />
              ) : enrolledStudents.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={Users}
                    title="No enrolled students found for this subject."
                    description="Students enrolled in this department will appear here once their registrations are approved."
                  />
                </div>
              ) : (
                <>
                  <div className="px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-600">
                    <span>
                      Course:{' '}
                      <strong className="text-slate-900">
                        {selectedCourseObj?.code} — {selectedCourseObj?.name}
                      </strong>
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-emerald-700">Present: {presentCount}</span>
                      <span className="text-red-600">Absent: {absentCount}</span>
                    </div>
                  </div>

                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 text-xs uppercase">
                          <th className="py-3.5 px-6">Enrollment #</th>
                          <th className="py-3.5 px-6">Student Name & Email</th>
                          <th className="py-3.5 px-6">Semester</th>
                          <th className="py-3.5 px-6">Remarks (Optional)</th>
                          <th className="py-3.5 px-6 text-right">Status Toggle</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrolledStudents.map((student) => {
                          const isPresent = attendanceMap[student.id]?.present ?? true;
                          return (
                            <tr
                              key={student.id}
                              className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                            >
                              <td className="py-3.5 px-6 font-mono text-xs font-bold text-indigo-700">
                                {student.enrollmentNumber || `STD-${student.id}`}
                              </td>
                              <td className="py-3.5 px-6">
                                <div className="font-bold text-slate-900">
                                  {student.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {student.email}
                                </div>
                              </td>
                              <td className="py-3.5 px-6 text-xs text-slate-600">
                                {student.semester || 'Semester 5'}
                              </td>
                              <td className="py-3.5 px-6">
                                <input
                                  type="text"
                                  placeholder="e.g. On time / Medical leave"
                                  value={attendanceMap[student.id]?.remarks || ''}
                                  onChange={(e) =>
                                    setAttendanceMap((prev) => ({
                                      ...prev,
                                      [student.id]: {
                                        ...prev[student.id],
                                        present: isPresent,
                                        remarks: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full max-w-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                                />
                              </td>
                              <td className="py-3.5 px-6 text-right">
                                <button
                                  type="button"
                                  onClick={() => toggleStudentAttendance(student.id)}
                                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all hover:-translate-y-0.5 ${
                                    isPresent
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                                  }`}
                                >
                                  {isPresent ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                      Present
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-4 h-4 text-red-600" />
                                      Absent
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-60"
                    >
                      <Send className="w-4 h-4" />
                      {submitting
                        ? 'Submitting Batch Attendance...'
                        : `Submit Attendance Batch (${enrolledStudents.length} Students)`}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* TAB 3: PUBLISH MARKS */}
          {activeTab === 'marks' && (
            <form
              onSubmit={handleBatchMarksPublish}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Select Course / Subject
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-medium"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Assessment Type
                  </label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-medium"
                  >
                    <option value="Midterm">Midterm Examination</option>
                    <option value="Final">Final / End-Semester</option>
                    <option value="Internal Assessment">Internal Assessment</option>
                    <option value="Quiz">Lab / Quiz Evaluation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Maximum Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-medium"
                  />
                </div>
              </div>

              {loadingStudents ? (
                <TableSkeleton rows={4} />
              ) : enrolledStudents.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={Users}
                    title="No enrolled students found for this course."
                    description="Approved students in this department will appear here automatically."
                  />
                </div>
              ) : (
                <>
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 text-xs uppercase">
                          <th className="py-3.5 px-6">Enrollment #</th>
                          <th className="py-3.5 px-6">Student Name</th>
                          <th className="py-3.5 px-6">Semester</th>
                          <th className="py-3.5 px-6">
                            Marks Obtained (Out of {maxMarks})
                          </th>
                          <th className="py-3.5 px-6 text-right">Computed Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrolledStudents.map((student) => {
                          const val = marksMap[student.id] ?? '';
                          const grade = calculateGrade(val, maxMarks);
                          return (
                            <tr
                              key={student.id}
                              className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                            >
                              <td className="py-3.5 px-6 font-mono text-xs font-bold text-indigo-700">
                                {student.enrollmentNumber || `STD-${student.id}`}
                              </td>
                              <td className="py-3.5 px-6">
                                <div className="font-bold text-slate-900">
                                  {student.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {student.email}
                                </div>
                              </td>
                              <td className="py-3.5 px-6 text-xs text-slate-600">
                                {student.semester || 'Semester 5'}
                              </td>
                              <td className="py-3.5 px-6">
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  max={maxMarks}
                                  placeholder={`0 – ${maxMarks}`}
                                  value={val}
                                  onChange={(e) =>
                                    setMarksMap((prev) => ({
                                      ...prev,
                                      [student.id]: e.target.value,
                                    }))
                                  }
                                  className="w-36 px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </td>
                              <td className="py-3.5 px-6 text-right">
                                <span
                                  className={`inline-block px-3 py-1 rounded-lg text-xs font-extrabold ${
                                    grade === '—'
                                      ? 'bg-slate-100 text-slate-400'
                                      : grade === 'F'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {grade}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-60"
                    >
                      <Award className="w-4 h-4" />
                      {submitting
                        ? 'Publishing Marks...'
                        : `Publish ${examType} Marks`}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </>
      )}
    </DashboardShell>
  );
}
