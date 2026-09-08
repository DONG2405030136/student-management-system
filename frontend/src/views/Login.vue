<template>
  <div class="login-page">
    <div class="login-bg"></div>
    <el-card class="login-card" shadow="always">
      <div class="login-title">
        <el-icon :size="38" color="#1677ff"><School /></el-icon>
        <h2>学生信息管理系统</h2>
        <p>Student Information Management System</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" size="large" @keyup.enter="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :prefix-icon="User" clearable />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" :prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      <el-divider>演示账号</el-divider>
      <div class="demo-accounts">
        <el-button size="small" @click="fill('admin')">管理员 admin</el-button>
        <el-button size="small" type="warning" @click="fill('teacher1')">教师 teacher1</el-button>
        <el-button size="small" type="success" @click="fill('student1')">学生 student1</el-button>
      </div>
      <p class="pwd-hint">密码统一为 123456</p>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import { useUserStore } from '../store/user';

const router = useRouter();
const route = useRoute();
const store = useUserStore();

const formRef = ref();
const loading = ref(false);
const form = ref({ username: '', password: '' });
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

function fill(name) {
  form.value.username = name;
  form.value.password = '123456';
}

async function handleLogin() {
  await formRef.value.validate().catch(() => Promise.reject());
  loading.value = true;
  try {
    await store.login(form.value.username, form.value.password);
    ElMessage.success('登录成功');
    router.push(route.query.redirect || '/dashboard');
  } catch (e) {
    // 错误信息由拦截器统一提示
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page { position: relative; height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.login-bg {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, #0f2b5b 0%, #1677ff 60%, #36cfc9 100%);
}
.login-bg::after {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0, transparent 40%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.12) 0, transparent 40%);
}
.login-card { width: 400px; border-radius: 12px; padding: 8px 8px 4px; z-index: 1; }
.login-title { text-align: center; margin-bottom: 24px; }
.login-title h2 { margin: 10px 0 4px; color: #1f2d3d; }
.login-title p { color: #909399; font-size: 12px; letter-spacing: 1px; }
.login-btn { width: 100%; }
.demo-accounts { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
.pwd-hint { text-align: center; color: #909399; font-size: 12px; margin-top: 10px; }
</style>
