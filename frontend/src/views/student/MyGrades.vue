<template>
  <el-row :gutter="16">
    <el-col :span="16">
      <el-card shadow="never">
        <template #header><b>我的成绩单</b></template>
        <el-table :data="list" v-loading="loading" stripe border>
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="course_code" label="课程代码" width="100" />
          <el-table-column prop="course_name" label="课程名称" min-width="150" />
          <el-table-column prop="credit" label="学分" width="70" align="center" />
          <el-table-column prop="teacher_name" label="任课教师" width="100" />
          <el-table-column label="成绩" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="scoreType(row.score)" effect="light" size="large">{{ row.score }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="等第" width="80" align="center">
            <template #default="{ row }">{{ levelOf(row.score) }}</template>
          </el-table-column>
          <el-table-column prop="semester" label="学期" width="110" />
        </el-table>
        <el-empty v-if="!loading && !list.length" description="暂无成绩记录" />
      </el-card>
    </el-col>
    <el-col :span="8">
      <el-card shadow="never" class="summary-card">
        <template #header><b>学习概况</b></template>
        <div class="summary-item">
          <span>已出成绩科目</span>
          <b>{{ list.length }} 门</b>
        </div>
        <div class="summary-item">
          <span>平均分</span>
          <b :style="{ color: avgScore >= 60 ? '#52c41a' : '#f5222d' }">{{ avgScore }}</b>
        </div>
        <div class="summary-item">
          <span>最高分</span>
          <b style="color: #1677ff">{{ maxScore || '—' }}</b>
        </div>
        <div class="summary-item">
          <span>及格科目</span>
          <b style="color: #fa8c16">{{ passCount }} 门</b>
        </div>
        <el-progress :percentage="passRate" :color="'#52c41a'" :stroke-width="14" :format="() => `及格率 ${passRate}%`" class="mt16" />
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getMyGrades } from '../../api';

const loading = ref(false);
const list = ref([]);

const avgScore = computed(() => {
  if (!list.value.length) return 0;
  return (list.value.reduce((s, r) => s + r.score, 0) / list.value.length).toFixed(1);
});
const maxScore = computed(() => (list.value.length ? Math.max(...list.value.map((r) => r.score)) : 0));
const passCount = computed(() => list.value.filter((r) => r.score >= 60).length);
const passRate = computed(() => (list.value.length ? Math.round((passCount.value / list.value.length) * 100) : 0));

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

onMounted(async () => {
  loading.value = true;
  try {
    list.value = (await getMyGrades()).data;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.summary-card :deep(.el-card__body) { padding-top: 8px; }
.summary-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #ebeef5; font-size: 14px; }
.summary-item b { font-size: 16px; }
.mt16 { margin-top: 16px; }
</style>
