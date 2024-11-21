import Koa from 'koa';
import cors from '@koa/cors';
import { PORT } from './config/index.js';
import router from './routes/index.js';

const app = new Koa();

app.use(cors());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
