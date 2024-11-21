import Router from '@koa/router';
import { getDictionary, getSuggestions } from '../controllers/dictionary.js';

const router = new Router();

router.get('/dictionary/:word', getDictionary);
router.get('/suggestions', getSuggestions);

export default router; 