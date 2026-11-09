import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Public Website Endpoints (No Auth Required)
export const getPublicDepartments = async () => (await API.get('/public/departments')).data;
export const getPublicFaculty = async (department) => {
  const params = department && department !== 'All' ? { department } : {};
  return (await API.get('/public/faculty', { params })).data;
};
export const getPublicCourses = async (department) => {
  const params = department && department !== 'All' ? { department } : {};
  return (await API.get('/public/courses', { params })).data;
};
export const getPublicNotices = async () => (await API.get('/public/notices')).data;
export const getPublicStats = async () => (await API.get('/public/stats')).data;

// Auth Endpoints
export const loginUser = (credentials) => API.post('/auth/signin', credentials);
export const registerUser = (userData) => API.post('/auth/signup', userData);

// Student Self-Service Dashboard Endpoints (JWT Identity Isolated - ROLE_STUDENT)
export const getMyStudentProfile = async () => (await API.get('/student/my-profile')).data;
export const getMyStudentAttendance = async () => (await API.get('/student/my-attendance')).data;
export const getMyStudentMarks = async () => (await API.get('/student/my-marks')).data;

// Teacher / Faculty Dashboard Endpoints (JWT Identity Isolated - ROLE_FACULTY)
export const getTeacherProfile = async () => (await API.get('/teacher/my-profile')).data;
export const getTeacherCourses = async () => (await API.get('/teacher/my-courses')).data;
export const getCourseEnrolledStudents = async (courseId) =>
  (await API.get(`/teacher/courses/${courseId}/students`)).data;
export const submitTeacherAttendance = async (payload) =>
  (await API.post('/teacher/attendance', payload)).data;
export const publishTeacherMarks = async (payload) =>
  (await API.post('/teacher/marks', payload)).data;

// Admin Dashboard Endpoints (ROLE_ADMIN - /api/admin/**)
export const getAdminStats = async () => (await API.get('/admin/stats')).data;
export const getAdminStudents = async (params = {}) =>
  (await API.get('/admin/students', { params })).data;
export const getAdminPendingStudents = async () =>
  (await API.get('/admin/students/pending')).data;
export const approveAdminStudent = async (id) =>
  (await API.put(`/admin/students/${id}/approve`)).data;
export const rejectAdminStudent = async (id) =>
  (await API.put(`/admin/students/${id}/reject`)).data;
export const deleteAdminStudent = async (id) =>
  (await API.delete(`/admin/students/${id}`)).data;
export const getStudentAcademicRecord = async (id) =>
  (await API.get(`/admin/students/${id}/academic-record`)).data;

export const getAdminFaculty = async () => (await API.get('/admin/faculty')).data;
export const registerAdminFaculty = async (payload) =>
  (await API.post('/admin/faculty', payload)).data;
export const assignCourseToFaculty = async (facultyId, courseId) =>
  (await API.put(`/admin/faculty/${facultyId}/assign-course`, { courseId })).data;
export const deleteAdminFaculty = async (id) =>
  (await API.delete(`/admin/faculty/${id}`)).data;

export const getAdminDepartments = async () =>
  (await API.get('/admin/departments')).data;
export const createAdminDepartment = async (dept) =>
  (await API.post('/admin/departments', dept)).data;
export const updateAdminDepartment = async (id, dept) =>
  (await API.put(`/admin/departments/${id}`, dept)).data;
export const deleteAdminDepartment = async (id) =>
  (await API.delete(`/admin/departments/${id}`)).data;

export const getAdminCourses = async () => (await API.get('/admin/courses')).data;
export const createAdminCourse = async (course) =>
  (await API.post('/admin/courses', course)).data;
export const updateAdminCourse = async (id, course) =>
  (await API.put(`/admin/courses/${id}`, course)).data;
export const deleteAdminCourse = async (id) =>
  (await API.delete(`/admin/courses/${id}`)).data;

export const getAdminNotices = async () => (await API.get('/admin/notices')).data;
export const createAdminNotice = async (notice) =>
  (await API.post('/admin/notices', notice)).data;
export const deleteAdminNotice = async (id) =>
  (await API.delete(`/admin/notices/${id}`)).data;

// Faculty / Admin Academic Recording Endpoints (ROLE_FACULTY / ROLE_ADMIN)
export const recordStudentAttendance = async (payload) =>
  (await API.post('/academic/attendance', payload)).data;
export const publishStudentMarks = async (payload) =>
  (await API.post('/academic/marks', payload)).data;
export const getCourseAcademicRecords = async (courseId) =>
  (await API.get(`/academic/course/${courseId}/records`)).data;

// Legacy / Shared Protected ERP Endpoints
export const getStudents = async () => (await API.get('/students')).data;
export const getPendingStudents = async () => (await API.get('/students/pending')).data;
export const addStudent = async (student) => (await API.post('/students', student)).data;
export const approveStudent = async (id) => (await API.put(`/students/${id}/approve`)).data;
export const rejectStudent = async (id) => (await API.put(`/students/${id}/reject`)).data;
export const deleteStudent = async (id) => (await API.delete(`/students/${id}`)).data;

export const getCourses = async () => (await API.get('/courses')).data;
export const addCourse = async (course) => (await API.post('/courses', course)).data;
export const deleteCourse = async (id) => (await API.delete(`/courses/${id}`)).data;

export const getDepartments = async () => (await API.get('/departments')).data;
export const addDepartment = async (dept) => (await API.post('/departments', dept)).data;
export const getFaculty = async () => (await API.get('/faculty')).data;
export const addFaculty = async (faculty) => (await API.post('/faculty', faculty)).data;

export const getNotices = async () => (await API.get('/notices')).data;
export const addNotice = async (notice) => (await API.post('/notices', notice)).data;

export default API;
