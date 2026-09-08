/**
 * 成绩管理路由
 */
const express = require('express');
const db = require('../db');
const { auth, role } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// 成绩列表（可按课程/班级/关键字筛选）
router.get('/', role('admin', 'teacher'), (req, res) => {
  const courseId = req.query.courseId || '';
  const classId = req.query.classId || '';
  const keyword = (req.query.keyword || '').trim();
  const semester = req.query.semester || '2025-2026-2';

  let where = 'WHERE g.semester = ?';
  const params = [semester];
  if (courseId) { where += ' AND g.course_id = ?'; params.push(courseId); }
  if (classId) { where += ' AND s.class_id = ?'; params.push(classId); }
  if (keyword) { where += ' AND (s.name LIKE ? OR s.student_no LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }

  const list = db.prepare(
    `SELECT g.*, s.name AS student_name, s.student_no, c.name AS course_name, cl.name AS class_name,
       t.name AS teacher_name
     FROM grades g
     JOIN students s ON g.student_id = s.id
     JOIN courses c ON g.course_id = c.id
     LEFT JOIN classes cl ON s.class_id = cl.id
     LEFT JOIN teachers t ON c.teacher_id = t.id
     ${where}
     ORDER BY g.id DESC LIMIT 500`
  ).all(...params);
  res.json({ code: 0, data: list });
});

// 录入/更新成绩（批量）
router.post('/save', role('admin', 'teacher'), (req, res) => {
  const { studentId, courseId, score, semester, examType, comment } = req.body || {};
  if (!studentId || !courseId) return res.json({ code: 400, msg: '参数不完整' });
  const s = parseFloat(score);
  if (isNaN(s) || s < 0 || s > 100) return res.json({ code: 400, msg: '成绩必须在0-100之间' });

  const exists = db.prepare(
    'SELECT id FROM grades WHERE student_id=? AND course_id=? AND semester=? AND exam_type=?'
  ).get(studentId, courseId, semester || '2025-2026-2', examType || '期末');
  if (exists) {
    db.prepare('UPDATE grades SET score=?, comment=? WHERE id=?').run(s, comment || '', exists.id);
  } else {
    db.prepare('INSERT INTO grades (student_id, course_id, score, semester, exam_type, comment) VALUES (?,?,?,?,?,?)')
      .run(studentId, courseId, s, semester || '2025-2026-2', examType || '期末', comment || '');
  }
  res.json({ code: 0, msg: '成绩保存成功' });
});

// 批量导入成绩
router.post('/batch', role('admin', 'teacher'), (req, res) => {
  const { courseId, items, semester } = req.body || {};
  if (!courseId || !Array.isArray(items) || items.length === 0) {
    return res.json({ code: 400, msg: '参数不完整' });
  }
  const upsert = db.prepare(
    `INSERT INTO grades (student_id, course_id, score, semester, exam_type, comment) VALUES (?,?,?,?,?,?)
     ON CONFLICT DO NOTHING`
  );
  const tx = db.transaction(() => {
    items.forEach((it) => {
      const s = parseFloat(it.score);
      if (isNaN(s) || s < 0 || s > 100) return;
      const exists = db.prepare(
        'SELECT id FROM grades WHERE student_id=? AND course_id=? AND semester=?'
      ).get(it.studentId, courseId, semester || '2025-2026-2');
      if (exists) {
        db.prepare('UPDATE grades SET score=? WHERE id=?').run(s, exists.id);
      } else {
        upsert.run(it.studentId, courseId, s, semester || '2025-2026-2', '期末', '');
      }
    });
  });
  tx();
  res.json({ code: 0, msg: `成功处理 ${items.length} 条成绩` });
});

// 成绩统计（平均分/最高/最低/及格率）
router.get('/stats', role('admin', 'teacher'), (req, res) => {
  const courseId = req.query.courseId || '';
  const where = courseId ? 'WHERE course_id = ?' : '';
  const params = courseId ? [courseId] : [];
  const row = db.prepare(
    `SELECT COUNT(*) AS cnt, ROUND(AVG(score),1) AS avg_score, MAX(score) AS max_score,
       MIN(score) AS min_score,
       ROUND(100.0 * SUM(CASE WHEN score >= 60 THEN 1 ELSE 0 END) / COUNT(*), 1) AS pass_rate
     FROM grades ${where}`
  ).get(...params);
  res.json({ code: 0, data: row });
});

// 学生个人成绩（学生视角）
router.get('/mine', role('student'), (req, res) => {
  const student = db.prepare('SELECT id FROM students WHERE user_id=?').get(req.user.id);
  if (!student) return res.json({ code: 0, data: [] });
  const list = db.prepare(
    `SELECT g.*, c.name AS course_name, c.credit, c.course_code, t.name AS teacher_name
     FROM grades g JOIN courses c ON g.course_id = c.id
     LEFT JOIN teachers t ON c.teacher_id = t.id
     WHERE g.student_id = ? ORDER BY g.id DESC`
  ).all(student.id);
  res.json({ code: 0, data: list });
});

module.exports = router;
