import Koa from 'koa';
import cors from '@koa/cors';
import { koaBody } from 'koa-body';
import Router from '@koa/router';

const app = new Koa();
const router = new Router();

// 基本的路由
router.get('/', (ctx) => {
  const timestamp = new Date().toLocaleString('zh-CN');
  console.log(`[${timestamp}] 收到来自前端的测试请求`);
  ctx.body = { message: 'WordMate API is running' };
});

// 中间件
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(koaBody());
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
