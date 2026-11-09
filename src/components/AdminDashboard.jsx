import React, { useEffect, useState, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  Edit3,
  Search,
  Eye,
  ShieldCheck,
  Link2,
  Bell,
} from 'lucide-react';
import {
  getAdminStats,
  getAdminStudents,
  getAdminPendingStudents,
  approveAdminStudent,
  rejectAdminStudent,
  deleteAdminStudent,
  getStudentAcademicRecord,
  getAdminFaculty,
  registerAdminFaculty,
  assignCourseToFaculty,
  deleteAdminFaculty,
  getAdminDepartments,
  createAdminDepartment,
  updateAdminDepartment,
  deleteAdminDepartment,
  getAdminCourses,
  createAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,
  getAdminNotices,
  createAdminNotice,
  deleteAdminNotice,
} from '../services/api';
import DashboardShell from './ui/DashboardShell';
import StatCard from './ui/StatCard';
import Modal from './ui/Modal';
import { CardSkeletonGrid, TableSkeleton } from './ui/LoadingSkeleton';
import EmptyState from './ui/EmptyState';
import { useToast } from './ui/ToastProvider';

const CHART_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function AdminDashboard({ user, onLogout }) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingApprovals: 0,
    approvedStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    totalDepartments: 0,
    departmentDistribution: [],
  });
  const [students, setStudents] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    category: 'Admissions',
    author: 'Office of the Registrar',
    content: '',
  });

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingFaculty, setLoadingFaculty] = useState(true);
  const [loadingAcademic, setLoadingAcademic] = useState(true);

  const [studentSearch, setStudentSearch] = useState('');
  const [studentDeptFilter, setStudentDeptFilter] = useState('All');
  const [studentStatusFilter, setStudentStatusFilter] = useState('All');
  const [selectedStudentRecord, setSelectedStudentRecord] = useState(null);
  const [loadingRecord, setLoadingRecord] = useState(false);

  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    email: '',
    username: '',
    password: 'faculty123',
    designation: 'Assistant Professor',
    department: 'Computer Science & Engineering',
    qualification: 'Ph.D.',
    specialization: '',
    office: '',
    phone: '',
  });
  const [assignModalFaculty, setAssignModalFaculty] = useState(null);
  const [assignCourseId, setAssignCourseId] = useState('');

  const [editingDeptId, setEditingDeptId] = useState(null);
  const [deptForm, setDeptForm] = useState({
    code: '',
    name: '',
    description: '',
    headOfDepartment: '',
    building: '',
    establishedYear: 2000,
    totalSeats: 120,
  });

  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    credits: 4,
    department: 'Computer Science & Engineering',
    instructor: '',
    semester: 'Semester 5',
    description: '',
  });

  const loadAllAdminData = useCallback(async () => {
    setLoadingStats(true);
    setLoadingStudents(true);
    setLoadingFaculty(true);
    setLoadingAcademic(true);
    try {
      const [statsData, studentsData, pendingData, facData, deptData, courseData, noticeData] =
        await Promise.all([
          getAdminStats(),
          getAdminStudents(),
          getAdminPendingStudents(),
          getAdminFaculty(),
          getAdminDepartments(),
          getAdminCourses(),
          getAdminNotices(),
        ]);

      setStats(statsData || {});
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setPendingStudents(Array.isArray(pendingData) ? pendingData : []);
      setFacultyList(Array.isArray(facData) ? facData : []);
      setDepartments(Array.isArray(deptData) ? deptData : []);
      setCourses(Array.isArray(courseData) ? courseData : []);
      setNotices(Array.isArray(noticeData) ? noticeData : []);
    } catch (err) {
      toast.error(
        'Synchronization Error',
        err.response?.data?.message || 'Failed to load admin dashboard data.'
      );
    } finally {
      setLoadingStats(false);
      setLoadingStudents(false);
      setLoadingFaculty(false);
      setLoadingAcademic(false);
    }
  }, []);

  useEffect(() => {
    loadAllAdminData();
  }, [loadAllAdminData]);

  const handleApprove = async (id) => {
    try {
      await approveAdminStudent(id);
      toast.success('Student Approved', 'Student account is now active.');
      loadAllAdminData();
    } catch {
      toast.error('Approval Failed', 'Could not approve student.');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectAdminStudent(id);
      toast.success('Student Rejected', 'Registration status updated to REJECTED.');
      loadAllAdminData();
    } catch {
      toast.error('Action Failed', 'Could not reject student.');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Permanently delete this student and their academic records?')) return;
    try {
      await deleteAdminStudent(id);
      toast.success('Student Deleted', 'Student record removed from database.');
      loadAllAdminData();
    } catch {
      toast.error('Delete Failed', 'Unable to delete student.');
    }
  };

  const handleViewStudentRecord = async (studentId) => {
    setLoadingRecord(true);
    setSelectedStudentRecord({ loading: true });
    try {
      const record = await getStudentAcademicRecord(studentId);
      setSelectedStudentRecord(record);
    } catch {
      setSelectedStudentRecord(null);
      toast.error('Record Error', 'Could not load student academic record.');
    } finally {
      setLoadingRecord(false);
    }
  };

  const handleRegisterFaculty = async (e) => {
    e.preventDefault();
    try {
      await registerAdminFaculty(facultyForm);
      toast.success(
        'Faculty Registered',
        `${facultyForm.name} added and login credentials provisioned.`
      );
      setShowFacultyModal(false);
      setFacultyForm({
        name: '',
        email: '',
        username: '',
        password: 'faculty123',
        designation: 'Assistant Professor',
        department: departments[0]?.name || 'Computer Science & Engineering',
        qualification: 'Ph.D.',
        specialization: '',
        office: '',
        phone: '',
      });
      loadAllAdminData();
    } catch (err) {
      toast.error(
        'Registration Error',
        err.response?.data?.message || 'Failed to register faculty.'
      );
    }
  };

  const handleAssignCourseSubmit = async (e) => {
    e.preventDefault();
    if (!assignModalFaculty || !assignCourseId) return;
    try {
      const res = await assignCourseToFaculty(
        assignModalFaculty.id,
        Number(assignCourseId)
      );
      toast.success(
        'Course Assigned',
        res?.message || `Assigned course to ${assignModalFaculty.name}.`
      );
      setAssignModalFaculty(null);
      setAssignCourseId('');
      loadAllAdminData();
    } catch {
      toast.error('Assignment Failed', 'Could not assign course to faculty.');
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm('Remove this faculty member from the directory?')) return;
    try {
      await deleteAdminFaculty(id);
      toast.success('Faculty Removed', 'Faculty profile deleted.');
      loadAllAdminData();
    } catch {
      toast.error('Delete Error', 'Could not remove faculty member.');
    }
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    try {
      if (editingDeptId) {
        await updateAdminDepartment(editingDeptId, deptForm);
        toast.success('Department Updated', `${deptForm.code} updated.`);
      } else {
        await createAdminDepartment(deptForm);
        toast.success('Department Created', `${deptForm.name} added.`);
      }
      setEditingDeptId(null);
      setDeptForm({
        code: '',
        name: '',
        description: '',
        headOfDepartment: '',
        building: '',
        establishedYear: 2000,
        totalSeats: 120,
      });
      loadAllAdminData();
    } catch (err) {
      toast.error(
        'Department Save Failed',
        err.response?.data?.message || 'Check department code uniqueness.'
      );
    }
  };

  const handleEditDepartment = (d) => {
    setEditingDeptId(d.id);
    setDeptForm({
      code: d.code || '',
      name: d.name || '',
      description: d.description || '',
      headOfDepartment: d.headOfDepartment || '',
      building: d.building || '',
      establishedYear: d.establishedYear || 2000,
      totalSeats: d.totalSeats || 120,
    });
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await deleteAdminDepartment(id);
      toast.success('Department Deleted', 'Department removed.');
      loadAllAdminData();
    } catch {
      toast.error('Delete Error', 'Could not delete department.');
    }
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      if (editingCourseId) {
        await updateAdminCourse(editingCourseId, courseForm);
        toast.success('Course Updated', `${courseForm.code} updated.`);
      } else {
        await createAdminCourse(courseForm);
        toast.success('Course Created', `${courseForm.code} added to catalog.`);
      }
      setEditingCourseId(null);
      setCourseForm({
        code: '',
        name: '',
        credits: 4,
        department: departments[0]?.name || 'Computer Science & Engineering',
        instructor: '',
        semester: 'Semester 5',
        description: '',
      });
      loadAllAdminData();
    } catch (err) {
      toast.error(
        'Course Save Failed',
        err.response?.data?.message || 'Check course code uniqueness.'
      );
    }
  };

  const handleEditCourse = (c) => {
    setEditingCourseId(c.id);
    setCourseForm({
      code: c.code || '',
      name: c.name || '',
      credits: c.credits || 4,
      department: c.department || '',
      instructor: c.instructor || '',
      semester: c.semester || 'Semester 5',
      description: c.description || '',
    });
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course from the catalog?')) return;
    try {
      await deleteAdminCourse(id);
      toast.success('Course Deleted', 'Course removed from catalog.');
      loadAllAdminData();
    } catch {
      toast.error('Delete Error', 'Could not delete course.');
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      await createAdminNotice(noticeForm);
      toast.success('Notice Broadcasted', 'Published to live campus bulletin.');
      setNoticeForm({
        title: '',
        category: 'Admissions',
        author: 'Office of the Registrar',
        content: '',
      });
      loadAllAdminData();
    } catch {
      toast.error('Broadcast Error', 'Could not publish notice.');
    }
  };

  const handleDeleteNotice = async (id) => {
    try {
      await deleteAdminNotice(id);
      toast.success('Notice Removed', 'Deleted from campus bulletin.');
      loadAllAdminData();
    } catch {
      toast.error('Delete Error', 'Could not delete notice.');
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesDept =
      studentDeptFilter === 'All' ||
      (s.department && s.department.toLowerCase() === studentDeptFilter.toLowerCase());
    const st = s.status || 'APPROVED';
    const matchesStatus =
      studentStatusFilter === 'All' || st.toLowerCase() === studentStatusFilter.toLowerCase();
    const q = studentSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.enrollmentNumber?.toLowerCase().includes(q) ||
      s.course?.toLowerCase().includes(q);
    return matchesDept && matchesStatus && matchesSearch;
  });

  const navTabs = [
    { id: 'overview', label: 'System Overview', icon: LayoutDashboard },
    {
      id: 'students',
      label: 'Student Management',
      icon: Users,
      badge: pendingStudents.length > 0 ? pendingStudents.length : null,
    },
    { id: 'faculty', label: 'Faculty Management', icon: GraduationCap },
    { id: 'academic', label: 'Academic Management', icon: Building2 },
    { id: 'notices', label: 'Campus Notices', icon: Bell },
  ];

  return (
    <DashboardShell
      badge="UNIVERSITY ADMINISTRATOR CONSOLE"
      title={`Welcome, ${user?.fullName || user?.username}`}
      subtitle="Real-time institutional telemetry, student approvals, faculty provisioning & curriculum governance"
      headerIcon={ShieldCheck}
      tabs={navTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={onLogout}
    >
      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {loadingStats ? (
            <CardSkeletonGrid count={5} cols="sm:grid-cols-2 lg:grid-cols-5" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              <StatCard
                label="Total Students"
                value={stats.totalStudents || 0}
                subtitle={`${stats.approvedStudents || 0} Approved scholars`}
                icon={Users}
                iconBg="bg-indigo-50 text-indigo-600"
              />
              <StatCard
                label="Pending Approvals"
                value={stats.pendingApprovals || 0}
                subtitle="Click to review queue →"
                icon={Clock}
                iconBg="bg-amber-50 text-amber-600"
                borderClass="border-amber-200 hover:border-amber-400"
                valueClass="text-amber-600"
                onClick={() => setActiveTab('students')}
              />
              <StatCard
                label="Total Faculty"
                value={stats.totalFaculty || 0}
                subtitle="Active professors"
                icon={GraduationCap}
                iconBg="bg-emerald-50 text-emerald-600"
              />
              <StatCard
                label="Total Courses"
                value={stats.totalCourses || 0}
                subtitle="Credit-bearing subjects"
                icon={BookOpen}
                iconBg="bg-sky-50 text-sky-600"
              />
              <StatCard
                label="Departments"
                value={stats.totalDepartments || 0}
                subtitle="Academic schools"
                icon={Building2}
                iconBg="bg-violet-50 text-violet-600"
              />
            </div>
          )}

          {/* Stacked on Mobile, Side-by-Side on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">
                Students & Courses by Department
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Aggregated live via Spring Data JPA GROUP BY queries
              </p>

              {!stats.departmentDistribution ||
              stats.departmentDistribution.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No department distribution data available yet."
                  description="Add departments and enroll students to visualize institutional metrics."
                />
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.departmentDistribution}
                      margin={{ top: 10, right: 16, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="code" tick={{ fontSize: 12, fill: '#475569' }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#475569' }} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="students"
                        name="Enrolled Students"
                        fill="#4f46e5"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="courses"
                        name="Active Courses"
                        fill="#10b981"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">
                Department Course Share
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Proportional curriculum distribution across university schools
              </p>

              {!stats.departmentDistribution ||
              stats.departmentDistribution.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No course distribution data yet."
                />
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.departmentDistribution}
                        dataKey="courses"
                        nameKey="code"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ code, courses: c }) => `${code} (${c})`}
                      >
                        {stats.departmentDistribution.map((entry, index) => (
                          <Cell
                            key={entry.code || index}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT MANAGEMENT */}
      {activeTab === 'students' && (
        <div className="space-y-8">
          {/* Pending Approvals Queue */}
          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="p-5 bg-amber-50/60 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Pending Student Self-Registration Queue ({pendingStudents.length})
                  </h3>
                  <p className="text-xs text-slate-600">
                    Students cannot sign into the portal until approved by an Administrator.
                  </p>
                </div>
              </div>
            </div>

            {loadingStudents ? (
              <TableSkeleton rows={2} />
            ) : pendingStudents.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={CheckCircle2}
                  title="No pending student approvals"
                  description="All student self-registration requests have been reviewed."
                />
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[680px] text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase">
                      <th className="py-3 px-4">Enrollment #</th>
                      <th className="py-3 px-4">Student Name & Email</th>
                      <th className="py-3 px-4">Department & Program</th>
                      <th className="py-3 px-4">Semester</th>
                      <th className="py-3 px-4 text-right">Approval Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingStudents.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-slate-100 hover:bg-amber-50/30 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono text-xs font-bold text-indigo-700">
                          {s.enrollmentNumber || `STD-${s.id}`}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{s.name}</div>
                          <div className="text-xs text-slate-500">{s.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">{s.department}</div>
                          <div className="text-xs text-slate-500">{s.course}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">{s.semester}</td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleApprove(s.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all hover:-translate-y-0.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(s.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-all hover:-translate-y-0.5"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Searchable Master Student Directory */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search by student name, email, or enrollment ID..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={studentDeptFilter}
                  onChange={(e) => setStudentDeptFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                >
                  <option value="All">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <select
                  value={studentStatusFilter}
                  onChange={(e) => setStudentStatusFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            {loadingStudents ? (
              <TableSkeleton rows={4} />
            ) : filteredStudents.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={Users}
                  title="No matching students found"
                  description="Try clearing your search query or switching department/status filters."
                />
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[720px] text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase">
                      <th className="py-3.5 px-4">Enrollment #</th>
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Department & Program</th>
                      <th className="py-3.5 px-4">Semester</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono text-xs font-bold text-indigo-700">
                          {s.enrollmentNumber || `STD-${s.id}`}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{s.name}</div>
                          <div className="text-xs text-slate-500">{s.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">
                            {s.department || 'Unassigned'}
                          </div>
                          <div className="text-xs text-slate-500">{s.course}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">{s.semester}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              s.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800'
                                : s.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {s.status || 'APPROVED'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleViewStudentRecord(s.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-all hover:-translate-y-0.5"
                          >
                            <Eye className="w-3.5 h-3.5" /> Academic Record
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-all hover:-translate-y-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FACULTY MANAGEMENT */}
      {activeTab === 'faculty' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                University Faculty Roster ({facultyList.length})
              </h2>
              <p className="text-xs text-slate-500">
                Register new professors and assign them as instructors to courses.
              </p>
            </div>
            <button
              onClick={() => setShowFacultyModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" /> Register New Faculty
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loadingFaculty ? (
              <TableSkeleton rows={4} />
            ) : facultyList.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={GraduationCap}
                  title="No faculty members registered yet"
                  description="Click 'Register New Faculty' to add professors to the university directory."
                  actionLabel="Register New Faculty"
                  onAction={() => setShowFacultyModal(true)}
                />
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[700px] text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase">
                      <th className="py-3.5 px-4">Faculty Name & Email</th>
                      <th className="py-3.5 px-4">Designation & Department</th>
                      <th className="py-3.5 px-4">Specialization</th>
                      <th className="py-3.5 px-4">Office</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facultyList.map((f) => (
                      <tr
                        key={f.id}
                        className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{f.name}</div>
                          <div className="text-xs text-indigo-600">{f.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{f.designation}</div>
                          <div className="text-xs text-emerald-700 font-medium">
                            {f.department}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs">
                          {f.specialization || f.qualification || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {f.office || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setAssignModalFaculty(f);
                              setAssignCourseId(courses[0]?.id ? String(courses[0].id) : '');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-all hover:-translate-y-0.5"
                          >
                            <Link2 className="w-3.5 h-3.5" /> Assign Course
                          </button>
                          <button
                            onClick={() => handleDeleteFaculty(f.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-all hover:-translate-y-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ACADEMIC MANAGEMENT */}
      {activeTab === 'academic' && (
        <div className="space-y-12">
          {/* PART A: DEPARTMENTS CRUD */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <form
              onSubmit={handleSaveDepartment}
              className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  {editingDeptId ? 'Edit Department' : 'Add New Department'}
                </h3>
                {editingDeptId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDeptId(null);
                      setDeptForm({
                        code: '',
                        name: '',
                        description: '',
                        headOfDepartment: '',
                        building: '',
                        establishedYear: 2000,
                        totalSeats: 120,
                      });
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="AI&DS"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Artificial Intelligence & Data Science"
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Head of Department
                </label>
                <input
                  type="text"
                  placeholder="Dr. Geoffrey Hinton"
                  value={deptForm.headOfDepartment}
                  onChange={(e) =>
                    setDeptForm({ ...deptForm, headOfDepartment: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Est. Year
                  </label>
                  <input
                    type="number"
                    value={deptForm.establishedYear}
                    onChange={(e) =>
                      setDeptForm({
                        ...deptForm,
                        establishedYear: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Seats
                  </label>
                  <input
                    type="number"
                    value={deptForm.totalSeats}
                    onChange={(e) =>
                      setDeptForm({ ...deptForm, totalSeats: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Building
                  </label>
                  <input
                    type="text"
                    placeholder="Block F"
                    value={deptForm.building}
                    onChange={(e) =>
                      setDeptForm({ ...deptForm, building: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief overview of research areas..."
                  value={deptForm.description}
                  onChange={(e) =>
                    setDeptForm({ ...deptForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all hover:-translate-y-0.5"
              >
                {editingDeptId ? 'Save Department Changes' : 'Create Department'}
              </button>
            </form>

            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800">
                Active Departments ({departments.length})
              </div>
              {loadingAcademic ? (
                <TableSkeleton rows={3} />
              ) : departments.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={Building2}
                    title="No departments created yet"
                  />
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[540px] text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase">
                        <th className="py-3 px-4">Code</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">HOD</th>
                        <th className="py-3 px-4">Seats</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map((d) => (
                        <tr
                          key={d.id}
                          className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3 px-4 font-bold text-indigo-700">{d.code}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {d.name}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600">
                            {d.headOfDepartment || '—'}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600">
                            {d.totalSeats || '—'}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => handleEditDepartment(d)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all hover:-translate-y-0.5"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDepartment(d.id)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-all hover:-translate-y-0.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* PART B: COURSES CRUD */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <form
              onSubmit={handleSaveCourse}
              className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  {editingCourseId ? 'Edit Course' : 'Add New Course'}
                </h3>
                {editingCourseId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCourseId(null);
                      setCourseForm({
                        code: '',
                        name: '',
                        credits: 4,
                        department:
                          departments[0]?.name || 'Computer Science & Engineering',
                        instructor: '',
                        semester: 'Semester 5',
                        description: '',
                      });
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CS405"
                    value={courseForm.code}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, code: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Deep Learning & Neural Networks"
                    value={courseForm.name}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Department
                </label>
                <select
                  value={courseForm.department}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, department: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Instructor
                  </label>
                  <select
                    value={courseForm.instructor}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, instructor: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="">-- Select Faculty --</option>
                    {facultyList.map((f) => (
                      <option key={f.id} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={courseForm.credits}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        credits: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all hover:-translate-y-0.5"
              >
                {editingCourseId ? 'Save Course Changes' : 'Create Course'}
              </button>
            </form>

            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800">
                University Course Catalog ({courses.length})
              </div>
              {loadingAcademic ? (
                <TableSkeleton rows={4} />
              ) : courses.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={BookOpen}
                    title="No courses in catalog yet"
                  />
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[580px] text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase">
                        <th className="py-3 px-4">Code</th>
                        <th className="py-3 px-4">Course Name</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Instructor</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((c) => (
                        <tr
                          key={c.id}
                          className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3 px-4 font-bold text-indigo-700">{c.code}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {c.name} ({c.credits} Cr)
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600">{c.department}</td>
                          <td className="py-3 px-4 text-xs font-medium text-slate-800">
                            {c.instructor || 'Unassigned'}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => handleEditCourse(c)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all hover:-translate-y-0.5"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(c.id)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-all hover:-translate-y-0.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: STUDENT COMPLETE ACADEMIC RECORD */}
      <Modal
        isOpen={Boolean(selectedStudentRecord)}
        onClose={() => setSelectedStudentRecord(null)}
        badge="Complete Student Transcript & Attendance"
        title={selectedStudentRecord?.student?.name || 'Academic Record'}
        subtitle={
          selectedStudentRecord?.student
            ? `${selectedStudentRecord.student.enrollmentNumber} • ${selectedStudentRecord.student.department}`
            : ''
        }
        maxWidth="max-w-2xl"
      >
        {loadingRecord ? (
          <TableSkeleton rows={3} />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                <span className="text-xs font-bold text-indigo-700 uppercase">
                  Overall Attendance
                </span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  {selectedStudentRecord?.overallAttendancePercentage ?? 0}%
                </p>
                <span className="text-xs text-slate-500">
                  {selectedStudentRecord?.totalAttended || 0} /{' '}
                  {selectedStudentRecord?.totalClasses || 0} classes
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-xs font-bold text-emerald-700 uppercase">
                  Published Assessments
                </span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  {selectedStudentRecord?.marks?.length || 0}
                </p>
                <span className="text-xs text-slate-500">Graded subjects</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Attendance by Subject
              </h4>
              {!selectedStudentRecord?.attendanceBySubject?.length ? (
                <p className="text-xs text-slate-400 py-2">
                  No attendance records logged for this student.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedStudentRecord.attendanceBySubject.map((a, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-indigo-700">{a.courseCode}</strong> —{' '}
                        {a.courseName}
                      </div>
                      <span className="font-extrabold text-slate-900">
                        {a.percentage}% ({a.attendedClasses}/{a.totalClasses})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Published Marks & Grades
              </h4>
              {!selectedStudentRecord?.marks?.length ? (
                <p className="text-xs text-slate-400 py-2">
                  No assessment marks published for this student yet.
                </p>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[440px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                        <th className="py-2.5 px-3">Course</th>
                        <th className="py-2.5 px-3">Exam</th>
                        <th className="py-2.5 px-3">Score</th>
                        <th className="py-2.5 px-3">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudentRecord.marks.map((m) => (
                        <tr key={m.id} className="border-b border-slate-100">
                          <td className="py-2.5 px-3 font-semibold">
                            {m.courseCode} — {m.courseName}
                          </td>
                          <td className="py-2.5 px-3">{m.examType}</td>
                          <td className="py-2.5 px-3 font-bold">
                            {m.marksObtained} / {m.maxMarks}
                          </td>
                          <td className="py-2.5 px-3 font-extrabold text-emerald-700">
                            {m.grade}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 2: REGISTER NEW FACULTY */}
      <Modal
        isOpen={showFacultyModal}
        onClose={() => setShowFacultyModal(false)}
        badge="Faculty Provisioning"
        title="Register New Faculty Member"
        subtitle="Creates both a public directory profile and a ROLE_FACULTY login account."
      >
        <form onSubmit={handleRegisterFaculty} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Dr. Ada Lovelace"
                value={facultyForm.name}
                onChange={(e) =>
                  setFacultyForm({ ...facultyForm, name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                placeholder="lovelace@apexuniversity.edu"
                value={facultyForm.email}
                onChange={(e) =>
                  setFacultyForm({ ...facultyForm, email: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Portal Username
              </label>
              <input
                type="text"
                placeholder="lovelace"
                value={facultyForm.username}
                onChange={(e) =>
                  setFacultyForm({ ...facultyForm, username: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Initial Password
              </label>
              <input
                type="text"
                value={facultyForm.password}
                onChange={(e) =>
                  setFacultyForm({ ...facultyForm, password: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Department
              </label>
              <select
                value={facultyForm.department}
                onChange={(e) =>
                  setFacultyForm({ ...facultyForm, department: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Designation
              </label>
              <input
                type="text"
                value={facultyForm.designation}
                onChange={(e) =>
                  setFacultyForm({ ...facultyForm, designation: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Specialization
              </label>
              <input
                type="text"
                placeholder="Machine Learning, Algorithms"
                value={facultyForm.specialization}
                onChange={(e) =>
                  setFacultyForm({
                    ...facultyForm,
                    specialization: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Office Location
              </label>
              <input
                type="text"
                placeholder="Block A, Room 210"
                value={facultyForm.office}
                onChange={(e) =>
                  setFacultyForm({ ...facultyForm, office: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowFacultyModal(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all hover:-translate-y-0.5"
            >
              Register Faculty
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: ASSIGN COURSE TO FACULTY */}
      <Modal
        isOpen={Boolean(assignModalFaculty)}
        onClose={() => setAssignModalFaculty(null)}
        badge="Course Assignment"
        title={`Assign Course to ${assignModalFaculty?.name || ''}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAssignCourseSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Select University Course
            </label>
            <select
              value={assignCourseId}
              onChange={(e) => setAssignCourseId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name} (Current: {c.instructor || 'None'})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAssignModalFaculty(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all hover:-translate-y-0.5"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
