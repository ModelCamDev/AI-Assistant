import  { Router } from 'express';
import upload from '../config/fileUpload.config';
import { uploadController } from '../controllers/upload.controller';

const router = Router();

router.post('/', upload.array('files'), uploadController);
export default router;