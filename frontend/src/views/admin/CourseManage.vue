<template>
  <el-card shadow="never">
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="按课程名/课程代码搜索" clearable style="width: 240px" @keyup.enter="load" @clear="load" />
      <el-button type="primary" :icon="Search" @click="load">查询</el-button>
      <div style="flex:1"></div>
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增课程</el-button>
    </div>
    <el-table :data="list" v-loading="loading" stripe border>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="course_code" label="课程代码" width="100" />
      <el-table-column prop="name" label="课程名称" min-width="150" />
      <el-table-column prop="credit" label="学分" width="70" align="center" />
      <el-table-column prop="hours" label="学时" width="70" align="center" />
      <el-table-column prop="teacher_name" label="任课教师" width="100" />
      <el-table-column prop="class_names" label="开课班级" min-width="180" show-overflow-tooltip />
      <el-table-column prop="semester" label="学期" width="110" />
      <el-table-column label="操作" width="140" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openDialog(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑课程' : '新增课程'" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="课程代码" prop="course_code">
              <el-input v-model="form.course_code" :disabled="!!form.id" placeholder="如 AI101" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程名称" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学分">
              <el-input-number v-model="form.credit" :min="0.5" :max="10" :step="0.5" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学时">
              <el-input-number v-model="form.hours" :min="8" :max="128" :step="8" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任课教师">
              <el-select v-model="form.teacher_id" placeholder="选择教师" clearable style="width: 100%">
                <el-option v-for="t in teachers" :key="t.id" :label="`${t.name}（${t.teacher_no}）`" :value="t.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学期">
              <el-select v-model="form.semester" style="width: 100%">
                <el-option v-for="s in ['2024-2025-1', '2024-2025-2', '2025-2026-1', '2025-2026-2']" :key="s" :label="s" :value="s" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="开课班级">
              <el-select v-model="selectedClasses" multiple placeholder="选择开课班级" style="width: 100%">
                <el-option v-for="c in classes" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
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
import { getCourses, createCourse, updateCourse, deleteCourse, getTeachers, getClasses, setCourseClasses } from '../../api';

const loading = ref(false);
const list = ref([]);
const keyword = ref('');
const teachers = ref([]);
const classes = ref([]);
const dialogVisible = ref(false);
const saving = ref(false);
const formRef = ref();
const selectedClasses = ref([]);
const form = reactive({ id: null, course_code: '', name: '', credit: 2, hours: 32, teacher_id: null, semester: '2025-2026-2' });
const rules = {
  course_code: [{ required: true, message: '请输入课程代码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }]
};

async function load() {
  loading.value = true;
  try {
    list.value = (await getCourses({ keyword: keyword.value.trim() })).data;
  } finally {
    loading.value = false;
  }
}

async function loadOptions() {
  teachers.value = (await getTeachers({})).data;
  classes.value = (await getClasses()).data;
}

function openDialog(row) {
  Object.assign(form, row ? { ...row } : { id: null, course_code: '', name: '', credit: 2, hours: 32, teacher_id: null, semester: '2025-2026-2' });
  selectedClasses.value = row ? [] : [];
  dialogVisible.value = true;
}

async function save() {
  await formRef.value.validate().catch(() => Promise.reject());
  saving.value = true;
  try {
    if (form.id) {
      await updateCourse(form.id, form);
      await setCourseClasses(form.id, selectedClasses.value);
    } else {
      const res = await createCourse(form);
      if (selectedClasses.value.length) await setCourseClasses(res.data.id, selectedClasses.value);
    }
    ElMessage.success('保存成功');
    dialogVisible.value = false;
    load();
  } catch (e) {
  } finally {
    saving.value = false;
  }
}

async function remove(row) {
  await ElMessageBox.confirm(`确定删除课程「${row.name}」吗？将同时删除该课程的成绩与考勤记录。`, '提示', { type: 'warning' });
  await deleteCourse(row.id);
  ElMessage.success('删除成功');
  load();
}

onMounted(() => {
  loadOptions();
  load();
});
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 16px; }
</style>
