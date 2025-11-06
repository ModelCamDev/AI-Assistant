import  { Router } from 'express';
import upload from '../config/fileUpload.config';
import { uploadAndIndexDocument, deleteIndexedDocument, getUploadedDocuments } from '../controllers/upload.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authMiddleware, upload.array('files'), uploadAndIndexDocument);
router.delete('/:fileName', authMiddleware, deleteIndexedDocument);
router.get('/all', authMiddleware, getUploadedDocuments);

export default router;