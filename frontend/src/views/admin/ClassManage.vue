<template>
  <el-card shadow="never">
    <div class="toolbar">
      <h3 style="margin: 0">班级管理</h3>
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增班级</el-button>
    </div>
    <el-table :data="list" v-loading="loading" stripe border>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="name" label="班级名称" min-width="200" />
      <el-table-column prop="major" label="专业" min-width="140" />
      <el-table-column prop="grade_year" label="年级" width="90" align="center" />
      <el-table-column prop="head_teacher" label="班主任" width="110" />
      <el-table-column prop="student_count" label="学生人数" width="100" align="center" />
      <el-table-column label="操作" width="140" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openDialog(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑班级' : '新增班级'" width="460px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="form.name" placeholder="如 2024级人工智能技术应用1班" />
        </el-form-item>
        <el-form-item label="专业">
          <el-input v-model="form.major" placeholder="如 人工智能技术应用" />
        </el-form-item>
        <el-form-item label="年级">
          <el-input v-model="form.grade_year" placeholder="如 2024" />
        </el-form-item>
        <el-form-item label="班主任">
          <el-input v-model="form.head_teacher" />
        </el-form-item>
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
import { Plus } from '@element-plus/icons-vue';
import { getClasses, createClass, updateClass, deleteClass } from '../../api';

const loading = ref(false);
const list = ref([]);
const dialogVisible = ref(false);
const saving = ref(false);
const formRef = ref();
const form = reactive({ id: null, name: '', major: '', grade_year: '', head_teacher: '' });
const rules = { name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }] };

async function load() {
  loading.value = true;
  try {
    list.value = (await getClasses()).data;
  } finally {
    loading.value = false;
  }
}

function openDialog(row) {
  Object.assign(form, row ? { ...row } : { id: null, name: '', major: '', grade_year: '', head_teacher: '' });
  dialogVisible.value = true;
}

async function save() {
  await formRef.value.validate().catch(() => Promise.reject());
  saving.value = true;
  try {
    if (form.id) await updateClass(form.id, form);
    else await createClass(form);
    ElMessage.success('保存成功');
    dialogVisible.value = false;
    load();
  } catch (e) {
  } finally {
    saving.value = false;
  }
}

async function remove(row) {
  await ElMessageBox.confirm(`确定删除班级「${row.name}」吗？`, '提示', { type: 'warning' });
  await deleteClass(row.id);
  ElMessage.success('删除成功');
  load();
}

onMounted(load);
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
</style>
