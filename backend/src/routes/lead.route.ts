import {Router} from 'express';
import { filterLeadsByStatus, generateLead, getAllLeads, updateLeadStatus } from '../controllers/lead.controller';

const router = Router();

// Sample lead route
router.post('/', generateLead);
router.patch('/:id', updateLeadStatus);
router.get('/all', getAllLeads);
router.get('/filter/:status', filterLeadsByStatus);

export default router;
