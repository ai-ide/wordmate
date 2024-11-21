import Router from '@koa/router';
import dictionaryRouter from './dictionary.js';

const router = new Router();

router.use(dictionaryRouter.routes());
router.use(dictionaryRouter.allowedMethods());

export default router; 