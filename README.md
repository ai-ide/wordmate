# WordMate

一个使用 Vue 3 + Koa.js + TypeScript 构建的全栈应用。

## 技术栈

### 前端
- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia (状态管理)

### 后端
- Koa.js
- TypeScript
- SQLite
- TypeORM

## 开发环境要求

- Node.js 16+
- pnpm 8+

## 项目设置

在项目根目录下执行：

```bash
pnpm install
```

## 开发

在项目根目录下执行：

```bash
pnpm dev
```

这将同时启动：
- 前端服务器 (http://localhost:3000)
- 后端服务器 (http://localhost:3001)

## 项目结构

```
.
├── packages/           # Monorepo 工作空间
│   ├── client/        # 前端项目
│   │   ├── src/      # 源代码
│   │   ├── public/   # 静态资源
│   │   └── vite.config.ts
│   │
│   └── server/       # 后端项目
│       ├── src/      # 源代码
│       ├── controllers/
│       ├── models/
│       └── routes/
│
├── pnpm-workspace.yaml # 工作空间配置
└── package.json       # 根项目配置
```

## 开发指南

1. 前端开发
   - 服务运行在 http://localhost:3000
   - 修改 `packages/client/src` 下的文件进行开发
   - 支持热重载

2. 后端开发
   - 服务运行在 http://localhost:3001
   - 修改 `packages/server/src` 下的文件进行开发
   - 支持热重载
   - 使用 ESLint 进行代码检查：`pnpm lint`
   - 使用 Prettier 格式化代码：`pnpm format`

## 常用命令

所有命令都在项目根目录下执行：

- `pnpm dev`: 启动所有开发服务器
- `pnpm build`: 构建所有项目
- `pnpm lint`: 运行所有项目的代码检查
- `pnpm format`: 格式化所有项目的代码
