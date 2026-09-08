<template>
  <el-card shadow="never">
    <div class="toolbar">
      <el-select v-model="courseId" placeholder="选择要录入成绩的课程" style="width: 260px" @change="loadStudents">
        <el-option v-for="c in courses" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <el-tag v-if="stats" type="info" effect="plain">
        当前统计：平均 {{ stats.avg_score || 0 }} 分，最高 {{ stats.max_score || 0 }}，及格率 {{ stats.pass_rate || 0 }}%
      </el-tag>
    </div>

    <el-alert v-if="!courseId" type="info" :closable="false" show-icon title="请先在上方选择课程，然后为学生录入成绩" class="mb16" />

    <el-table :data="rows" v-loading="loading" stripe border max-height="560">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="student_no" label="学号" width="130" />
      <el-table-column prop="name" label="姓名" width="110" />
      <el-table-column prop="class_name" label="班级" min-width="170" />
      <el-table-column label="成绩" width="200">
        <template #default="{ row }">
          <el-input-number v-model="row.score" :min="0" :max="100" :step="1" :disabled="!courseId" />
        </template>
      </el-table-column>
      <el-table-column label="等第" width="90" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.score !== null && row.score !== undefined" :type="levelType(row.score)" size="small">{{ levelOf(row.score) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template #default="{ row }">
          <el-button type="primary" link size="small" :disabled="!courseId || row.score === null || row.score === undefined" @click="saveOne(row)">
            保存
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="footer">
      <el-button type="primary" :icon="Select" :disabled="!courseId" :loading="saving" @click="saveAll">一键保存所有已填成绩</el-button>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Select } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
import { getMyCourses, getStudents, saveGrade, batchGrades, getGradeStats } from '../../api';

const route = useRoute();
const courses = ref([]);
const courseId = ref(null);
const rows = ref([]);
const loading = ref(false);
const saving = ref(false);
const stats = ref(null);

function levelOf(s) {
  if (s >= 90) return '优秀';
  if (s >= 80) return '良好';
  if (s >= 70) return '中等';
  if (s >= 60) return '及格';
  return '不及格';
}
function levelType(s) {
  if (s >= 90) return 'success';
  if (s >= 60) return 'primary';
  return 'danger';
}

async function loadStudents() {
  if (!courseId.value) return;
  loading.value = true;
  try {
    const res = await getStudents({ page: 1, pageSize: 300 });
    rows.value = res.data.list.map((s) => ({ studentId: s.id, student_no: s.student_no, name: s.name, class_name: s.class_name, score: undefined }));
    const s = await getGradeStats({ courseId: courseId.value });
    stats.value = s.data;
  } finally {
    loading.value = false;
  }
}

async function saveOne(row) {
  if (row.score === undefined || row.score === null) return ElMessage.warning('请先填写成绩');
  await saveGrade({ studentId: row.studentId, courseId: courseId.value, score: row.score, semester: '2025-2026-2', examType: '期末', comment: '' });
  ElMessage.success(`${row.name} 成绩已保存`);
  loadStudents();
}

async function saveAll() {
  const items = rows.value
    .filter((r) => r.score !== undefined && r.score !== null)
    .map((r) => ({ studentId: r.studentId, score: r.score }));
  if (!items.length) return ElMessage.warning('请至少填写一名学生的成绩');
  saving.value = true;
  try {
    await batchGrades({ courseId: courseId.value, items, semester: '2025-2026-2' });
    ElMessage.success('成绩全部保存成功');
    loadStudents();
  } catch (e) {
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  courses.value = (await getMyCourses()).data;
  if (route.query.courseId) {
    courseId.value = Number(route.query.courseId);
    loadStudents();
  }
});
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; }
.mb16 { margin-bottom: 16px; }
.footer { margin-top: 16px; text-align: right; }
</style>
