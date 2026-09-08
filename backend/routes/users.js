/**
 * 用户管理路由（管理员管理登录账号）
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { auth, role } = require('../middleware/auth');

const router = express.Router();
router.use(auth, role('admin'));

// 用户列表
router.get('/', (req, res) => {
  const keyword = (req.query.keyword || '').trim();
  let where = 'WHERE 1=1';
  const params = [];
  if (keyword) {
    where += ' AND (u.username LIKE ? OR u.name LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  const list = db.prepare(
    `SELECT id, username, name, role, status, created_at FROM users u ${where} ORDER BY u.id`
  ).all(...params);
  res.json({ code: 0, data: list });
});

// 新增账号（可同时指定关联角色档案）
router.post('/', (req, res) => {
  const { username, password, name, role: r, studentId, teacherId } = req.body || {};
  if (!username || !password || !name || !r) return res.json({ code: 400, msg: '参数不完整' });
  if (!['admin', 'teacher', 'student'].includes(r)) return res.json({ code: 400, msg: '角色不合法' });
  const exists = db.prepare('SELECT id FROM users WHERE username=?').get(username);
  if (exists) return res.json({ code: 400, msg: '用户名已存在' });

  const info = db.prepare('INSERT INTO users (username, password, name, role) VALUES (?,?,?,?)')
    .run(username, bcrypt.hashSync(password, 10), name, r);
  if (studentId) db.prepare('UPDATE students SET user_id=? WHERE id=?').run(info.lastInsertRowid, studentId);
  if (teacherId) db.prepare('UPDATE teachers SET user_id=? WHERE id=?').run(info.lastInsertRowid, teacherId);
  res.json({ code: 0, msg: '账号创建成功' });
});

// 重置密码
router.post('/:id/reset-password', (req, res) => {
  const pwd = (req.body && req.body.password) || '123456';
  db.prepare('UPDATE users SET password=? WHERE id=?').run(bcrypt.hashSync(pwd, 10), req.params.id);
  res.json({ code: 0, msg: `密码已重置为 ${pwd}` });
});

// 启用/禁用账号
router.put('/:id/status', (req, res) => {
  const { status } = req.body || {};
  if (req.params.id == req.user.id) return res.json({ code: 400, msg: '不能禁用当前登录账号' });
  db.prepare('UPDATE users SET status=? WHERE id=?').run(status ? 1 : 0, req.params.id);
  res.json({ code: 0, msg: status ? '账号已启用' : '账号已禁用' });
});

// 删除账号
router.delete('/:id', (req, res) => {
  if (req.params.id == req.user.id) return res.json({ code: 400, msg: '不能删除当前登录账号' });
  db.prepare('UPDATE students SET user_id=NULL WHERE user_id=?').run(req.params.id);
  db.prepare('UPDATE teachers SET user_id=NULL WHERE user_id=?').run(req.params.id);
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
  res.json({ code: 0, msg: '删除成功' });
});

module.exports = router;
