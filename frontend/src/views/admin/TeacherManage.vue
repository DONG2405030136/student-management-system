<template>
  <el-card shadow="never">
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="按姓名/工号搜索" clearable style="width: 220px" @keyup.enter="load" @clear="load" />
      <el-button type="primary" :icon="Search" @click="load">查询</el-button>
      <div style="flex:1"></div>
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增教师</el-button>
    </div>
    <el-table :data="list" v-loading="loading" stripe border>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="teacher_no" label="工号" width="110" />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="gender" label="性别" width="70" align="center" />
      <el-table-column prop="title" label="职称" width="90" align="center" />
      <el-table-column prop="course_count" label="任教课程数" width="100" align="center" />
      <el-table-column prop="phone" label="联系电话" width="130" />
      <el-table-column prop="email" label="邮箱" min-width="160" />
      <el-table-column label="操作" width="140" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openDialog(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑教师' : '新增教师'" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="工号" prop="teacher_no">
              <el-input v-model="form.teacher_no" :disabled="!!form.id" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别">
              <el-radio-group v-model="form.gender">
                <el-radio value="男">男</el-radio>
                <el-radio value="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职称">
              <el-select v-model="form.title" style="width: 100%">
                <el-option v-for="t in ['助教', '讲师', '副教授', '教授']" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="form.phone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱">
              <el-input v-model="form.email" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus } from '@element-plus/icons-vue';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../../api';

const loading = ref(false);
const list = ref([]);
const keyword = ref('');
const dialogVisible = ref(false);
const saving = ref(false);
const formRef = ref();
const form = reactive({ id: null, teacher_no: '', name: '', gender: '男', title: '讲师', phone: '', email: '' });
const rules = {
  teacher_no: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
};

async function load() {
  loading.value = true;
  try {
    list.value = (await getTeachers({ keyword: keyword.value.trim() })).data;
  } finally {
    loading.value = false;
  }
}

function openDialog(row) {
  Object.assign(form, row ? { ...row } : { id: null, teacher_no: '', name: '', gender: '男', title: '讲师', phone: '', email: '' });
  dialogVisible.value = true;
}

async function save() {
  await formRef.value.validate().catch(() => Promise.reject());
  saving.value = true;
  try {
    if (form.id) await updateTeacher(form.id, form);
    else await createTeacher(form);
    ElMessage.success('保存成功');
    dialogVisible.value = false;
    load();
  } catch (e) {
  } finally {
    saving.value = false;
  }
}

async function remove(row) {
  await ElMessageBox.confirm(`确定删除教师「${row.name}」吗？`, '提示', { type: 'warning' });
  await deleteTeacher(row.id);
  ElMessage.success('删除成功');
  load();
}

onMounted(load);
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 16px; }
</style>
