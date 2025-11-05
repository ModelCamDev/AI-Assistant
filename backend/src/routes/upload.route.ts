import  { Router } from 'express';
import upload from '../config/fileUpload.config';
import { uploadAndIndexDocument, deleteIndexedDocument } from '../controllers/upload.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authMiddleware, upload.array('files'), uploadAndIndexDocument);
router.delete('/:fileName', authMiddleware, deleteIndexedDocument);

export default router;