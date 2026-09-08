<template>
  <el-card shadow="never">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input v-model="query.keyword" placeholder="按姓名/学号搜索" clearable style="width: 220px" @keyup.enter="load" @clear="load" />
        <el-select v-model="query.classId" placeholder="按班级筛选" clearable style="width: 220px" @change="load">
          <el-option v-for="c in classes" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
        <el-button type="primary" :icon="Search" @click="load">查询</el-button>
      </div>
      <div class="toolbar-right">
        <el-button v-if="isAdmin" type="primary" :icon="Plus" @click="openDialog()">新增学生</el-button>
        <el-button :icon="Download" @click="exportCsv">导出CSV</el-button>
      </div>
    </div>

    <!-- 表格 -->
    <el-table :data="list" v-loading="loading" stripe border>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="student_no" label="学号" width="130" />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="gender" label="性别" width="70" align="center" />
      <el-table-column prop="class_name" label="班级" min-width="160" />
      <el-table-column prop="major" label="专业" min-width="140" />
      <el-table-column prop="phone" label="联系电话" width="130" />
      <el-table-column prop="enroll_year" label="入学年份" width="90" align="center" />
      <el-table-column label="操作" width="160" align="center" fixed="right">
        <template #default="{ row }">
          <el-button v-if="isAdmin" link type="primary" size="small" @click="openDialog(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      class="pager"
      background
      layout="total, sizes, prev, pager, next"
      :total="total"
      v-model:current-page="query.page"
      v-model:page-size="query.pageSize"
      :page-sizes="[10, 20, 50]"
      @current-change="load"
      @size-change="load"
    />

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑学生' : '新增学生'" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="学号" prop="student_no">
              <el-input v-model="form.student_no" placeholder="如 2405030136" :disabled="!!form.id" />
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
            <el-form-item label="出生日期">
              <el-date-picker v-model="form.birth_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属班级">
              <el-select v-model="form.class_id" placeholder="选择班级" clearable style="width: 100%">
                <el-option v-for="c in classes" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入学年份">
              <el-input v-model="form.enroll_year" placeholder="如 2024" />
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
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus, Download } from '@element-plus/icons-vue';
import { getStudents, createStudent, updateStudent, deleteStudent, getClasses } from '../../api';
import { useUserStore } from '../../store/user';

const store = useUserStore();
const isAdmin = computed(() => store.user?.role === 'admin');

const loading = ref(false);
const list = ref([]);
const total = ref(0);
const classes = ref([]);
const query = reactive({ page: 1, pageSize: 10, keyword: '', classId: '' });

const dialogVisible = ref(false);
const saving = ref(false);
const formRef = ref();
const form = reactive({ id: null, student_no: '', name: '', gender: '男', birth_date: '', phone: '', email: '', class_id: null, enroll_year: '' });
const formRules = {
  student_no: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
};

async function load() {
  loading.value = true;
  try {
    const res = await getStudents({ ...query, keyword: query.keyword.trim() });
    list.value = res.data.list;
    total.value = res.data.total;
  } finally {
    loading.value = false;
  }
}

async function loadClasses() {
  classes.value = (await getClasses()).data;
}

function openDialog(row) {
  Object.assign(form, row ? { ...row } : { id: null, student_no: '', name: '', gender: '男', birth_date: '', phone: '', email: '', class_id: null, enroll_year: '' });
  dialogVisible.value = true;
}

async function save() {
  await formRef.value.validate().catch(() => Promise.reject());
  saving.value = true;
  try {
    if (form.id) {
      await updateStudent(form.id, form);
    } else {
      await createStudent(form);
    }
    ElMessage.success(form.id ? '修改成功' : '新增成功');
    dialogVisible.value = false;
    load();
  } catch (e) {
  } finally {
    saving.value = false;
  }
}

async function remove(row) {
  await ElMessageBox.confirm(`确定删除学生「${row.name}」吗？`, '提示', { type: 'warning' });
  await deleteStudent(row.id);
  ElMessage.success('删除成功');
  load();
}

function exportCsv() {
  const header = ['学号', '姓名', '性别', '班级', '专业', '联系电话', '邮箱', '入学年份'];
  const rows = list.value.map((r) => [r.student_no, r.name, r.gender, r.class_name || '', r.major || '', r.phone || '', r.email || '', r.enroll_year || '']);
  const csv = '\ufeff' + [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '学生信息.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

onMounted(() => {
  loadClasses();
  load();
});
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; margin-bottom: 16px; }
.toolbar-left, .toolbar-right { display: flex; gap: 10px; }
.pager { margin-top: 16px; justify-content: flex-end; }
</style>
