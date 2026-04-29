# Roleplay Writing Room

多人回合制语 C 写作工具（项目骨架）

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制示例文件并填入你的 Supabase 项目信息：

```bash
cp .env.local.example .env.local
```

打开 `.env.local`，填写：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> 在 [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API 里找到这两个值。

### 3. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

---

## 连接 Supabase

1. 前往 [https://supabase.com](https://supabase.com) 注册并创建新项目
2. 进入项目 → **Project Settings → API**
3. 复制 **Project URL** 和 **anon public** key
4. 粘贴到 `.env.local`（本地）或 Vercel 环境变量（生产）

---

## 部署到 Vercel

### 第一步：Push 代码到 GitHub

```bash
git init
git add .
git commit -m "chore: init project skeleton"
git branch -M main
git remote add origin https://github.com/你的用户名/roleplay-writing-app.git
git push -u origin main
```

### 第二步：在 Vercel 导入项目

1. 打开 [https://vercel.com](https://vercel.com) 并登录
2. 点击 **Add New → Project**
3. 选择 **Import Git Repository**，找到 `roleplay-writing-app`
4. 点击 **Import**

### 第三步：添加环境变量

在 Vercel 导入页面（或之后在 **Project Settings → Environment Variables**）：

| 变量名 | 值 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 Supabase anon key |

选择 Environment：勾选 **Production**、**Preview**、**Development** 三个。

### 第四步：部署

点击 **Deploy**，等待构建完成，Vercel 会给你一个公开 URL。

---

## 项目结构

```
roleplay-writing-app/
├── app/
│   ├── layout.tsx        # 根 layout
│   ├── page.tsx          # 首页
│   └── globals.css       # 全局样式
├── lib/
│   └── supabase/
│       └── client.ts     # Supabase browser client
├── .env.local.example    # 环境变量模板（可提交）
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 技术栈

- [Next.js 15](https://nextjs.org/) — App Router
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase JS](https://supabase.com/docs/reference/javascript)
- [Vercel](https://vercel.com/) — 部署平台
