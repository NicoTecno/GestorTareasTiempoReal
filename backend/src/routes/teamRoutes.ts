import { Router } from 'express';
import { createTeam, getTeams } from '../controllers/teamController.js';

const router = Router();
router.post('/', createTeam);
router.get('/', getTeams);
export default router;