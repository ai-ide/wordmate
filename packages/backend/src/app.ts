import Koa from 'koa';
import Router from 'koa-router';
import { initDb } from './db';

const app = new Koa();
const router = new Router();

// Initialize database
initDb().catch(console.error);

// Basic health check endpoint
router.get('/health', async (ctx) => {
  ctx.body = { status: 'ok' };
});

app.use(router.routes()).use(router.allowedMethods());

export default app;
