import { Router } from 'express';
import { getTasks, createTask, updateTaskStatus, deleteTask } from '../controllers/taskController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id', updateTaskStatus); // Ruta para cambiar estado
router.delete('/:id', deleteTask);

export default router;