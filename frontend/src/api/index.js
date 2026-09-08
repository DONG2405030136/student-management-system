import request from '../utils/request';

// 认证
export const login = (data) => request.post('/auth/login', data);
export const getMe = () => request.get('/auth/me');
export const changePassword = (data) => request.post('/auth/change-password', data);

// 学生
export const getStudents = (params) => request.get('/students', { params });
export const createStudent = (data) => request.post('/students', data);
export const updateStudent = (id, data) => request.put(`/students/${id}`, data);
export const deleteStudent = (id) => request.delete(`/students/${id}`);

// 班级
export const getClasses = () => request.get('/classes');
export const createClass = (data) => request.post('/classes', data);
export const updateClass = (id, data) => request.put(`/classes/${id}`, data);
export const deleteClass = (id) => request.delete(`/classes/${id}`);

// 教师
export const getTeachers = (params) => request.get('/teachers', { params });
export const createTeacher = (data) => request.post('/teachers', data);
export const updateTeacher = (id, data) => request.put(`/teachers/${id}`, data);
export const deleteTeacher = (id) => request.delete(`/teachers/${id}`);

// 课程
export const getCourses = (params) => request.get('/courses', { params });
export const getMyCourses = () => request.get('/courses/my');
export const createCourse = (data) => request.post('/courses', data);
export const updateCourse = (id, data) => request.put(`/courses/${id}`, data);
export const deleteCourse = (id) => request.delete(`/courses/${id}`);
export const setCourseClasses = (id, classIds) => request.post(`/courses/${id}/classes`, { classIds });

// 成绩
export const getGrades = (params) => request.get('/grades', { params });
export const saveGrade = (data) => request.post('/grades/save', data);
export const batchGrades = (data) => request.post('/grades/batch', data);
export const getGradeStats = (params) => request.get('/grades/stats', { params });
export const getMyGrades = () => request.get('/grades/mine');

// 考勤
export const getAttendance = (params) => request.get('/attendance', { params });
export const saveAttendance = (data) => request.post('/attendance/save', data);
export const deleteAttendance = (id) => request.delete(`/attendance/${id}`);
export const getMyAttendance = () => request.get('/attendance/mine');

// 用户
export const getUsers = (params) => request.get('/users', { params });
export const createUser = (data) => request.post('/users', data);
export const resetPassword = (id, password) => request.post(`/users/${id}/reset-password`, { password });
export const setUserStatus = (id, status) => request.put(`/users/${id}/status`, { status });
export const deleteUser = (id) => request.delete(`/users/${id}`);

// 统计
export const getOverview = () => request.get('/stats/overview');
export const getTeacherStats = () => request.get('/stats/teacher');
export const getStudentStats = () => request.get('/stats/student');
