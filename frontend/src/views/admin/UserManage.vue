<template>
  <el-card shadow="never">
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="按用户名/姓名搜索" clearable style="width: 220px" @keyup.enter="load" @clear="load" />
      <el-button type="primary" :icon="Search" @click="load">查询</el-button>
      <div style="flex:1"></div>
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增账号</el-button>
    </div>
    <el-table :data="list" v-loading="loading" stripe border>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="username" label="用户名" width="140" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column label="角色" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="roleType(row.role)" size="small">{{ roleText(row.role) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-switch :model-value="row.status === 1" @change="(v) => toggleStatus(row, v)" />
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="170" />
      <el-table-column label="操作" width="200" align="center">
        <template #default="{ row }">
          <el-button link type="warning" size="small" @click="resetPwd(row)">重置密码</el-button>
          <el-button link type="danger" size="small" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="新增账号" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="初始密码" prop="password">
          <el-input v-model="form.password" placeholder="默认 123456" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-radio-group v-model="form.role">
            <el-radio value="admin">管理员</el-radio>
            <el-radio value="teacher">教师</el-radio>
            <el-radio value="student">学生</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">创建</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus } from '@element-plus/icons-vue';
import { getUsers, createUser, resetPassword, setUserStatus, deleteUser } from '../../api';

const loading = ref(false);
const list = ref([]);
const keyword = ref('');
const dialogVisible = ref(false);
const saving = ref(false);
const formRef = ref();
const form = reactive({ username: '', name: '', password: '123456', role: 'student' });
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
};

function roleText(r) { return { admin: '管理员', teacher: '教师', student: '学生' }[r] || r; }
function roleType(r) { return { admin: 'danger', teacher: 'warning', student: 'success' }[r] || 'info'; }

async function load() {
  loading.value = true;
  try {
    list.value = (await getUsers({ keyword: keyword.value.trim() })).data;
  } finally {
    loading.value = false;
  }
}

function openDialog() {
  Object.assign(form, { username: '', name: '', password: '123456', role: 'student' });
  dialogVisible.value = true;
}

async function save() {
  await formRef.value.validate().catch(() => Promise.reject());
  saving.value = true;
  try {
    await createUser(form);
    ElMessage.success('账号创建成功');
    dialogVisible.value = false;
    load();
  } catch (e) {
  } finally {
    saving.value = false;
  }
}

async function resetPwd(row) {
  await ElMessageBox.confirm(`确定将「${row.username}」的密码重置为 123456 吗？`, '提示', { type: 'warning' });
  await resetPassword(row.id, '123456');
  ElMessage.success('密码已重置为 123456');
}

async function toggleStatus(row, v) {
  await setUserStatus(row.id, v ? 1 : 0);
  row.status = v ? 1 : 0;
  ElMessage.success(v ? '账号已启用' : '账号已禁用');
}

async function remove(row) {
  await ElMessageBox.confirm(`确定删除账号「${row.username}」吗？`, '提示', { type: 'warning' });
  await deleteUser(row.id);
  ElMessage.success('删除成功');
  load();
}

onMounted(load);
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 16px; }
</style>
