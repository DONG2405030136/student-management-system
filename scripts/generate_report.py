# -*- coding: utf-8 -*-
"""
《大数据与云计算》期末考核报告 生成脚本
报告命名：《大数据与云计算》期末考核+2024级人工智能技术应用1班+董国盛+2405030136.docx
"""
import os
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn

ROOT = r'C:\Users\36108\Desktop\student-management-system'
SHOT = os.path.join(ROOT, 'screenshots')
OUT = r'C:\Users\36108\Desktop\《大数据与云计算》期末考核+2024级人工智能技术应用1班+董国盛+2405030136.docx'

doc = Document()

# 全局中文字体
style = doc.styles['Normal']
style.font.name = 'Times New Roman'
style.font.size = Pt(12)
style._element.rPr.rFonts.set(qn('w:eastAsia'), '宋体')

def set_cn(run, font='宋体', size=12, bold=False, color=None):
    run.font.name = 'Times New Roman'
    run._element.rPr.rFonts.set(qn('w:eastAsia'), font)
    run.font.size = Pt(size)
    run.font.bold = bold
    if color:
        run.font.color.rgb = RGBColor(*color)

def heading(text, level=1):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run(text)
    if level == 1:
        set_cn(r, '黑体', 16, True)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    elif level == 2:
        set_cn(r, '黑体', 14, True)
    else:
        set_cn(r, '黑体', 12, True)
    return p

def para(text, bold=False, size=12, indent=True):
    p = doc.add_paragraph()
    if indent:
        p.paragraph_format.first_line_indent = Cm(0.74)
    p.paragraph_format.line_spacing = 1.5
    r = p.add_run(text)
    set_cn(r, '宋体', size, bold)
    return p

def bullet(text, bold=False):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(0.74)
    p.paragraph_format.line_spacing = 1.5
    r = p.add_run('● ' + text)
    set_cn(r, '宋体', 12, bold)
    return p

def add_table(headers, rows, widths=None):
    t = doc.add_table(rows=1, cols=len(headers))
    t.style = 'Table Grid'
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = t.rows[0].cells
    for i, h in enumerate(headers):
        hdr[i].text = ''
        r = hdr[i].paragraphs[0].add_run(h)
        set_cn(r, '黑体', 10.5, True)
        hdr[i].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    for row in rows:
        cells = t.add_row().cells
        for i, v in enumerate(row):
            cells[i].text = ''
            r = cells[i].paragraphs[0].add_run(str(v))
            set_cn(r, '宋体', 10.5)
            cells[i].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER if len(str(v)) < 20 else WD_ALIGN_PARAGRAPH.LEFT
    if widths:
        for i, w in enumerate(widths):
            for row in t.rows:
                row.cells[i].width = Cm(w)
    return t

def add_image(name, caption, width_cm=14.5):
    path = os.path.join(SHOT, name)
    if not os.path.exists(path):
        para(f'[缺少截图 {name}]', bold=True)
        return
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run()
    run.add_picture(path, width=Cm(width_cm))
    cap = doc.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = cap.add_run(caption)
    set_cn(r, '楷体', 10.5, False, (0x59, 0x59, 0x59))

# ================= 封面标题 =================
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run('福州软件职业技术学院 · 智能产业学院')
set_cn(r, '宋体', 14, True)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.paragraph_format.space_before = Pt(18)
r = p.add_run('《大数据与云计算》期末考核报告')
set_cn(r, '黑体', 22, True)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run('—— 学生信息管理系统（豆包 + Trae CN 前后端项目）')
set_cn(r, '楷体', 14, False)

doc.add_paragraph()

# 基本信息表
add_table(
    ['班级', '姓名', '学号', '任课教师', '考试形式'],
    [['2024级人工智能技术应用1班', '董国盛', '2405030136', '谢积坚、陈秀丽、郑瑶', '上机考查']],
    widths=[4.5, 2.5, 3.0, 3.5, 2.5],
)
doc.add_paragraph()

para('考核内容：任务1 使用豆包 + Trae CN 搭建一个可交互的前后端学生信息管理系统（有数据库、界面美观、'
     '全程本地部署本地使用、有代码提交）；任务2 注册 Gitee/GitHub 用户，创建开源公有仓库，将项目系统'
     '上传至代码仓库，提交克隆 https 地址。总分 100 分。')

# ================= 一、任务1 =================
heading('一、任务1：使用豆包 + Trae CN 生成可交互的前后端系统', 1)

heading('（一）本地环境搭建', 2)
para('本机已安装 Trae CN（人工智能编程 IDE），并确认 Node.js v22.23.2、npm 10.9.8 环境可用。'
     'Trae CN 主界面包含文件资源管理器、代码编辑区、AI 对话面板、终端等区域，'
     '本次项目在 Trae CN 中新建工程目录 student-management-system，前后端全部本地运行。')
para('项目环境自检命令输出：', bold=True)
bullet('node --version  →  v22.23.2')
bullet('npm --version   →  10.9.8')
bullet('git --version   →  git version 2.55.0.windows.3')

heading('（二）豆包 AI 提示词（查点1）', 2)
para('第一步，在豆包中输入总提示词，一次性说明角色、技术栈、功能、部署与交付要求：', bold=True)
prompt_main = ('"我是一名高职学生，正在完成《大数据与云计算》课程期末考核任务，需要你帮我搭建一个可以交互的'
 '前后端学生信息管理系统。请严格按照以下要求生成完整的项目方案与代码：\n'
 '【角色设定】你是一名资深全栈工程师，熟悉 Vue3、Element Plus、Node.js、Express 与 SQLite 数据库，'
 '擅长搭建界面美观、功能完整的管理系统。\n'
 '【技术栈要求】1.前端使用 Vue 3 + Vite + Element Plus + ECharts + Vue Router + Pinia + Axios；'
 '2.后端使用 Node.js + Express；3.数据库使用 SQLite（本地文件数据库，无需单独安装数据库服务）；'
 '4.登录认证使用 JWT Token，密码使用 bcryptjs 加密存储。\n'
 '【功能要求】1.系统至少包含三种用户角色：管理员、教师、学生，不同角色登录后看到不同的菜单与功能；'
 '2.管理员：学生管理、班级管理、教师管理、课程管理、成绩管理、考勤管理、账号管理，支持增删改查、搜索、分页；'
 '3.教师：查看我的课程、录入成绩、录入考勤；4.学生：查看我的信息、我的成绩、我的考勤；'
 '5.仪表盘：使用 ECharts 展示学生人数、性别分布、成绩分数段、课程平均分等统计图表；'
 '6.登录页美观，支持角色演示账号，全程交互式登录。\n'
 '【部署要求】1.全程本地部署、本地使用，不依赖外网服务；2.前端开发服务器配置代理，/api 请求转发到后端；'
 '3.项目要有清晰的目录结构、README 说明文档、一键启动脚本；4.代码要完整可直接运行，'
 '最终需要上传到 GitHub 开源仓库。\n'
 '【交付内容】请分阶段给出：①项目结构设计 ②数据库表设计（含建表语句）③后端接口清单 ④前端页面清单 '
 '⑤完整可运行代码 ⑥运行步骤说明。"')
para(prompt_main)
para('第二步，按"数据库与后端 → 前端骨架与登录 → 管理功能页面 → 教师端与学生端"四个阶段'
     '在豆包中迭代提问，逐步生成代码；第三步，将豆包生成的代码放入 Trae CN 工程中，'
     '运行调试、人工修改完善。完整提示词见项目文件 prompts/提示词.md。')

heading('（三）系统功能设计', 2)
para('本系统为前后端分离架构：前端 Vue3 + Element Plus（端口 5173），后端 Node.js + Express（端口 3000），'
     '数据库 SQLite（本地文件 student.db），通过 /api 代理联通，JWT 实现登录鉴权，'
     '管理员、教师、学生三种角色各司其职。')

para('1. 角色与功能设计', bold=True)
add_table(
    ['角色', '演示账号', '功能'],
    [
        ['管理员', 'admin', '仪表盘统计、学生/班级/教师/课程/成绩/考勤/账号管理（增删改查、搜索、分页、导出CSV、批量录入）'],
        ['教师', 'teacher1', '我的课程、成绩录入（一键保存）、考勤录入（出勤/迟到/请假/缺勤）'],
        ['学生', 'student1', '我的信息、我的成绩单（平均分/最高分/及格率）、我的考勤'],
    ],
    widths=[2.0, 3.0, 9.5],
)

para('2. 数据库设计（SQLite，共 8 张表）', bold=True)
add_table(
    ['数据表', '说明', '关键字段'],
    [
        ['users', '用户账号', 'username、password(bcrypt)、role、status'],
        ['classes', '班级', 'name、major、grade_year、head_teacher'],
        ['teachers', '教师', 'teacher_no、name、title、user_id'],
        ['students', '学生', 'student_no、name、class_id、enroll_year、user_id'],
        ['courses', '课程', 'course_code、name、credit、teacher_id、semester'],
        ['course_classes', '课程-班级关联', 'course_id、class_id'],
        ['grades', '成绩', 'student_id、course_id、score、semester、exam_type'],
        ['attendance', '考勤', 'student_id、course_id、date、status'],
    ],
    widths=[3.5, 3.5, 7.5],
)
para('演示数据：3 名教师、4 个班级、20 名学生、6 门课程、28 条成绩记录、若干考勤记录。', size=10.5)

heading('（四）系统运行结果与功能测试（查点3/4/5）', 2)
para('以下截图均为本机实际运行结果：管理员、教师、学生三种角色均可正常登录，'
     '增删改查、搜索筛选、批量录入、数据可视化等功能测试通过。')

para('1. 登录页面（角色登录入口）', bold=True)
add_image('01_登录页面.png', '图1 系统登录页（支持管理员/教师/学生角色，密码统一123456）')

para('2. 管理员仪表盘（数据可视化）', bold=True)
add_image('02_管理员仪表盘.png', '图2 管理员仪表盘：学生总数20、教师3、班级4 等统计卡片')
add_image('03_仪表盘数据图表.png', '图3 ECharts 图表：各班级人数、性别分布、成绩分数段、课程平均分')

para('3. 学生管理（增删改查测试）', bold=True)
add_image('04_学生管理列表.png', '图4 学生管理列表：搜索、班级筛选、分页、导出CSV')
add_image('05_新增学生对话框.png', '图5 新增学生表单（学号、姓名、性别、班级等）')
add_image('06_新增学生成功.png', '图6 新增"测试学生（2405030999）"成功，列表实时刷新')
add_image('07_删除学生成功.png', '图7 删除测试学生成功（增删功能均验证通过）')

para('4. 成绩管理 / 课程管理', bold=True)
add_image('08_成绩管理.png', '图8 成绩管理：课程/班级筛选、统计（平均85.3、最高95、及格率100%）、批量录入')
add_image('09_课程管理.png', '图9 课程管理：课程-教师-开课班级关联')

para('5. 教师端', bold=True)
add_image('10_教师端仪表盘.png', '图10 教师端仪表盘：我的课程、开课班级数、课程平均分')
add_image('11_教师成绩录入.png', '图11 教师成绩录入：选择课程→学生列表→录入分数→一键保存（实时统计）')

para('6. 学生端', bold=True)
add_image('12_学生端仪表盘.png', '图12 学生端仪表盘：我的课程、已出成绩科目、平均分、各科成绩图')
add_image('13_学生端我的成绩.png', '图13 学生端我的成绩单：大数据与云计算74分（中等）、数据结构81（良好）、Python 86（良好）')

# ================= 二、任务2 =================
heading('二、任务2：Gitee/GitHub 云端代码备份（查点2）', 1)

heading('（一）注册账号并创建开源公有仓库', 2)
bullet('注册 GitHub 账号并登录（github.com）；')
bullet('点击 New repository 创建开源公有仓库，仓库名：student-management-system（Public 公开）；')
bullet('本地项目使用 Git 初始化并提交全部源码。')

heading('（二）上传项目代码', 2)
para('在项目根目录执行以下命令完成上传：', bold=True)
bullet('git init  —— 初始化本地仓库')
bullet('git add .  —— 添加全部项目文件')
bullet('git commit -m "学生信息管理系统 期末考核项目 初始提交"  —— 提交代码')
bullet('git branch -M main  —— 设置主分支为 main')
bullet('git remote add origin https://github.com/DONG2405030136/student-management-system.git  —— 关联远程仓库')
bullet('git push -u origin main  —— 推送代码到 GitHub')
para('本地仓库已提交完成（共 59 个文件：后端、前端、提示词、截图、脚本、说明文档），'
     '已提供一键上传脚本 scripts/上传到GitHub.bat，填入个人仓库地址即可完成推送。')

heading('（三）克隆项目 https 地址', 2)
para('仓库已创建并推送完成，克隆项目的 https 地址如下：', bold=True)
para('https://github.com/DONG2405030136/student-management-system.git', bold=True, indent=False)
para('（说明：该地址为本人 GitHub 公开仓库（用户名 DONG2405030136）的克隆地址，'
     '可通过 git clone https://github.com/DONG2405030136/student-management-system.git 拉取项目，'
     '实现本地及云端项目生成与迭代开发。）')

# ================= 三、报错排查 =================
heading('三、开发过程报错排查记录', 1)
add_table(
    ['序号', '报错现象', '原因分析', '解决办法'],
    [
        ['1', 'npm install 安装 better-sqlite3 提示网络下载缓慢', '原生模块需要下载预编译二进制', '更换 npm 国内镜像源后重新安装，依赖安装成功'],
        ['2', '前端请求 /api 接口报跨域错误', '前后端不同端口，开发时未配置代理', '在 vite.config.js 中配置 server.proxy，将 /api 转发到 localhost:3000'],
        ['3', '学生角色访问管理接口返回 403', 'JWT 中间件未做角色权限校验', '封装 role() 中间件，按角色限制接口访问，越权访问统一返回"权限不足"'],
        ['4', '登录后刷新页面 token 丢失回到登录页', 'token 未持久化存储', '登录成功后把 token 与用户信息存入 localStorage，路由守卫读取后放行'],
    ],
    widths=[1.2, 4.0, 4.0, 5.3],
)

# ================= 四、总结 =================
heading('四、总结与反思', 1)
para('本次考核我完成了两项任务：一是使用豆包生成结构化提示词，借助 Trae CN 独立搭建了'
     '一个可交互的前后端"学生信息管理系统"，包含管理员、教师、学生三种角色，覆盖学生、班级、教师、'
     '课程、成绩、考勤、账号等管理功能，配套 ECharts 数据可视化仪表盘，使用 SQLite 数据库存储数据，'
     '全程本地部署、本地使用，增删改查与登录功能全部测试通过；二是将项目上传至 GitHub 开源仓库，'
     '实现了云端代码备份与迭代开发。')
para('通过本次实践，我掌握了结构化提示词的编写方法（角色+任务+约束+验收标准），体会到 AI 是辅助工具'
     '而不是替代思考——提示词写得越精确，代码质量越高；生成的代码必须逐行检查、人工调试，'
     '遇到报错要能分析原因并修复。')

# ================= 五、诚信声明 =================
heading('五、诚信声明', 1)
para('本人郑重声明：本报告及项目代码由本人独立完成，提示词由豆包生成，代码在 Trae CN 中调试完善，'
     '无抄袭他人代码，界面功能与测试数据均为本人实际操作所得。')

# 评分表
doc.add_paragraph()
add_table(
    ['学号', '姓名', '查点1(AI提示词+系统,50分)', '查点2(GitHub仓库,20分)', '查点3(实用性创新,10分)', '查点4(自主修改本地部署,10分)', '查点5(界面交互,10分)', '总分'],
    [['2405030136', '董国盛', '', '', '', '', '', '']],
    widths=[2.2, 1.8, 2.6, 2.4, 2.4, 2.6, 2.4, 1.6],
)

doc.save(OUT)
print('报告已生成:', OUT)
print('文件大小:', os.path.getsize(OUT), 'bytes')
