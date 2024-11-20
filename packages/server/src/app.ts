import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import { DataSource } from 'typeorm';

const app = new Koa();
const router = new Router();

// 数据库连接配置
export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  logging: true,
  entities: ["src/models/**/*.ts"],
  subscribers: [],
  migrations: [],
});

// 初始化数据库连接
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });

// 中间件
app.use(bodyParser());

// 路由
router.get('/', async (ctx) => {
  ctx.body = { message: 'Welcome to WordMate API' };
});

// 使用路由
app.use(router.routes()).use(router.allowedMethods());

// 启动服务器
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
