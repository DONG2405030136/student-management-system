<template>
  <el-container class="layout">
    <!-- 侧边栏 -->
    <el-aside :width="collapsed ? '64px' : '220px'" class="aside">
      <div class="logo" @click="$router.push('/dashboard')">
        <el-icon :size="26" color="#fff"><School /></el-icon>
        <span v-show="!collapsed" class="logo-text">学生信息管理系统</span>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        :collapse="collapsed"
        background-color="#001529"
        text-color="#a6adb4"
        active-text-color="#ffffff"
        class="menu"
      >
        <el-menu-item v-for="item in menus" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="collapsed = !collapsed">
            <Expand v-if="collapsed" /><Fold v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="$route.meta.title">{{ $route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" class="avatar">{{ avatarText }}</el-avatar>
              <span class="username">{{ store.user?.name || '用户' }}</span>
              <el-tag size="small" :type="roleTagType">{{ roleText }}</el-tag>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><Setting /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';

const router = useRouter();
const store = useUserStore();
const collapsed = ref(false);

const role = computed(() => store.user?.role || '');

const allMenus = [
  { path: '/dashboard', title: '仪表盘', icon: 'Odometer', roles: ['admin', 'teacher', 'student'] },
  { path: '/students', title: '学生管理', icon: 'User', roles: ['admin', 'teacher'] },
  { path: '/classes', title: '班级管理', icon: 'School', roles: ['admin'] },
  { path: '/teachers', title: '教师管理', icon: 'Avatar', roles: ['admin'] },
  { path: '/courses', title: '课程管理', icon: 'Reading', roles: ['admin'] },
  { path: '/grades', title: '成绩管理', icon: 'Trophy', roles: ['admin'] },
  { path: '/attendance', title: '考勤管理', icon: 'Calendar', roles: ['admin'] },
  { path: '/users', title: '账号管理', icon: 'Key', roles: ['admin'] },
  { path: '/my-courses', title: '我的课程', icon: 'Notebook', roles: ['teacher'] },
  { path: '/teacher-grade-entry', title: '成绩录入', icon: 'EditPen', roles: ['teacher'] },
  { path: '/teacher-attendance', title: '考勤录入', icon: 'Stamp', roles: ['teacher'] },
  { path: '/my-info', title: '我的信息', icon: 'Postcard', roles: ['student'] },
  { path: '/my-grades', title: '我的成绩', icon: 'DataLine', roles: ['student'] },
  { path: '/my-attendance', title: '我的考勤', icon: 'Finished', roles: ['student'] },
  { path: '/profile', title: '个人中心', icon: 'Setting', roles: ['admin', 'teacher', 'student'] }
];

const menus = computed(() => allMenus.filter((m) => m.roles.includes(role.value)));

const roleText = computed(() => ({ admin: '管理员', teacher: '教师', student: '学生' }[role.value] || ''));
const roleTagType = computed(() => ({ admin: 'danger', teacher: 'warning', student: 'success' }[role.value] || 'info'));
const avatarText = computed(() => (store.user?.name || '用').slice(0, 1));

function handleCommand(cmd) {
  if (cmd === 'logout') {
    store.logout();
    router.push('/login');
  } else if (cmd === 'profile') {
    router.push('/profile');
  }
}
</script>

<style scoped>
.layout { height: 100vh; }
.aside { background: #001529; transition: width 0.2s; overflow: hidden; }
.logo { display: flex; align-items: center; gap: 10px; height: 60px; padding: 0 16px; cursor: pointer; }
.logo-text { color: #fff; font-size: 15px; font-weight: 600; white-space: nowrap; }
.menu { border-right: none; }
.menu :deep(.el-menu-item.is-active) { background: #1677ff !important; }
.header { display: flex; align-items: center; justify-content: space-between; background: #fff; border-bottom: 1px solid #e8e8e8; height: 60px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.collapse-btn { font-size: 20px; cursor: pointer; }
.header-right { display: flex; align-items: center; }
.user-info { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.avatar { background: #1677ff; color: #fff; }
.username { font-size: 14px; }
.main { background: #f0f2f5; padding: 16px; overflow-y: auto; }
</style>
