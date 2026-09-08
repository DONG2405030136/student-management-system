<template>
  <el-card shadow="never">
    <template #header><b>个人中心</b></template>
    <el-row :gutter="40">
      <el-col :span="10">
        <div class="profile-head">
          <el-avatar :size="80" class="big-avatar">{{ (me?.name || '用').slice(0, 1) }}</el-avatar>
          <h3>{{ me?.name }}</h3>
          <el-tag :type="roleType" size="small">{{ roleText }}</el-tag>
        </div>
        <el-descriptions :column="1" border class="mt16">
          <el-descriptions-item label="用户名">{{ me?.username }}</el-descriptions-item>
          <el-descriptions-item label="角色">{{ roleText }}</el-descriptions-item>
          <el-descriptions-item v-if="me?.profile" label="学号/工号">{{ me.profile.student_no || me.profile.teacher_no || '—' }}</el-descriptions-item>
          <el-descriptions-item v-if="me?.profile" label="班级/职称">{{ me.profile.class_name || me.profile.title || '—' }}</el-descriptions-item>
          <el-descriptions-item v-if="me?.profile" label="联系电话">{{ me.profile.phone || '—' }}</el-descriptions-item>
          <el-descriptions-item v-if="me?.profile" label="邮箱">{{ me.profile.email || '—' }}</el-descriptions-item>
        </el-descriptions>
      </el-col>
      <el-col :span="14">
        <h4 class="pwd-title">修改密码</h4>
        <el-form ref="formRef" :model="pwdForm" :rules="pwdRules" label-width="90px" style="max-width: 420px">
          <el-form-item label="旧密码" prop="oldPassword">
            <el-input v-model="pwdForm.oldPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="pwdForm.newPassword" type="password" show-password placeholder="至少6位" />
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirm">
            <el-input v-model="pwdForm.confirm" type="password" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="saving" @click="changePwd">确认修改</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getMe, changePassword } from '../api';
import { useUserStore } from '../store/user';

const store = useUserStore();
const me = ref(null);
const roleText = computed(() => ({ admin: '管理员', teacher: '教师', student: '学生' }[me.value?.role] || ''));
const roleType = computed(() => ({ admin: 'danger', teacher: 'warning', student: 'success' }[me.value?.role] || 'info'));

const formRef = ref();
const saving = ref(false);
const pwdForm = reactive({ oldPassword: '', newPassword: '', confirm: '' });
const pwdRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [{ required: true, min: 6, message: '新密码至少6位', trigger: 'blur' }],
  confirm: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, cb) => (value === pwdForm.newPassword ? cb() : cb(new Error('两次输入的密码不一致'))),
      trigger: 'blur'
    }
  ]
};

async function changePwd() {
  await formRef.value.validate().catch(() => Promise.reject());
  saving.value = true;
  try {
    await changePassword({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword });
    ElMessage.success('密码修改成功，请重新登录');
    store.logout();
    setTimeout(() => location.href = '/login', 800);
  } catch (e) {
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  me.value = (await getMe()).data;
});
</script>

<style scoped>
.profile-head { text-align: center; padding: 12px 0; }
.big-avatar { background: #1677ff; font-size: 32px; }
.mt16 { margin-top: 16px; }
.pwd-title { margin: 0 0 16px; }
</style>
