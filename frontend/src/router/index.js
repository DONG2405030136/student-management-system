import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../store/user';

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue'), meta: { public: true } },
  {
    path: '/',
    component: () => import('../layout/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '仪表盘', icon: 'Odometer' } },
      // 管理员
      { path: 'students', name: 'Students', component: () => import('../views/admin/StudentManage.vue'), meta: { title: '学生管理', icon: 'User', roles: ['admin', 'teacher'] } },
      { path: 'classes', name: 'Classes', component: () => import('../views/admin/ClassManage.vue'), meta: { title: '班级管理', icon: 'School', roles: ['admin'] } },
      { path: 'teachers', name: 'Teachers', component: () => import('../views/admin/TeacherManage.vue'), meta: { title: '教师管理', icon: 'Avatar', roles: ['admin'] } },
      { path: 'courses', name: 'Courses', component: () => import('../views/admin/CourseManage.vue'), meta: { title: '课程管理', icon: 'Reading', roles: ['admin'] } },
      { path: 'grades', name: 'Grades', component: () => import('../views/admin/GradeManage.vue'), meta: { title: '成绩管理', icon: 'Trophy', roles: ['admin'] } },
      { path: 'attendance', name: 'Attendance', component: () => import('../views/admin/AttendanceManage.vue'), meta: { title: '考勤管理', icon: 'Calendar', roles: ['admin'] } },
      { path: 'users', name: 'Users', component: () => import('../views/admin/UserManage.vue'), meta: { title: '账号管理', icon: 'Key', roles: ['admin'] } },
      // 教师
      { path: 'my-courses', name: 'MyCourses', component: () => import('../views/teacher/MyCourses.vue'), meta: { title: '我的课程', icon: 'Notebook', roles: ['teacher'] } },
      { path: 'teacher-grade-entry', name: 'TeacherGradeEntry', component: () => import('../views/teacher/GradeEntry.vue'), meta: { title: '成绩录入', icon: 'EditPen', roles: ['teacher'] } },
      { path: 'teacher-attendance', name: 'TeacherAttendance', component: () => import('../views/teacher/AttendanceEntry.vue'), meta: { title: '考勤录入', icon: 'Stamp', roles: ['teacher'] } },
      // 学生
      { path: 'my-info', name: 'MyInfo', component: () => import('../views/student/MyInfo.vue'), meta: { title: '我的信息', icon: 'Postcard', roles: ['student'] } },
      { path: 'my-grades', name: 'MyGrades', component: () => import('../views/student/MyGrades.vue'), meta: { title: '我的成绩', icon: 'DataLine', roles: ['student'] } },
      { path: 'my-attendance', name: 'MyAttendance', component: () => import('../views/student/MyAttendance.vue'), meta: { title: '我的考勤', icon: 'Finished', roles: ['student'] } },
      { path: 'profile', name: 'Profile', component: () => import('../views/Profile.vue'), meta: { title: '个人中心', icon: 'Setting' } }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const store = useUserStore();
  if (to.meta.public) return true;
  if (!store.token) return { path: '/login', query: { redirect: to.fullPath } };
  if (to.meta.roles && !to.meta.roles.includes(store.user?.role)) {
    return { path: '/dashboard' };
  }
  return true;
});

export default router;
