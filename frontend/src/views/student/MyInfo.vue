<template>
  <el-row :gutter="16">
    <el-col :span="8">
      <el-card shadow="never">
        <div class="profile-head">
          <el-avatar :size="72" class="big-avatar">{{ (info?.name || '学').slice(0, 1) }}</el-avatar>
          <h3>{{ info?.name }}</h3>
          <el-tag type="success" size="small">{{ info?.class_name || '未分班' }}</el-tag>
        </div>
        <el-descriptions :column="1" border class="mt16">
          <el-descriptions-item label="学号">{{ info?.student_no }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ info?.gender }}</el-descriptions-item>
          <el-descriptions-item label="出生日期">{{ info?.birth_date || '—' }}</el-descriptions-item>
          <el-descriptions-item label="入学年份">{{ info?.enroll_year || '—' }}</el-descriptions-item>
          <el-descriptions-item label="专业">{{ info?.major || '—' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ info?.phone || '—' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ info?.email || '—' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </el-col>
    <el-col :span="16">
      <el-card shadow="never">
        <template #header>
          <b>关于本系统</b>
        </template>
        <el-timeline>
          <el-timeline-item timestamp="2026年6月" type="primary" placement="top">
            <h4>期末考核项目：学生信息管理系统</h4>
            <p>使用豆包生成提示词、Trae CN 完成开发，前后端分离 + SQLite 数据库，全程本地部署。</p>
          </el-timeline-item>
          <el-timeline-item timestamp="功能说明" type="success" placement="top">
            <ul class="feature-list">
              <li>管理员：学生/班级/教师/课程/成绩/考勤/账号全量管理</li>
              <li>教师：我的课程、成绩录入、考勤录入</li>
              <li>学生：查看个人信息、成绩、考勤（当前角色）</li>
              <li>仪表盘：数据可视化统计（班级人数、性别分布、分数段、课程均分）</li>
            </ul>
          </el-timeline-item>
          <el-timeline-item timestamp="技术栈" type="warning" placement="top">
            <p>Vue 3 + Element Plus + ECharts ｜ Node.js + Express ｜ SQLite ｜ JWT 登录鉴权</p>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getMe } from '../../api';

const info = ref(null);

onMounted(async () => {
  const res = await getMe();
  info.value = res.data.profile;
});
</script>

<style scoped>
.profile-head { text-align: center; padding: 12px 0; }
.big-avatar { background: #1677ff; font-size: 30px; }
.mt16 { margin-top: 16px; }
.feature-list { padding-left: 18px; line-height: 2; color: #606266; }
</style>
