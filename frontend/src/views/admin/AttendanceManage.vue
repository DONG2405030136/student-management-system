<template>
  <el-card shadow="never">
    <div class="toolbar">
      <el-select v-model="query.courseId" placeholder="按课程筛选" clearable style="width: 200px" @change="load">
        <el-option v-for="c in courses" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <el-date-picker v-model="query.date" type="date" value-format="YYYY-MM-DD" placeholder="按日期筛选" style="width: 180px" @change="load" />
      <el-input v-model="query.keyword" placeholder="按姓名/学号搜索" clearable style="width: 200px" @keyup.enter="load" @clear="load" />
      <el-button type="primary" :icon="Search" @click="load">查询</el-button>
      <div style="flex:1"></div>
      <el-button type="primary" :icon="Stamp" @click="openRecord()">录入考勤</el-button>
    </div>

    <el-table :data="list" v-loading="loading" stripe border>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="date" label="日期" width="110" />
      <el-table-column prop="student_no" label="学号" width="120" />
      <el-table-column prop="student_name" label="姓名" width="100" />
      <el-table-column prop="class_name" label="班级" min-width="150" />
      <el-table-column prop="course_name" label="课程" min-width="130" />
      <el-table-column label="考勤状态" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" effect="light">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
      <el-table-column label="操作" width="80" align="center">
        <template #default="{ row }">
          <el-button link type="danger" size="small" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 录入考勤 -->
    <el-dialog v-model="recordVisible" title="录入考勤" width="620px" destroy-on-close>
      <el-form label-width="90px">
        <el-form-item label="选择课程" required>
          <el-select v-model="recordCourseId" placeholder="选择课程" style="width: 100%" @change="loadRecordStudents">
            <el-option v-for="c in courses" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="考勤日期" required>
          <el-date-picker v-model="recordDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-table :data="recordRows" v-loading="recordLoading" border max-height="340" size="small">
          <el-table-column prop="student_no" label="学号" width="110" />
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column label="状态" width="160">
            <template #default="{ row }">
              <el-select v-model="row.status" size="small" style="width: 130px">
                <el-option v-for="s in ['出勤', '迟到', '请假', '缺勤']" :key="s" :label="s" :value="s" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="备注">
            <template #default="{ row }">
              <el-input v-model="row.remark" size="small" placeholder="选填" />
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <el-button @click="recordVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveRecords">保存全部考勤</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Stamp } from '@element-plus/icons-vue';
import { getAttendance, getCourses, getStudents, saveAttendance, deleteAttendance } from '../../api';

const loading = ref(false);
const list = ref([]);
const courses = ref([]);
const query = reactive({ courseId: '', date: '', keyword: '' });

const recordVisible = ref(false);
const recordLoading = ref(false);
const recordCourseId = ref(null);
const recordDate = ref('');
const recordRows = ref([]);
const saving = ref(false);

function statusType(s) {
  return { 出勤: 'success', 迟到: 'warning', 请假: 'info', 缺勤: 'danger' }[s] || 'info';
}

async function load() {
  loading.value = true;
  try {
    list.value = (await getAttendance({ ...query, keyword: query.keyword.trim() })).data;
  } finally {
    loading.value = false;
  }
}

async function loadRecordStudents() {
  if (!recordCourseId.value) return;
  recordLoading.value = true;
  try {
    const res = await getStudents({ page: 1, pageSize: 200 });
    recordRows.value = res.data.list.map((s) => ({ studentId: s.id, student_no: s.student_no, name: s.name, status: '出勤', remark: '' }));
  } finally {
    recordLoading.value = false;
  }
}

function openRecord() {
  recordVisible.value = true;
  recordCourseId.value = null;
  recordDate.value = new Date().toISOString().slice(0, 10);
  recordRows.value = [];
}

async function saveRecords() {
  if (!recordCourseId.value) return ElMessage.warning('请选择课程');
  if (!recordDate.value) return ElMessage.warning('请选择日期');
  saving.value = true;
  try {
    for (const r of recordRows.value) {
      await saveAttendance({ studentId: r.studentId, courseId: recordCourseId.value, date: recordDate.value, status: r.status, remark: r.remark });
    }
    ElMessage.success('考勤保存成功');
    recordVisible.value = false;
    load();
  } catch (e) {
  } finally {
    saving.value = false;
  }
}

async function remove(row) {
  await ElMessageBox.confirm(`确定删除该条考勤记录吗？`, '提示', { type: 'warning' });
  await deleteAttendance(row.id);
  ElMessage.success('删除成功');
  load();
}

onMounted(async () => {
  courses.value = (await getCourses({})).data;
  load();
});
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
</style>
