<template>
  <el-card shadow="never">
    <template #header><b>我的考勤记录</b></template>
    <el-table :data="list" v-loading="loading" stripe border>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="date" label="日期" width="120" />
      <el-table-column prop="course_name" label="课程" min-width="160" />
      <el-table-column label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" effect="light">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="140" />
    </el-table>
    <el-empty v-if="!loading && !list.length" description="暂无考勤记录" />
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getMyAttendance } from '../../api';

const loading = ref(false);
const list = ref([]);

function statusType(s) {
  return { 出勤: 'success', 迟到: 'warning', 请假: 'info', 缺勤: 'danger' }[s] || 'info';
}

onMounted(async () => {
  loading.value = true;
  try {
    list.value = (await getMyAttendance()).data;
  } finally {
    loading.value = false;
  }
});
</script>
