import {Router} from 'express';
import { chatWithAgent, demoChat, generateTTS, resumeChat, voiceChatWithAgent } from '../controllers/chat.controller';
import { upload } from '../config/audio.multer.config';

const router = Router();

router.post('/', chatWithAgent);
router.post('/voice', upload.single('audio'), voiceChatWithAgent)
router.post('/tts', generateTTS);
router.post('/demo', demoChat);
router.post('/resume', resumeChat)
export default router;