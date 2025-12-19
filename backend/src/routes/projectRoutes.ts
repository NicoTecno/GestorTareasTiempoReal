import { Router } from 'express';
import { createProject } from '../controllers/projectController.js';

const router = Router();
router.post('/', createProject);
export default router;