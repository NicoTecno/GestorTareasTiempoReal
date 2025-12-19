import { sql } from '../db.js';

export const TaskService = {
  async getAllWithDetails() {
    return await sql`
      SELECT t.*, u.name as assignee_name, p.name as project_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN projects p ON t.project_id = p.id
      ORDER BY t.created_at DESC
    `;
  },

  async create(data: { title: string, project_id: number, assigned_to?: number }) {
    const [task] = await sql`
      INSERT INTO tasks (title, project_id, assigned_to)
      VALUES (${data.title}, ${data.project_id}, ${data.assigned_to || null})
      RETURNING *
    `;
    return task;
  }
};