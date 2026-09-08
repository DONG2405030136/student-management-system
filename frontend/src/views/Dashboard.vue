<template>
  <div>
    <el-card shadow="never" class="welcome-card">
      <div class="welcome">
        <div>
          <h3>你好，{{ store.user?.name }}（{{ roleText }}）</h3>
          <p>{{ welcomeText }}</p>
        </div>
        <el-tag v-if="role === 'student'" type="success" effect="dark">学生端</el-tag>
        <el-tag v-else-if="role === 'teacher'" type="warning" effect="dark">教师端</el-tag>
        <el-tag v-else type="danger" effect="dark">管理端</el-tag>
      </div>
    </el-card>

    <!-- 管理员视图 -->
    <template v-if="role === 'admin' && data">
      <el-row :gutter="16" class="stat-row">
        <el-col v-for="card in adminCards" :key="card.label" :span="4">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon" :style="{ background: card.color }">
              <el-icon :size="26"><component :is="card.icon" /></el-icon>
            </div>
            <div class="stat-num">{{ card.value }}</div>
            <div class="stat-label">{{ card.label }}</div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="14">
          <el-card shadow="never" header="各班级学生人数">
            <div ref="classChartRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="10">
          <el-card shadow="never" header="学生性别分布">
            <div ref="genderChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="16" class="mt16">
        <el-col :span="12">
          <el-card shadow="never" header="成绩分数段分布">
            <div ref="scoreChartRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never" header="课程平均分排行">
            <div ref="courseChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </template>

    <!-- 教师视图 -->
    <template v-else-if="role === 'teacher' && data">
      <el-row :gutter="16" class="stat-row">
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon" style="background:#1677ff"><el-icon :size="26"><Notebook /></el-icon></div>
            <div class="stat-num">{{ data.myCourses }}</div>
            <div class="stat-label">我教授的课程</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon" style="background:#52c41a"><el-icon :size="26"><User /></el-icon></div>
            <div class="stat-num">{{ data.myStudents }}</div>
            <div class="stat-label">开课班级数</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon" style="background:#fa8c16"><el-icon :size="26"><Trophy /></el-icon></div>
            <div class="stat-num">{{ courseCount }}</div>
            <div class="stat-label">已录成绩课程</div>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="14">
          <el-card shadow="never" header="各课程平均分">
            <div ref="courseChartRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="10">
          <el-card shadow="never" header="考勤状态分布">
            <div ref="genderChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </template>

    <!-- 学生视图 -->
    <template v-else-if="role === 'student' && data">
      <el-row :gutter="16" class="stat-row">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon" style="background:#1677ff"><el-icon :size="26"><Reading /></el-icon></div>
            <div class="stat-num">{{ data.myCourses }}</div>
            <div class="stat-label">本学期课程</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon" style="background:#52c41a"><el-icon :size="26"><Trophy /></el-icon></div>
            <div class="stat-num">{{ data.gradeCount }}</div>
            <div class="stat-label">已出成绩科目</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon" style="background:#fa8c16"><el-icon :size="26"><DataLine /></el-icon></div>
            <div class="stat-num">{{ data.avgScore }}</div>
            <div class="stat-label">平均分</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon" style="background:#f5222d"><el-icon :size="26"><Warning /></el-icon></div>
            <div class="stat-num">{{ data.absents }}</div>
            <div class="stat-label">缺勤次数</div>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="14">
          <el-card shadow="never" header="我的各科成绩">
            <div ref="courseChartRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="10">
          <el-card shadow="never" header="我的考勤分布">
            <div ref="genderChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { useUserStore } from '../store/user';
import { getOverview, getTeacherStats, getStudentStats } from '../api';

const store = useUserStore();
const role = computed(() => store.user?.role || '');
const roleText = computed(() => ({ admin: '管理员', teacher: '教师', student: '学生' }[role.value] || ''));
const welcomeText = computed(() => ({
  admin: '欢迎回来，您可以管理学生、教师、课程、成绩与考勤等全部数据。',
  teacher: '欢迎回来，您可以录入成绩、考勤并查看所授课程情况。',
  student: '欢迎回来，您可以查看自己的个人信息、成绩与考勤记录。'
}[role.value] || ''));

const data = ref(null);
const courseCount = computed(() => (data.value?.courseAvg?.length || 0));

const adminCards = computed(() => data.value ? [
  { label: '学生总数', value: data.value.counts.students, icon: 'User', color: '#1677ff' },
  { label: '教师总数', value: data.value.counts.teachers, icon: 'Avatar', color: '#52c41a' },
  { label: '班级总数', value: data.value.counts.classes, icon: 'School', color: '#fa8c16' },
  { label: '课程总数', value: data.value.counts.courses, icon: 'Reading', color: '#722ed1' },
  { label: '成绩记录', value: data.value.counts.grades, icon: 'Trophy', color: '#eb2f96' },
  { label: '考试满分100', value: 100, icon: 'Medal', color: '#13c2c2' }
] : []);

const classChartRef = ref();
const genderChartRef = ref();
const scoreChartRef = ref();
const courseChartRef = ref();

const charts = [];

function renderChart(el, option) {
  if (!el) return;
  const chart = echarts.init(el);
  chart.setOption(option);
  charts.push(chart);
}

async function loadData() {
  if (role.value === 'admin') {
    const res = await getOverview();
    data.value = res.data;
    await nextTick();
    renderChart(classChartRef.value, {
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 30, bottom: 30 },
      xAxis: { type: 'category', data: data.value.classDist.map((i) => i.name), axisLabel: { fontSize: 10, interval: 0, rotate: 20 } },
      yAxis: { type: 'value', minInterval: 1 },
      series: [{ type: 'bar', data: data.value.classDist.map((i) => i.value), barWidth: 36, itemStyle: { color: '#1677ff', borderRadius: [6, 6, 0, 0] } }]
    });
    renderChart(genderChartRef.value, {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [{ type: 'pie', radius: ['40%', '65%'], data: data.value.genderDist.map((i) => ({ name: i.name, value: i.value })), label: { formatter: '{b}: {c}人 ({d}%)' } }]
    });
    const sd = data.value.scoreDist;
    renderChart(scoreChartRef.value, {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['优秀(90-100)', '良好(80-89)', '中等(70-79)', '及格(60-69)', '不及格(<60)'] },
      yAxis: { type: 'value', minInterval: 1 },
      series: [{ type: 'bar', data: [sd.excellent, sd.good, sd.medium, sd.pass, sd.fail], barWidth: 40, itemStyle: { color: '#52c41a', borderRadius: [6, 6, 0, 0] } }]
    });
    renderChart(courseChartRef.value, {
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 30, bottom: 30 },
      xAxis: { type: 'category', data: data.value.courseAvg.map((i) => i.name), axisLabel: { fontSize: 10, interval: 0, rotate: 15 } },
      yAxis: { type: 'value', max: 100 },
      series: [{ type: 'line', data: data.value.courseAvg.map((i) => i.value), smooth: true, symbolSize: 8, itemStyle: { color: '#fa8c16' }, areaStyle: { opacity: 0.15 } }]
    });
  } else if (role.value === 'teacher') {
    const res = await getTeacherStats();
    data.value = res.data;
    await nextTick();
    renderChart(courseChartRef.value, {
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 30, bottom: 30 },
      xAxis: { type: 'category', data: data.value.courseAvg.map((i) => i.name), axisLabel: { fontSize: 11, interval: 0, rotate: 12 } },
      yAxis: { type: 'value', max: 100 },
      series: [{ type: 'bar', data: data.value.courseAvg.map((i) => i.value), barWidth: 38, itemStyle: { color: '#1677ff', borderRadius: [6, 6, 0, 0] } }]
    });
    renderChart(genderChartRef.value, {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [{ type: 'pie', radius: ['40%', '65%'], data: data.value.statusDist.map((i) => ({ name: i.name, value: i.value })), label: { formatter: '{b}: {c}次 ({d}%)' } }]
    });
  } else if (role.value === 'student') {
    const res = await getStudentStats();
    data.value = res.data;
    await nextTick();
    renderChart(courseChartRef.value, {
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 30, bottom: 30 },
      xAxis: { type: 'category', data: data.value.subjectScores.map((i) => i.name), axisLabel: { fontSize: 11, interval: 0, rotate: 12 } },
      yAxis: { type: 'value', max: 100 },
      series: [{ type: 'bar', data: data.value.subjectScores.map((i) => i.value), barWidth: 38, itemStyle: { color: '#52c41a', borderRadius: [6, 6, 0, 0] } }]
    });
    renderChart(genderChartRef.value, {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [{ type: 'pie', radius: ['40%', '65%'], data: data.value.attendanceDist.map((i) => ({ name: i.name, value: i.value })), label: { formatter: '{b}: {c}次 ({d}%)' } }]
    });
  }
}

onMounted(async () => {
  await loadData();
  window.addEventListener('resize', () => charts.forEach((c) => c.resize()));
});
</script>

<style scoped>
.welcome-card { margin-bottom: 16px; }
.welcome { display: flex; justify-content: space-between; align-items: center; }
.welcome h3 { font-size: 18px; }
.welcome p { color: #909399; margin-top: 6px; font-size: 13px; }
.stat-row { margin-bottom: 16px; }
.stat-card { text-align: center; padding: 6px 0; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; color: #fff; display: inline-flex; align-items: center; justify-content: center; }
.stat-num { font-size: 26px; font-weight: 700; margin-top: 10px; color: #1f2d3d; }
.stat-label { color: #909399; font-size: 13px; margin-top: 4px; }
.chart { height: 300px; }
.mt16 { margin-top: 16px; }
</style>
