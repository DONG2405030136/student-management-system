/**
 * 仪表盘统计路由
 */
const express = require('express');
const db = require('../db');
const { auth, role } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// 管理员全局统计
router.get('/overview', role('admin'), (req, res) => {
  const students = db.prepare('SELECT COUNT(*) AS c FROM students').get().c;
  const teachers = db.prepare('SELECT COUNT(*) AS c FROM teachers').get().c;
  const classes = db.prepare('SELECT COUNT(*) AS c FROM classes').get().c;
  const courses = db.prepare('SELECT COUNT(*) AS c FROM courses').get().c;
  const grades = db.prepare('SELECT COUNT(*) AS c FROM grades').get().c;

  // 各班人数（柱状图）
  const classDist = db.prepare(
    `SELECT c.name AS name, COUNT(s.id) AS value FROM classes c
     LEFT JOIN students s ON s.class_id = c.id GROUP BY c.id`
  ).all();

  // 性别分布（饼图）
  const genderDist = db.prepare(
    'SELECT gender AS name, COUNT(*) AS value FROM students GROUP BY gender'
  ).all();

  // 成绩分数段分布
  const scoreDist = db.prepare(
    `SELECT
       SUM(CASE WHEN score >= 90 THEN 1 ELSE 0 END) AS excellent,
       SUM(CASE WHEN score >= 80 AND score < 90 THEN 1 ELSE 0 END) AS good,
       SUM(CASE WHEN score >= 70 AND score < 80 THEN 1 ELSE 0 END) AS medium,
       SUM(CASE WHEN score >= 60 AND score < 70 THEN 1 ELSE 0 END) AS pass,
       SUM(CASE WHEN score < 60 THEN 1 ELSE 0 END) AS fail
     FROM grades`
  ).get();

  // 各专业人数
  const majorDist = db.prepare(
    `SELECT c.major AS name, COUNT(s.id) AS value FROM classes c
     LEFT JOIN students s ON s.class_id = c.id GROUP BY c.major`
  ).all();

  // 课程平均分排行
  const courseAvg = db.prepare(
    `SELECT c.name AS name, ROUND(AVG(g.score),1) AS value FROM grades g
     JOIN courses c ON g.course_id = c.id GROUP BY c.id ORDER BY value DESC LIMIT 8`
  ).all();

  res.json({ code: 0, data: {
    counts: { students, teachers, classes, courses, grades },
    classDist, genderDist, scoreDist, majorDist, courseAvg
  }});
});

// 教师视角统计
router.get('/teacher', role('teacher'), (req, res) => {
  const teacher = db.prepare('SELECT id FROM teachers WHERE user_id=?').get(req.user.id);
  if (!teacher) return res.json({ code: 0, data: null });
  const tid = teacher.id;

  const myCourses = db.prepare('SELECT COUNT(*) AS c FROM courses WHERE teacher_id=?').get(tid).c;
  const myStudents = db.prepare(
    `SELECT COUNT(DISTINCT cc.class_id) AS c FROM course_classes cc WHERE cc.course_id IN
     (SELECT id FROM courses WHERE teacher_id=?)`
  ).get(tid).c;

  const courseAvg = db.prepare(
    `SELECT c.name AS name, ROUND(AVG(g.score),1) AS value FROM grades g
     JOIN courses c ON g.course_id = c.id WHERE c.teacher_id = ?
     GROUP BY c.id ORDER BY value DESC`
  ).all(tid);

  const statusDist = db.prepare(
    `SELECT a.status AS name, COUNT(*) AS value FROM attendance a
     WHERE a.course_id IN (SELECT id FROM courses WHERE teacher_id=?)
     GROUP BY a.status`
  ).all(tid);

  res.json({ code: 0, data: { myCourses, myStudents, courseAvg, statusDist } });
});

// 学生视角统计
router.get('/student', role('student'), (req, res) => {
  const student = db.prepare('SELECT id, name, class_id FROM students WHERE user_id=?').get(req.user.id);
  if (!student) return res.json({ code: 0, data: null });

  const myCourses = db.prepare(
    `SELECT COUNT(DISTINCT c.id) AS c FROM course_classes cc
     JOIN courses c ON cc.course_id = c.id WHERE cc.class_id = ?`
  ).get(student.class_id).c;
  const gradeCount = db.prepare('SELECT COUNT(*) AS c FROM grades WHERE student_id=?').get(student.id).c;
  const avgScore = db.prepare('SELECT ROUND(AVG(score),1) AS a FROM grades WHERE student_id=?').get(student.id).a || 0;
  const absents = db.prepare(
    `SELECT COUNT(*) AS c FROM attendance WHERE student_id=? AND status='缺勤'`
  ).get(student.id).c;

  // 各科成绩雷达/柱状
  const subjectScores = db.prepare(
    `SELECT c.name AS name, g.score AS value FROM grades g
     JOIN courses c ON g.course_id = c.id WHERE g.student_id=?`
  ).all(student.id);

  const attendanceDist = db.prepare(
    `SELECT status AS name, COUNT(*) AS value FROM attendance WHERE student_id=? GROUP BY status`
  ).all(student.id);

  res.json({ code: 0, data: { myCourses, gradeCount, avgScore, absents, subjectScores, attendanceDist } });
});

module.exports = router;
