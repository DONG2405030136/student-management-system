# 学生信息管理系统（Student Information Management System）

> 《大数据与云计算》期末考核项目 · 福州软件职业技术学院 2024 级人工智能技术应用
> 使用 豆包（Doubao）+ Trae CN 完成：AI 提示词生成 → Trae CN 本地开发 → 前后端分离 → SQLite 数据库 → 本地部署

## 一、项目简介

一个功能完整、可交互的前后端学生信息管理系统，支持**管理员、教师、学生**三种角色登录，
覆盖学生、班级、教师、课程、成绩、考勤、账号等管理功能，并带数据可视化仪表盘。

| 模块 | 技术 |
| --- | --- |
| 前端 | Vue 3 + Vite + Element Plus + ECharts + Vue Router + Pinia + Axios |
| 后端 | Node.js + Express |
| 数据库 | SQLite（better-sqlite3，本地文件数据库，无需安装数据库服务） |
| 认证 | JWT Token + bcryptjs 密码加密 |

## 二、演示账号（密码统一 123456）

| 角色 | 用户名 | 说明 |
| --- | --- | --- |
| 管理员 | admin | 全部管理功能 |
| 教师 | teacher1 / teacher2 / teacher3 | 我的课程、成绩录入、考勤录入 |
| 学生 | student1 ~ student5 | 我的信息、我的成绩、我的考勤 |

## 三、系统功能

### 管理员
- 仪表盘：学生/教师/班级/课程/成绩统计、各班级人数、性别分布、成绩分数段、课程均分（ECharts 图表）
- 学生管理：搜索、分页、新增/编辑/删除、导出 CSV
- 班级管理：新增/编辑/删除（有学生时禁止删除）
- 教师管理：新增/编辑/删除
- 课程管理：课程-教师-班级关联、新增/编辑/删除
- 成绩管理：按课程/班级筛选、成绩统计、批量录入
- 考勤管理：按课程/日期筛选、批量录入考勤
- 账号管理：新增账号、重置密码、启用/禁用、删除

### 教师
- 我的课程、成绩录入（一键保存）、考勤录入（出勤/迟到/请假/缺勤）

### 学生
- 我的信息、我的成绩单（含平均分/最高分/及格率）、我的考勤

## 四、目录结构

```
student-management-system/
├── backend/                 # 后端
│   ├── server.js            # 服务入口（端口 3000）
│   ├── db.js                # SQLite 建表 + 演示数据
│   ├── middleware/auth.js   # JWT 鉴权中间件
│   ├── routes/              # 业务路由
│   └── data/student.db      # SQLite 数据库文件（自动生成）
├── frontend/                # 前端
│   ├── src/views/           # 页面（admin/teacher/student 分角色）
│   └── vite.config.js       # 开发服务器（端口 5173，代理 /api）
├── prompts/提示词.md        # 豆包 AI 提示词（考试查点1）
├── screenshots/             # 系统运行截图（考试提交材料）
└── scripts/start.bat        # 一键启动脚本
```

## 五、本地运行

### 方式一：一键启动（推荐）

双击运行 `scripts/start.bat`，脚本会自动启动后端与前端，并打开浏览器。

### 方式二：手动启动

```bash
# 1. 启动后端（端口 3000）
cd backend
npm install
node server.js

# 2. 启动前端（端口 5173）
cd frontend
npm install
npm run dev
```

浏览器访问 http://localhost:5173 ，使用上方演示账号登录。

> 说明：首次启动后端会自动创建 `backend/data/student.db` 数据库并写入演示数据。
> 前端开发服务器已配置代理，`/api` 请求自动转发到后端 3000 端口，全程本地运行，不依赖外网服务。

## 六、环境要求

- Node.js ≥ 18（本项目开发环境 Node v22）
- 浏览器（Chrome / Edge 均可）

## 七、GitHub 上传（任务2）

1. 注册 GitHub（https://github.com）并登录；
2. 点击 New repository 创建**公开**仓库，仓库名如 `student-management-system`；
3. 在项目根目录打开终端，依次执行：

```bash
git init
git add .
git commit -m "学生信息管理系统 初始提交"
git branch -M main
git remote add origin https://github.com/你的用户名/student-management-system.git
git push -u origin main
```

4. 提交完成后，复制仓库的 `https` 克隆地址（如 `https://github.com/你的用户名/student-management-system.git`），写入考核报告。

> 也可以直接双击运行 `scripts/上传到GitHub.bat`，按提示输入仓库地址即可完成推送。

## 八、AI 提示词（考试查点1）

本项目使用的豆包提示词见 `prompts/提示词.md`，共分 4 个阶段（系统搭建 / 数据库设计 / 前端开发 / 测试完善），每个阶段都明确了角色、任务、约束与验收标准，可直接复制到 豆包 或 Trae CN 的 AI 对话框中迭代使用。

## 九、诚信声明

本项目为本人独立开发，提示词由豆包生成，代码在 Trae CN 中调试完善，全部功能本地部署、本地使用，无抄袭他人代码与测试数据。
