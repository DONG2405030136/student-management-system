/**
 * 学生管理路由（管理员管理学生档案，教师可查看）
 */
const express = require('express');
const db = require('../db');
const { auth, role } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// 学生列表（分页 + 搜索）
router.get('/', role('admin', 'teacher'), (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 10));
  const keyword = (req.query.keyword || '').trim();
  const classId = req.query.classId || '';

  let where = 'WHERE 1=1';
  const params = [];
  if (keyword) {
    where += ' AND (s.name LIKE ? OR s.student_no LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (classId) {
    where += ' AND s.class_id = ?';
    params.push(classId);
  }

  const total = db.prepare(`SELECT COUNT(*) AS c FROM students s ${where}`).get(...params).c;
  const list = db.prepare(
    `SELECT s.*, c.name AS class_name, c.major FROM students s
     LEFT JOIN classes c ON s.class_id = c.id
     ${where}
     ORDER BY s.id DESC
     LIMIT ? OFFSET ?`
  ).all(...params, pageSize, (page - 1) * pageSize);

  res.json({ code: 0, data: { list, total, page, pageSize } });
});

// 学生详情
router.get('/:id', role('admin', 'teacher'), (req, res) => {
  const row = db.prepare(
    `SELECT s.*, c.name AS class_name, c.major FROM students s
     LEFT JOIN classes c ON s.class_id = c.id WHERE s.id=?`
  ).get(req.params.id);
  if (!row) return res.status(404).json({ code: 404, msg: '学生不存在' });
  res.json({ code: 0, data: row });
});

// 新增学生
router.post('/', role('admin'), (req, res) => {
  const { student_no, name, gender, birth_date, phone, email, class_id, enroll_year } = req.body || {};
  if (!student_no || !name) return res.json({ code: 400, msg: '学号和姓名不能为空' });
  const exists = db.prepare('SELECT id FROM students WHERE student_no=?').get(student_no);
  if (exists) return res.json({ code: 400, msg: '该学号已存在' });

  const info = db.prepare(
    `INSERT INTO students (student_no, name, gender, birth_date, phone, email, class_id, enroll_year)
     VALUES (?,?,?,?,?,?,?,?)`
  ).run(student_no, name, gender || '男', birth_date || '', phone || '', email || '', class_id || null, enroll_year || '');
  res.json({ code: 0, msg: '新增成功', data: { id: info.lastInsertRowid } });
});

// 修改学生
router.put('/:id', role('admin'), (req, res) => {
  const row = db.prepare('SELECT * FROM students WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ code: 404, msg: '学生不存在' });
  const { name, gender, birth_date, phone, email, class_id, enroll_year, status } = req.body || {};
  db.prepare(
    `UPDATE students SET name=?, gender=?, birth_date=?, phone=?, email=?, class_id=?, enroll_year=?, status=?
     WHERE id=?`
  ).run(name || row.name, gender || row.gender, birth_date ?? row.birth_date, phone ?? row.phone,
    email ?? row.email, class_id ?? row.class_id, enroll_year ?? row.enroll_year,
    status ?? 1, req.params.id);
  res.json({ code: 0, msg: '修改成功' });
});

// 删除学生
router.delete('/:id', role('admin'), (req, res) => {
  const row = db.prepare('SELECT * FROM students WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ code: 404, msg: '学生不存在' });
  db.prepare('DELETE FROM students WHERE id=?').run(req.params.id);
  res.json({ code: 0, msg: '删除成功' });
});

module.exports = router;
