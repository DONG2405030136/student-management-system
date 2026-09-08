/**
 * 学生信息管理系统 - 后端服务入口
 * 学生信息管理系统（Student Management System）
 * 技术栈：Node.js + Express + SQLite + JWT
 * 启动：node server.js（默认端口 3000）
 */
const express = require('express');
const cors = require('cors');
const path = require('path');

require('./db'); // 初始化数据库

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 简易请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString('zh-CN')}] ${req.method} ${req.originalUrl}`);
  next();
});

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/grades', require('./routes/grades'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/users', require('./routes/users'));
app.use('/api/stats', require('./routes/stats'));

// 健康检查
app.get('/api/health', (req, res) => res.json({ code: 0, msg: 'ok', time: new Date().toLocaleString('zh-CN') }));

// 404 处理
app.use((req, res) => res.status(404).json({ code: 404, msg: '接口不存在' }));

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务异常：', err.message);
  res.status(500).json({ code: 500, msg: '服务器内部错误：' + err.message });
});

app.listen(PORT, () => {
  console.log('============================================');
  console.log('  学生信息管理系统后端服务已启动');
  console.log(`  接口地址: http://localhost:${PORT}/api`);
  console.log('  默认账号: admin / 123456（管理员）');
  console.log('           teacher1 / 123456（教师）');
  console.log('           student1 / 123456（学生）');
  console.log('============================================');
});
