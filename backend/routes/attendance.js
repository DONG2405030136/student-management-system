/**
 * 考勤管理路由
 */
const express = require('express');
const db = require('../db');
const { auth, role } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// 考勤列表（按课程/日期筛选）
router.get('/', role('admin', 'teacher'), (req, res) => {
  const courseId = req.query.courseId || '';
  const date = req.query.date || '';
  const keyword = (req.query.keyword || '').trim();

  let where = 'WHERE 1=1';
  const params = [];
  if (courseId) { where += ' AND a.course_id = ?'; params.push(courseId); }
  if (date) { where += ' AND a.date = ?'; params.push(date); }
  if (keyword) { where += ' AND (s.name LIKE ? OR s.student_no LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }

  const list = db.prepare(
    `SELECT a.*, s.name AS student_name, s.student_no, c.name AS course_name, cl.name AS class_name
     FROM attendance a
     JOIN students s ON a.student_id = s.id
     JOIN courses c ON a.course_id = c.id
     LEFT JOIN classes cl ON s.class_id = cl.id
     ${where}
     ORDER BY a.date DESC, a.id DESC LIMIT 500`
  ).all(...params);
  res.json({ code: 0, data: list });
});

// 打卡/录入考勤
router.post('/save', role('admin', 'teacher'), (req, res) => {
  const { studentId, courseId, date, status, remark } = req.body || {};
  if (!studentId || !courseId || !date || !status) {
    return res.json({ code: 400, msg: '参数不完整' });
  }
  const exists = db.prepare(
    'SELECT id FROM attendance WHERE student_id=? AND course_id=? AND date=?'
  ).get(studentId, courseId, date);
  if (exists) {
    db.prepare('UPDATE attendance SET status=?, remark=? WHERE id=?').run(status, remark || '', exists.id);
  } else {
    db.prepare('INSERT INTO attendance (student_id, course_id, date, status, remark) VALUES (?,?,?,?,?)')
      .run(studentId, courseId, date, status, remark || '');
  }
  res.json({ code: 0, msg: '考勤记录保存成功' });
});

// 删除考勤记录
router.delete('/:id', role('admin'), (req, res) => {
  db.prepare('DELETE FROM attendance WHERE id=?').run(req.params.id);
  res.json({ code: 0, msg: '删除成功' });
});

// 我的考勤（学生视角）
router.get('/mine', role('student'), (req, res) => {
  const student = db.prepare('SELECT id FROM students WHERE user_id=?').get(req.user.id);
  if (!student) return res.json({ code: 0, data: [] });
  const list = db.prepare(
    `SELECT a.*, c.name AS course_name FROM attendance a
     JOIN courses c ON a.course_id = c.id
     WHERE a.student_id = ? ORDER BY a.date DESC LIMIT 100`
  ).all(student.id);
  res.json({ code: 0, data: list });
});

module.exports = router;
