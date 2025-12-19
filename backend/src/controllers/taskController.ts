import { Request, Response } from 'express';
import { sql } from '../db.js';
import { Task } from '../models/types.js'; // Importamos la entidad

import { createTaskSchema } from '../schemas/taskSchema.js';
import { ZodError } from 'zod'; // Importante importar esto arriba  

// export const getTasks = async (_req: Request, res: Response) => {
//   try {
//     // Le pasamos <Task[]> para que TS sepa que 'tasks' es un array de tareas
//     const tasks = await sql<Task[]>`
//       SELECT t.*, u.name as assignee_name 
//       FROM tasks t 
//       LEFT JOIN users u ON t.assigned_to = u.id
//       ORDER BY t.created_at DESC
//     `;
    
//     // Si intentás hacer tasks[0].precio, TS te va a dar error porque 'precio' no existe en Task
//     res.json(tasks);
//   } catch (error) {
//     res.status(500).json({ error: "Error al obtener tareas" });
//   }
// };

export const getTasks = async (req: any, res: Response) => {
  try {
    const { id, role } = req.user; // Datos que el middleware sacó del token

    let tasks;

    if (role === 'ADMIN') {
      // El Admin ve TODO y además queremos saber el nombre de quién la tiene asignada
      tasks = await sql`
        SELECT t.*, u.name as assigned_name 
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        ORDER BY t.id DESC
      `;
    } else {
      // El Developer SOLO ve lo que tiene su ID
      tasks = await sql`
        SELECT * FROM tasks 
        WHERE assigned_to = ${id} 
        ORDER BY id DESC
      `;
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tareas" });
  }
};

// Crear una tarea y emitir evento por WebSockets
// export const createTask = async (req: any, res: Response) => {
//   const { title, description, assigned_to, project_id } = req.body;
//   try {
//     const [newTask] = await sql`
//       INSERT INTO tasks (title, description, assigned_to, project_id)
//       VALUES (${title}, ${description}, ${assigned_to || null}, ${project_id || null})
//       RETURNING *
//     `;

//     // 🔥 Emitir a todos los conectados
//     req.io.emit('task:created', newTask);

//     res.status(201).json(newTask);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error al crear la tarea" });
//   }
// };
// export const createTask = async (req: any, res: Response) => {
//   try {
//     const validatedData = createTaskSchema.parse(req.body);
//     const { title, description, assigned_to, project_id, status, priority } = validatedData;

//     const [newTask] = await sql`
//       INSERT INTO tasks (title, description, assigned_to, project_id, status, priority)
//       VALUES (${title}, ${description || null}, ${assigned_to || null}, ${project_id || null}, ${status}, ${priority})
//       RETURNING *
//     `;

//     req.io.emit('task:created', newTask);
//     res.status(201).json(newTask);
    
//   } catch (error: any) {
//     // 🛡️ Forma ultra segura de chequear si es un error de Zod
//     if (error instanceof ZodError) {
//       return res.status(400).json({ 
//         error: "Datos inválidos", 
//         // Zod tiene un método llamado .format() o .flatten() que es más amigable
//         details: error.flatten().fieldErrors 
//       });
//     }
    
//     console.error("🔥 Error inesperado:", error);
//     res.status(500).json({ error: "Error interno del servidor" });
//   }
// };

export const createTask = async (req: any, res: Response) => {
  try {
    const validatedData = createTaskSchema.parse(req.body);
    const { title, description, assigned_to, project_id, status, priority } = validatedData;

    // 1. Insertamos la tarea con tus validaciones
    const [newTask] = await sql`
      INSERT INTO tasks (title, description, assigned_to, project_id, status, priority)
      VALUES (${title}, ${description || null}, ${assigned_to || null}, ${project_id || null}, ${status || 'TODO'}, ${priority})
      RETURNING *
    `;

    // 2. ⚡ Buscamos el nombre del asignado para que el socket lleve la info completa
    let assigned_name = null;
    if (assigned_to) {
      const [user] = await sql`SELECT name FROM users WHERE id = ${assigned_to}`;
      assigned_name = user?.name;
    }

    // 3. Emitimos el objeto completo (incluyendo el nombre para el Admin)
    req.io.emit('task:created', { ...newTask, assigned_name });

    res.status(201).json(newTask);
    
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        error: "Datos inválidos", 
        details: error.flatten().fieldErrors 
      });
    }
    
    console.error("🔥 Error inesperado:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// export const deleteTask = async (req: any, res: Response) => {
//   const { id } = req.params;
//   await sql`DELETE FROM tasks WHERE id = ${id}`;
  
//   // Avisamos a todos que esta ID ya no existe
//   req.io.emit('task:deleted', id); 
//   res.status(204).send();
// };
export const deleteTask = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    // 1. Borramos de la base de datos Neon
    await sql`DELETE FROM tasks WHERE id = ${id}`;

    // 2. EMITIMOS el evento para que todas las pestañas se enteren
    req.io.emit('task:deleted', id);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "No se pudo eliminar la tarea" });
  }
};

// Actualizar el estado (útil para el tablero Kanban que haremos)
export const updateTaskStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [updatedTask] = await sql`
      UPDATE tasks 
      SET status = ${status} 
      WHERE id = ${id} 
      RETURNING *
    `;

    // ¡ESTA ES LA CLAVE! Avisamos a todos del cambio
    req.io.emit('task:updated', updatedTask);

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar" });
  }
};