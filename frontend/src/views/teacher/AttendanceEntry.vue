<template>
  <el-card shadow="never">
    <div class="toolbar">
      <el-select v-model="courseId" placeholder="选择课程" style="width: 240px" @change="loadStudents">
        <el-option v-for="c in courses" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <el-date-picker v-model="date" type="date" value-format="YYYY-MM-DD" placeholder="选择考勤日期" style="width: 180px" @change="loadStudents" />
    </div>

    <el-alert v-if="!courseId" type="info" :closable="false" show-icon title="请先选择课程和日期，然后标记每个学生的考勤状态" class="mb16" />

    <el-table :data="rows" v-loading="loading" stripe border max-height="560">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="student_no" label="学号" width="130" />
      <el-table-column prop="name" label="姓名" width="110" />
      <el-table-column prop="class_name" label="班级" min-width="170" />
      <el-table-column label="考勤状态" width="220">
        <template #default="{ row }">
          <el-radio-group v-model="row.status" :disabled="!courseId">
            <el-radio-button value="出勤">出勤</el-radio-button>
            <el-radio-button value="迟到">迟到</el-radio-button>
            <el-radio-button value="请假">请假</el-radio-button>
            <el-radio-button value="缺勤">缺勤</el-radio-button>
          </el-radio-group>
        </template>
      </el-table-column>
      <el-table-column label="备注">
        <template #default="{ row }">
          <el-input v-model="row.remark" size="small" placeholder="选填" :disabled="!courseId" />
        </template>
      </el-table-column>
    </el-table>

    <div class="footer">
      <el-button type="primary" :icon="Select" :disabled="!courseId || !date" :loading="saving" @click="saveAll">
        保存本日全部考勤
      </el-button>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Select } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
import { getMyCourses, getStudents, saveAttendance } from '../../api';

const route = useRoute();
const courses = ref([]);
const courseId = ref(null);
const date = ref(new Date().toISOString().slice(0, 10));
const rows = ref([]);
const loading = ref(false);
const saving = ref(false);

async function loadStudents() {
  if (!courseId.value) return;
  loading.value = true;
  try {
    const res = await getStudents({ page: 1, pageSize: 300 });
    rows.value = res.data.list.map((s) => ({ studentId: s.id, student_no: s.student_no, name: s.name, class_name: s.class_name, status: '出勤', remark: '' }));
  } finally {
    loading.value = false;
  }
}

async function saveAll() {
  saving.value = true;
  try {
    for (const r of rows.value) {
      await saveAttendance({ studentId: r.studentId, courseId: courseId.value, date: date.value, status: r.status, remark: r.remark });
    }
    ElMessage.success('考勤保存成功');
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
