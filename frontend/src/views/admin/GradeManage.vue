<template>
  <el-card shadow="never">
    <div class="toolbar">
      <el-select v-model="query.courseId" placeholder="按课程筛选" clearable style="width: 200px" @change="load">
        <el-option v-for="c in courses" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <el-select v-model="query.classId" placeholder="按班级筛选" clearable style="width: 200px" @change="load">
        <el-option v-for="c in classes" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <el-input v-model="query.keyword" placeholder="按姓名/学号搜索" clearable style="width: 200px" @keyup.enter="load" @clear="load" />
      <el-button type="primary" :icon="Search" @click="load">查询</el-button>
      <div style="flex:1"></div>
      <el-tag v-if="stats" type="info" effect="plain">
        平均 {{ stats.avg_score || 0 }} | 最高 {{ stats.max_score || 0 }} | 最低 {{ stats.min_score || 0 }} | 及格率 {{ stats.pass_rate || 0 }}%
      </el-tag>
      <el-button type="primary" :icon="EditPen" @click="batchVisible = true">批量录入成绩</el-button>
    </div>

    <el-table :data="list" v-loading="loading" stripe border>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="student_no" label="学号" width="120" />
      <el-table-column prop="student_name" label="姓名" width="100" />
      <el-table-column prop="class_name" label="班级" min-width="150" />
      <el-table-column prop="course_name" label="课程" min-width="130" />
      <el-table-column label="成绩" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="scoreType(row.score)" effect="light">{{ row.score }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="exam_type" label="考试类型" width="90" align="center" />
      <el-table-column prop="semester" label="学期" width="110" />
      <el-table-column prop="comment" label="备注" min-width="120" show-overflow-tooltip />
    </el-table>

    <!-- 批量录入 -->
    <el-dialog v-model="batchVisible" title="批量录入成绩" width="680px" destroy-on-close>
      <el-form label-width="90px">
        <el-form-item label="选择课程" required>
          <el-select v-model="batchCourseId" placeholder="选择课程" style="width: 100%" @change="loadBatchStudents">
            <el-option v-for="c in courses" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="batchCourseId" label="开课班级">
          <el-select v-model="batchClassId" placeholder="选择班级" clearable style="width: 100%" @change="loadBatchStudents">
            <el-option v-for="c in batchClasses" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-table :data="batchRows" v-loading="batchLoading" border max-height="360" size="small">
          <el-table-column prop="student_no" label="学号" width="110" />
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column label="成绩" width="140">
            <template #default="{ row }">
              <el-input-number v-model="row.score" :min="0" :max="100" :step="1" size="small" style="width: 110px" />
            </template>
          </el-table-column>
          <el-table-column label="等第" width="80">
            <template #default="{ row }">{{ levelOf(row.score) }}</template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <el-button @click="batchVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveBatch">一键保存全部</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, EditPen } from '@element-plus/icons-vue';
import { getGrades, getGradeStats, getCourses, getClasses, getStudents, batchGrades } from '../../api';

const loading = ref(false);
const list = ref([]);
const courses = ref([]);
const classes = ref([]);
const stats = ref(null);
const query = reactive({ courseId: '', classId: '', keyword: '' });

const batchVisible = ref(false);
const batchLoading = ref(false);
const batchCourseId = ref(null);
const batchClassId = ref(null);
const batchRows = ref([]);
const saving = ref(false);

const batchClasses = computed(() => {
  if (!batchCourseId.value) return [];
  return classes.value;
});

function scoreType(s) {
  if (s >= 90) return 'success';
  if (s >= 80) return 'primary';
  if (s >= 60) return 'warning';
  return 'danger';
}
function levelOf(s) {
  if (s >= 90) return '优秀';
  if (s >= 80) return '良好';
  if (s >= 70) return '中等';
  if (s >= 60) return '及格';
  return '不及格';
}

async function load() {
  loading.value = true;
  try {
    const res = await getGrades({ ...query, keyword: query.keyword.trim() });
    list.value = res.data;
    const s = await getGradeStats({ courseId: query.courseId || undefined });
    stats.value = s.data;
  } finally {
    loading.value = false;
  }
}

async function loadBatchStudents() {
  if (!batchCourseId.value) return;
  batchLoading.value = true;
  try {
    const params = { page: 1, pageSize: 200 };
    if (batchClassId.value) params.classId = batchClassId.value;
    const res = await getStudents(params);
    batchRows.value = res.data.list.map((s) => ({ studentId: s.id, student_no: s.student_no, name: s.name, score: undefined }));
  } finally {
    batchLoading.value = false;
  }
}

async function saveBatch() {
  if (!batchCourseId.value) return ElMessage.warning('请先选择课程');
  const items = batchRows.value
    .filter((r) => r.score !== undefined && r.score !== null)
    .map((r) => ({ studentId: r.studentId, score: r.score }));
  if (!items.length) return ElMessage.warning('请至少录入一名学生的成绩');
  saving.value = true;
  try {
    await batchGrades({ courseId: batchCourseId.value, items, semester: '2025-2026-2' });
    ElMessage.success('成绩已保存');
    batchVisible.value = false;
    load();
  } catch (e) {
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  courses.value = (await getCourses({})).data;
  classes.value = (await getClasses()).data;
  load();
});
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
</style>
