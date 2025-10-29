import  { Router } from 'express';
import upload from '../config/fileUpload.config';
import { uploadAndIndexDocument, deleteIndexedDocument } from '../controllers/upload.controller';

const router = Router();

router.post('/', upload.array('files'), uploadAndIndexDocument);
router.delete('/:fileName', deleteIndexedDocument);

export default router;