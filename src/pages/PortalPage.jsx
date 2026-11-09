import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogIn,
  UserPlus,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import {
  getPublicDepartments,
  loginUser,
  registerUser,
} from '../services/api';
import { CardSkeletonGrid, TableSkeleton } from '../components/ui/LoadingSkeleton';
import { useToast } from '../components/ui/ToastProvider';

const StudentDashboard = lazy(() => import('../components/StudentDashboard'));
const TeacherDashboard = lazy(() => import('../components/TeacherDashboard'));
const AdminDashboard = lazy(() => import('../components/AdminDashboard'));

function DashboardFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <CardSkeletonGrid count={3} cols="md:grid-cols-3" />
      <TableSkeleton rows={4} />
    </div>
  );
}

export default function PortalPage({ user, setUser }) {
  const toast = useToast();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [regForm, setRegForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CSE',
    semester: 'Semester 1',
    phone: '',
  });

  useEffect(() => {
    let isMounted = true;
    getPublicDepartments()
      .then((dData) => {
        if (isMounted && Array.isArray(dData)) {
          setDepartments(dData);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setSubmitting(true);
    try {
      const response = await loginUser({ username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
      toast.success(
        'Signed In Successfully',
        `Welcome back, ${response.data.fullName || response.data.username}!`
      );
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid username or password.';
      setAuthError(msg);
      toast.error('Authentication Failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStudentRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setSubmitting(true);
    try {
      const response = await registerUser(regForm);
      const msg =
        response.data?.message ||
        'Registration submitted! Your account is PENDING Admin approval.';
      setAuthSuccess(msg);
      toast.success('Registration Submitted', msg);
      setRegForm({
        name: '',
        username: '',
        email: '',
        password: '',
        department: departments[0]?.name || 'Computer Science & Engineering',
        course: 'B.Tech CSE',
        semester: 'Semester 1',
        phone: '',
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Registration failed. Please check your details.';
      setAuthError(msg);
      toast.error('Registration Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.info('Signed Out', 'You have been safely logged out of the portal.');
  };

  // --- UNAUTHENTICATED LOGIN & STUDENT SELF-REGISTRATION VIEW ---
  if (!user) {
    return (
      <div className="min-h-[82vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200/90 p-6 sm:p-8 text-left"
        >
          {/* Toggle Pill: Sign In vs Student Self-Registration */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl mb-7">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setAuthError('');
                setAuthSuccess('');
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Portal Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthError('');
                setAuthSuccess('');
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                authMode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student Self-Registration
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              {authMode === 'login' ? (
                <LogIn className="w-6 h-6" />
              ) : (
                <UserPlus className="w-6 h-6" />
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              {authMode === 'login'
                ? 'Apex University ERP Login'
                : 'New Student Self-Registration'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {authMode === 'login'
                ? 'Sign in with your approved university credentials'
                : 'Submit your enrollment request for Administrator verification'}
            </p>
          </div>

          {authError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{authSuccess}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {authMode === 'login' ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. admin, turing, or student"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-700 hover:from-blue-800 hover:to-indigo-600 text-white font-semibold text-sm shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {submitting ? 'Signing In...' : 'Access Campus Portal'}
                </button>

                <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
                  <span>Quick Demo Login:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUsername('admin');
                        setPassword('admin123');
                      }}
                      className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all hover:-translate-y-0.5"
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUsername('turing');
                        setPassword('faculty123');
                      }}
                      className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all hover:-translate-y-0.5"
                    >
                      Faculty
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUsername('student');
                        setPassword('student123');
                      }}
                      className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition-all hover:-translate-y-0.5"
                    >
                      Student
                    </button>
                  </div>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="register-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                onSubmit={handleStudentRegister}
                className="space-y-3.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ananya Gupta"
                      value={regForm.name}
                      onChange={(e) =>
                        setRegForm({ ...regForm, name: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ananya2026"
                      value={regForm.username}
                      onChange={(e) =>
                        setRegForm({ ...regForm, username: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Institutional Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="ananya@apexuniversity.edu"
                      value={regForm.email}
                      onChange={(e) =>
                        setRegForm({ ...regForm, email: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={regForm.password}
                      onChange={(e) =>
                        setRegForm({ ...regForm, password: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Academic Department *
                  </label>
                  <select
                    value={regForm.department}
                    onChange={(e) =>
                      setRegForm({ ...regForm, department: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    {departments.length > 0 ? (
                      departments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.code})
                        </option>
                      ))
                    ) : (
                      <option value="Computer Science & Engineering">
                        Computer Science & Engineering (CSE)
                      </option>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Degree / Course
                    </label>
                    <input
                      type="text"
                      placeholder="B.Tech"
                      value={regForm.course}
                      onChange={(e) =>
                        setRegForm({ ...regForm, course: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Semester
                    </label>
                    <select
                      value={regForm.semester}
                      onChange={(e) =>
                        setRegForm({ ...regForm, semester: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={`Semester ${sem}`}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      placeholder="+1 555-0199"
                      value={regForm.phone}
                      onChange={(e) =>
                        setRegForm({ ...regForm, phone: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-indigo-700 to-blue-900 hover:from-indigo-600 hover:to-blue-800 text-white font-semibold text-sm shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {submitting
                    ? 'Submitting Registration...'
                    : 'Submit Student Registration (Requires Admin Approval)'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  // --- ROLE-BASED AUTHENTICATED DASHBOARDS ---
  return (
    <Suspense fallback={<DashboardFallback />}>
      {user.role === 'ROLE_STUDENT' ? (
        <StudentDashboard user={user} onLogout={handleLogout} />
      ) : user.role === 'ROLE_FACULTY' ? (
        <TeacherDashboard user={user} onLogout={handleLogout} />
      ) : (
        <AdminDashboard user={user} onLogout={handleLogout} />
      )}
    </Suspense>
  );
}
