import Router from '@koa/router';
import { getDictionary } from '../controllers/dictionary.js';

const router = new Router();

router.get('/dictionary/:word', getDictionary);

export default router; 