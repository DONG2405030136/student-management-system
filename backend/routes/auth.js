/**
 * 认证路由：登录、当前用户信息、修改密码
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { sign, auth } = require('../middleware/auth');

const router = express.Router();

// 登录
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.json({ code: 400, msg: '用户名和密码不能为空' });
  }
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || user.status !== 1) {
    return res.json({ code: 400, msg: '用户名不存在或账号已被禁用' });
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.json({ code: 400, msg: '密码错误' });
  }
  const token = sign({ id: user.id, username: user.username, role: user.role, name: user.name });
  res.json({
    code: 0,
    msg: '登录成功',
    data: {
      token,
      user: { id: user.id, username: user.username, name: user.name, role: user.role }
    }
  });
});

// 当前用户信息（含关联档案）
router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, username, name, role, status FROM users WHERE id=?').get(req.user.id);
  if (!user) return res.status(401).json({ code: 401, msg: '用户不存在' });

  let profile = null;
  if (user.role === 'student') {
    profile = db.prepare(
      `SELECT s.*, c.name AS class_name, c.major FROM students s
       LEFT JOIN classes c ON s.class_id = c.id
       WHERE s.user_id = ?`
    ).get(user.id);
  } else if (user.role === 'teacher') {
    profile = db.prepare('SELECT * FROM teachers WHERE user_id = ?').get(user.id);
  }
  res.json({ code: 0, data: { ...user, profile } });
});

// 修改密码
router.post('/change-password', auth, (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  if (!oldPassword || !newPassword) {
    return res.json({ code: 400, msg: '旧密码和新密码不能为空' });
  }
  if (newPassword.length < 6) {
    return res.json({ code: 400, msg: '新密码长度不能少于6位' });
  }
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id);
  if (!bcrypt.compareSync(oldPassword, user.password)) {
    return res.json({ code: 400, msg: '旧密码不正确' });
  }
  db.prepare('UPDATE users SET password=? WHERE id=?').run(bcrypt.hashSync(newPassword, 10), req.user.id);
  res.json({ code: 0, msg: '密码修改成功' });
});

module.exports = router;
