import { z } from 'zod';
import { TaskStatus, TaskPriority } from '../models/types.js';

// Definimos qué campos son obligatorios y qué formato deben tener
export const createTaskSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres").max(100),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).optional().default(TaskPriority.MEDIUM),
  assigned_to: z.number().nullable().optional(),
  project_id: z.number().nullable().optional(),
});

// Esto sirve para que TypeScript también conozca el tipo generado por Zod
export type CreateTaskInput = z.infer<typeof createTaskSchema>;