/**
 * 教师管理路由
 */
const express = require('express');
const db = require('../db');
const { auth, role } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// 教师列表（含任教课程数）
router.get('/', role('admin', 'teacher'), (req, res) => {
  const keyword = (req.query.keyword || '').trim();
  let where = 'WHERE 1=1';
  const params = [];
  if (keyword) {
    where += ' AND (t.name LIKE ? OR t.teacher_no LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  const list = db.prepare(
    `SELECT t.*, (SELECT COUNT(*) FROM courses c WHERE c.teacher_id = t.id) AS course_count
     FROM teachers t ${where} ORDER BY t.id`
  ).all(...params);
  res.json({ code: 0, data: list });
});

// 新增教师
router.post('/', role('admin'), (req, res) => {
  const { teacher_no, name, gender, title, phone, email } = req.body || {};
  if (!teacher_no || !name) return res.json({ code: 400, msg: '工号和姓名不能为空' });
  const exists = db.prepare('SELECT id FROM teachers WHERE teacher_no=?').get(teacher_no);
  if (exists) return res.json({ code: 400, msg: '该工号已存在' });
  db.prepare('INSERT INTO teachers (teacher_no, name, gender, title, phone, email) VALUES (?,?,?,?,?,?)')
    .run(teacher_no, name, gender || '男', title || '讲师', phone || '', email || '');
  res.json({ code: 0, msg: '新增成功' });
});

// 修改教师
router.put('/:id', role('admin'), (req, res) => {
  const { name, gender, title, phone, email } = req.body || {};
  db.prepare('UPDATE teachers SET name=?, gender=?, title=?, phone=?, email=? WHERE id=?')
    .run(name, gender || '男', title || '讲师', phone || '', email || '', req.params.id);
  res.json({ code: 0, msg: '修改成功' });
});

// 删除教师
router.delete('/:id', role('admin'), (req, res) => {
  const count = db.prepare('SELECT COUNT(*) AS c FROM courses WHERE teacher_id=?').get(req.params.id).c;
  if (count > 0) return res.json({ code: 400, msg: '该教师名下还有课程，无法删除' });
  db.prepare('DELETE FROM teachers WHERE id=?').run(req.params.id);
  res.json({ code: 0, msg: '删除成功' });
});

module.exports = router;
