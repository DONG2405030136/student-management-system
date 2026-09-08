<template>
  <el-card shadow="never">
    <h3 style="margin: 0 0 16px">我教授的课程</h3>
    <el-table :data="list" v-loading="loading" stripe border>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="course_code" label="课程代码" width="110" />
      <el-table-column prop="name" label="课程名称" min-width="160" />
      <el-table-column prop="credit" label="学分" width="80" align="center" />
      <el-table-column prop="hours" label="学时" width="80" align="center" />
      <el-table-column prop="semester" label="学期" width="120" />
      <el-table-column label="操作" width="220" align="center">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="$router.push({ path: '/teacher-grade-entry', query: { courseId: row.id } })">
            录入成绩
          </el-button>
          <el-button type="warning" link size="small" @click="$router.push({ path: '/teacher-attendance', query: { courseId: row.id } })">
            考勤录入
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getMyCourses } from '../../api';

const loading = ref(false);
const list = ref([]);

onMounted(async () => {
  loading.value = true;
  try {
    list.value = (await getMyCourses()).data;
  } finally {
    loading.value = false;
  }
});
</script>
