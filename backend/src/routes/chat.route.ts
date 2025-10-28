import {Router} from 'express';
import { chatWithAgent } from '../controllers/chat.controller';

const router = Router();

router.post('/', chatWithAgent);

export default router;