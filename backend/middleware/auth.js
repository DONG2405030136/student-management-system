/**
 * JWT 认证与角色权限中间件
 */
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'fzrj-student-management-2026';
const EXPIRES = '12h';

function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ code: 401, msg: '未登录或登录已过期' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ code: 401, msg: '登录状态无效，请重新登录' });
  }
}

/** 角色校验：roles 为允许的角色数组 */
function role(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ code: 403, msg: '权限不足，无法访问该功能' });
    }
    next();
  };
}

module.exports = { sign, auth, role, SECRET };
