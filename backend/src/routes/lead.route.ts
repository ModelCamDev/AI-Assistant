import {Router} from 'express';

const router = Router();

// Sample lead route
router.post('/', (req, res) => {
    res.send('lead route is working!');
});

export default router;
