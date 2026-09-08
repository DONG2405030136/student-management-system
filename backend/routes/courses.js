/**
 * 课程管理路由
 */
const express = require('express');
const db = require('../db');
const { auth, role } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// 课程列表
router.get('/', role('admin', 'teacher'), (req, res) => {
  const keyword = (req.query.keyword || '').trim();
  const teacherId = req.query.teacherId || '';
  let where = 'WHERE 1=1';
  const params = [];
  if (keyword) {
    where += ' AND (c.name LIKE ? OR c.course_code LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (teacherId) {
    where += ' AND c.teacher_id = ?';
    params.push(teacherId);
  }
  const list = db.prepare(
    `SELECT c.*, t.name AS teacher_name,
       (SELECT GROUP_CONCAT(cl.name, '、') FROM course_classes cc
        JOIN classes cl ON cc.class_id = cl.id WHERE cc.course_id = c.id) AS class_names
     FROM courses c LEFT JOIN teachers t ON c.teacher_id = t.id
     ${where} ORDER BY c.id`
  ).all(...params);
  res.json({ code: 0, data: list });
});

// 新增课程
router.post('/', role('admin'), (req, res) => {
  const { course_code, name, credit, hours, teacher_id, semester } = req.body || {};
  if (!course_code || !name) return res.json({ code: 400, msg: '课程代码和课程名称不能为空' });
  const exists = db.prepare('SELECT id FROM courses WHERE course_code=?').get(course_code);
  if (exists) return res.json({ code: 400, msg: '该课程代码已存在' });
  db.prepare('INSERT INTO courses (course_code, name, credit, hours, teacher_id, semester) VALUES (?,?,?,?,?,?)')
    .run(course_code, name, credit || 2, hours || 32, teacher_id || null, semester || '2025-2026-2');
  res.json({ code: 0, msg: '新增成功' });
});

// 修改课程
router.put('/:id', role('admin'), (req, res) => {
  const { name, credit, hours, teacher_id, semester } = req.body || {};
  db.prepare('UPDATE courses SET name=?, credit=?, hours=?, teacher_id=?, semester=? WHERE id=?')
    .run(name, credit || 2, hours || 32, teacher_id || null, semester || '2025-2026-2', req.params.id);
  res.json({ code: 0, msg: '修改成功' });
});

// 删除课程
router.delete('/:id', role('admin'), (req, res) => {
  db.prepare('DELETE FROM course_classes WHERE course_id=?').run(req.params.id);
  db.prepare('DELETE FROM grades WHERE course_id=?').run(req.params.id);
  db.prepare('DELETE FROM attendance WHERE course_id=?').run(req.params.id);
  db.prepare('DELETE FROM courses WHERE id=?').run(req.params.id);
  res.json({ code: 0, msg: '删除成功' });
});

// 设置课程的开课班级
router.post('/:id/classes', role('admin'), (req, res) => {
  const { classIds } = req.body || {};
  if (!Array.isArray(classIds)) return res.json({ code: 400, msg: '参数错误' });
  const del = db.prepare('DELETE FROM course_classes WHERE course_id=?');
  const ins = db.prepare('INSERT INTO course_classes (course_id, class_id) VALUES (?,?)');
  const tx = db.transaction(() => {
    del.run(req.params.id);
    classIds.forEach((cid) => ins.run(req.params.id, cid));
  });
  tx();
  res.json({ code: 0, msg: '开课班级设置成功' });
});

// 我的课程（教师视角：自己教的课程）
router.get('/my', role('teacher'), (req, res) => {
  const teacher = db.prepare('SELECT id FROM teachers WHERE user_id=?').get(req.user.id);
  if (!teacher) return res.json({ code: 0, data: [] });
  const list = db.prepare(
    `SELECT c.*, t.name AS teacher_name FROM courses c
     LEFT JOIN teachers t ON c.teacher_id = t.id
     WHERE c.teacher_id = ? ORDER BY c.id`
  ).all(teacher.id);
  res.json({ code: 0, data: list });
});

module.exports = router;
