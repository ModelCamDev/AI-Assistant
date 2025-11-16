import {Router} from 'express';
import { chatWithAgent, demoChat, generateTTS, voiceChatWithAgent } from '../controllers/chat.controller';
import { upload } from '../config/audio.multer.config';
import { graph } from '../llm/DemoFlow';
import { Command } from '@langchain/langgraph';

const router = Router();

router.post('/', chatWithAgent);
router.post('/voice', upload.single('audio'), voiceChatWithAgent)
router.post('/tts', generateTTS);
router.post('/demo', demoChat);
export default router;