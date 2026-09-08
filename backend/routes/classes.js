/**
 * 班级管理路由
 */
const express = require('express');
const db = require('../db');
const { auth, role } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// 班级列表（含学生人数）
router.get('/', role('admin', 'teacher'), (req, res) => {
  const list = db.prepare(
    `SELECT c.*, (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id) AS student_count
     FROM classes c ORDER BY c.id`
  ).all();
  res.json({ code: 0, data: list });
});

// 新增班级
router.post('/', role('admin'), (req, res) => {
  const { name, major, grade_year, head_teacher } = req.body || {};
  if (!name) return res.json({ code: 400, msg: '班级名称不能为空' });
  db.prepare('INSERT INTO classes (name, major, grade_year, head_teacher) VALUES (?,?,?,?)')
    .run(name, major || '', grade_year || '', head_teacher || '');
  res.json({ code: 0, msg: '新增成功' });
});

// 修改班级
router.put('/:id', role('admin'), (req, res) => {
  const { name, major, grade_year, head_teacher } = req.body || {};
  db.prepare('UPDATE classes SET name=?, major=?, grade_year=?, head_teacher=? WHERE id=?')
    .run(name, major || '', grade_year || '', head_teacher || '', req.params.id);
  res.json({ code: 0, msg: '修改成功' });
});

// 删除班级（仅当班级无学生时允许）
router.delete('/:id', role('admin'), (req, res) => {
  const count = db.prepare('SELECT COUNT(*) AS c FROM students WHERE class_id=?').get(req.params.id).c;
  if (count > 0) return res.json({ code: 400, msg: '该班级下还有学生，无法删除' });
  db.prepare('DELETE FROM classes WHERE id=?').run(req.params.id);
  res.json({ code: 0, msg: '删除成功' });
});

module.exports = router;
