import {Router} from 'express';
import { chatWithAgent, voiceChatWithAgent } from '../controllers/chat.controller';
import { upload } from '../config/audio.multer.config';

const router = Router();

router.post('/', chatWithAgent);
router.post('/voice', upload.single('audio'), voiceChatWithAgent)

export default router;