/**
 * 数据库初始化模块
 * 使用 SQLite（better-sqlite3），数据库文件位于 backend/data/student.db
 * 首次启动自动建表并写入演示数据
 */
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'student.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/** 建表 */
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      status INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      major TEXT NOT NULL DEFAULT '',
      grade_year TEXT NOT NULL DEFAULT '',
      head_teacher TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_no TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      gender TEXT DEFAULT '男',
      title TEXT DEFAULT '讲师',
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      user_id INTEGER,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_no TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      gender TEXT DEFAULT '男',
      birth_date TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      class_id INTEGER,
      enroll_year TEXT DEFAULT '',
      user_id INTEGER,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      credit REAL DEFAULT 2,
      hours INTEGER DEFAULT 32,
      teacher_id INTEGER,
      semester TEXT DEFAULT '2025-2026-2',
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS course_classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      class_id INTEGER NOT NULL,
      UNIQUE(course_id, class_id)
    );

    CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      score REAL NOT NULL,
      semester TEXT DEFAULT '2025-2026-2',
      exam_type TEXT DEFAULT '期末',
      comment TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT '出勤',
      remark TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
  `);
}

/** 写入演示数据 */
function seed() {
  const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (userCount > 0) return;

  const hash = bcrypt.hashSync('123456', 10);
  const tx = db.transaction(() => {
    // 账号
    const insUser = db.prepare(
      'INSERT INTO users (username, password, name, role) VALUES (?,?,?,?)'
    );
    const adminId = insUser.run('admin', hash, '系统管理员', 'admin').lastInsertRowid;
    const t1Id = insUser.run('teacher1', hash, '陈秀丽', 'teacher').lastInsertRowid;
    const t2Id = insUser.run('teacher2', hash, '谢积坚', 'teacher').lastInsertRowid;
    const t3Id = insUser.run('teacher3', hash, '郑瑶', 'teacher').lastInsertRowid;

    // 班级
    const insClass = db.prepare(
      'INSERT INTO classes (name, major, grade_year, head_teacher) VALUES (?,?,?,?)'
    );
    const c1 = insClass.run('2024级人工智能技术应用1班', '人工智能技术应用', '2024', '陈秀丽').lastInsertRowid;
    const c2 = insClass.run('2024级人工智能技术应用2班', '人工智能技术应用', '2024', '谢积坚').lastInsertRowid;
    const c3 = insClass.run('2024级大数据技术1班', '大数据技术', '2024', '郑瑶').lastInsertRowid;
    const c4 = insClass.run('2024级软件技术1班', '软件技术', '2024', '陈秀丽').lastInsertRowid;

    // 教师档案
    const insTeacher = db.prepare(
      'INSERT INTO teachers (teacher_no, name, gender, title, phone, email, user_id) VALUES (?,?,?,?,?,?,?)'
    );
    insTeacher.run('T2024001', '陈秀丽', '女', '副教授', '13800000001', 'chenxl@fzrj.edu.cn', t1Id);
    insTeacher.run('T2024002', '谢积坚', '男', '讲师', '13800000002', 'xiejj@fzrj.edu.cn', t2Id);
    insTeacher.run('T2024003', '郑瑶', '女', '讲师', '13800000003', 'zhengy@fzrj.edu.cn', t3Id);

    // 学生档案（每个班级若干）
    const insStudent = db.prepare(
      `INSERT INTO students (student_no, name, gender, birth_date, phone, email, class_id, enroll_year, user_id)
       VALUES (?,?,?,?,?,?,?,?,?)`
    );
    const s1 = insStudent.run('2405030136', '董国盛', '男', '2006-03-15', '13900000001', 'dgs@stu.fzrj.edu.cn', c1, '2024', 0).lastInsertRowid;
    const s2 = insStudent.run('2405030101', '林志明', '男', '2006-05-20', '13900000002', 'lzm@stu.fzrj.edu.cn', c1, '2024', 0).lastInsertRowid;
    const s3 = insStudent.run('2405030102', '陈晓彤', '女', '2006-08-12', '13900000003', 'cxt@stu.fzrj.edu.cn', c1, '2024', 0).lastInsertRowid;
    const s4 = insStudent.run('2405030103', '王浩宇', '男', '2005-11-02', '13900000004', 'why@stu.fzrj.edu.cn', c1, '2024', 0).lastInsertRowid;
    const s5 = insStudent.run('2405030104', '李佳怡', '女', '2006-01-25', '13900000005', 'ljy@stu.fzrj.edu.cn', c1, '2024', 0).lastInsertRowid;
    const s6 = insStudent.run('2405030105', '张伟', '男', '2005-09-18', '13900000006', 'zw@stu.fzrj.edu.cn', c1, '2024', 0).lastInsertRowid;
    const s7 = insStudent.run('2405030201', '刘思雨', '女', '2006-04-07', '13900000007', 'lsy@stu.fzrj.edu.cn', c2, '2024', 0).lastInsertRowid;
    const s8 = insStudent.run('2405030202', '陈凯', '男', '2005-12-30', '13900000008', 'ck@stu.fzrj.edu.cn', c2, '2024', 0).lastInsertRowid;
    const s9 = insStudent.run('2405030203', '杨雪', '女', '2006-06-22', '13900000009', 'yx@stu.fzrj.edu.cn', c2, '2024', 0).lastInsertRowid;
    const s10 = insStudent.run('2405030204', '吴俊杰', '男', '2006-02-14', '13900000010', 'wjj@stu.fzrj.edu.cn', c2, '2024', 0).lastInsertRowid;
    const s11 = insStudent.run('2405030205', '黄雨欣', '女', '2005-10-05', '13900000011', 'hyx@stu.fzrj.edu.cn', c2, '2024', 0).lastInsertRowid;
    const s12 = insStudent.run('2405030301', '林海涛', '男', '2006-07-11', '13900000012', 'lht@stu.fzrj.edu.cn', c3, '2024', 0).lastInsertRowid;
    const s13 = insStudent.run('2405030302', '郑晓薇', '女', '2005-08-28', '13900000013', 'zxw@stu.fzrj.edu.cn', c3, '2024', 0).lastInsertRowid;
    const s14 = insStudent.run('2405030303', '苏志强', '男', '2006-03-03', '13900000014', 'szq@stu.fzrj.edu.cn', c3, '2024', 0).lastInsertRowid;
    const s15 = insStudent.run('2405030401', '周雅婷', '女', '2006-09-16', '13900000015', 'zyt@stu.fzrj.edu.cn', c4, '2024', 0).lastInsertRowid;
    const s16 = insStudent.run('2405030402', '许文博', '男', '2005-12-08', '13900000016', 'xwb@stu.fzrj.edu.cn', c4, '2024', 0).lastInsertRowid;
    const s17 = insStudent.run('2405030403', '马俊豪', '男', '2006-05-27', '13900000017', 'mjh@stu.fzrj.edu.cn', c4, '2024', 0).lastInsertRowid;
    const s18 = insStudent.run('2405030404', '孙梦琪', '女', '2006-10-19', '13900000018', 'smq@stu.fzrj.edu.cn', c4, '2024', 0).lastInsertRowid;
    const s19 = insStudent.run('2405030405', '何子轩', '男', '2006-01-09', '13900000019', 'hzx@stu.fzrj.edu.cn', c4, '2024', 0).lastInsertRowid;
    const s20 = insStudent.run('2405030406', '罗欣怡', '女', '2006-11-23', '13900000020', 'lxy@stu.fzrj.edu.cn', c4, '2024', 0).lastInsertRowid;

    // 学生账号（student1~student5 可登录体验）
    const sUser1 = insUser.run('student1', hash, '董国盛', 'student').lastInsertRowid;
    const sUser2 = insUser.run('student2', hash, '林志明', 'student').lastInsertRowid;
    const sUser3 = insUser.run('student3', hash, '陈晓彤', 'student').lastInsertRowid;
    const sUser4 = insUser.run('student4', hash, '王浩宇', 'student').lastInsertRowid;
    const sUser5 = insUser.run('student5', hash, '李佳怡', 'student').lastInsertRowid;
    db.prepare('UPDATE students SET user_id=? WHERE id=?').run(sUser1, s1);
    db.prepare('UPDATE students SET user_id=? WHERE id=?').run(sUser2, s2);
    db.prepare('UPDATE students SET user_id=? WHERE id=?').run(sUser3, s3);
    db.prepare('UPDATE students SET user_id=? WHERE id=?').run(sUser4, s4);
    db.prepare('UPDATE students SET user_id=? WHERE id=?').run(sUser5, s5);

    // 课程
    const insCourse = db.prepare(
      'INSERT INTO courses (course_code, name, credit, hours, teacher_id, semester) VALUES (?,?,?,?,?,?)'
    );
    const co1 = insCourse.run('AI101', 'Python程序设计', 4, 64, 1, '2025-2026-2').lastInsertRowid;
    const co2 = insCourse.run('AI102', '数据结构与算法', 3, 48, 2, '2025-2026-2').lastInsertRowid;
    const co3 = insCourse.run('AI103', '大数据与云计算', 3, 48, 2, '2025-2026-2').lastInsertRowid;
    const co4 = insCourse.run('AI104', '机器学习基础', 3, 48, 3, '2025-2026-2').lastInsertRowid;
    const co5 = insCourse.run('AI105', '数据库原理与应用', 3, 48, 1, '2025-2026-2').lastInsertRowid;
    const co6 = insCourse.run('AI106', 'Web前端开发', 3, 48, 3, '2025-2026-2').lastInsertRowid;

    // 课程-班级关联
    const insCC = db.prepare('INSERT INTO course_classes (course_id, class_id) VALUES (?,?)');
    insCC.run(co1, c1); insCC.run(co1, c2);
    insCC.run(co2, c1); insCC.run(co2, c2);
    insCC.run(co3, c1); insCC.run(co3, c2); insCC.run(co3, c3);
    insCC.run(co4, c1); insCC.run(co4, c2);
    insCC.run(co5, c1); insCC.run(co5, c3); insCC.run(co5, c4);
    insCC.run(co6, c2); insCC.run(co6, c3);

    // 成绩
    const insGrade = db.prepare(
      'INSERT INTO grades (student_id, course_id, score, semester, exam_type, comment) VALUES (?,?,?,?,?,?)'
    );
    const stuInC1 = [s1, s2, s3, s4, s5, s6];
    const seedScores = [[86,92,78,95,88,76],[81,79,90,84,93,88],[74,88,85,79,91,82]];
    stuInC1.forEach((sid, i) => {
      seedScores.forEach((scores, j) => {
        insGrade.run(sid, co1 + j, scores[i % scores.length] + (i * 0), '2025-2026-2', '期末', '');
      });
    });
    // 让部分学生成绩更丰富
    [s7, s8, s9, s10, s11].forEach((sid, i) => {
      insGrade.run(sid, co1, 88 + i, '2025-2026-2', '期末', '');
      insGrade.run(sid, co3, 78 + i * 2, '2025-2026-2', '期末', '');
    });

    // 考勤（本周）
    const insAtt = db.prepare(
      'INSERT INTO attendance (student_id, course_id, date, status, remark) VALUES (?,?,?,?,?)'
    );
    const dates = ['2026-06-01', '2026-06-03', '2026-06-05'];
    const statuses = ['出勤', '出勤', '迟到', '请假', '缺勤'];
    stuInC1.forEach((sid, i) => {
      dates.forEach((d, j) => {
        insAtt.run(sid, co1, d, statuses[(i + j) % 5], '');
      });
    });
  });

  tx();
  console.log('✔ 数据库初始化完成，已写入演示数据');
}

initSchema();
seed();

module.exports = db;
