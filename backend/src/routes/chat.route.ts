import {Router} from 'express';
import { chatWithAgent, generateTTS, voiceChatWithAgent } from '../controllers/chat.controller';
import { upload } from '../config/audio.multer.config';

const router = Router();

router.post('/', chatWithAgent);
router.post('/voice', upload.single('audio'), voiceChatWithAgent)
router.post('/tts', generateTTS);

export default router;