import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../db.js', () => ({ sql: vi.fn() }))

import { sql } from '../db.js'
import { getTasks, createTask, deleteTask, updateTaskStatus } from '../controllers/taskController.js'
import { TaskStatus, TaskPriority } from '../models/types.js'

describe('taskController', () => {
  let req: any
  let res: any

  beforeEach(() => {
    req = {
      user: {},
      body: {},
      params: {},
      io: { emit: vi.fn() },
    }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    }
    vi.clearAllMocks()
  })

  describe('getTasks', () => {
    it('ADMIN ve todas las tareas', async () => {
      const mockTasks = [{ id: 1, title: 'Tarea admin', assigned_name: 'Developer' }]
      vi.mocked(sql).mockResolvedValue(mockTasks)
      req.user = { id: 1, role: 'ADMIN' }
      await getTasks(req, res)
      expect(res.json).toHaveBeenCalledWith(mockTasks)
    })

    it('DEVELOPER solo ve sus tareas', async () => {
      const mockTasks = [{ id: 2, title: 'Mi tarea' }]
      vi.mocked(sql).mockResolvedValue(mockTasks)
      req.user = { id: 5, role: 'DEVELOPER' }
      await getTasks(req, res)
      expect(res.json).toHaveBeenCalledWith(mockTasks)
    })

    it('retorna 500 en error de base de datos', async () => {
      vi.mocked(sql).mockRejectedValue(new Error('DB error'))
      req.user = { id: 1, role: 'ADMIN' }
      await getTasks(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al obtener tareas' })
    })
  })

  describe('createTask', () => {
    it('crea una tarea sin asignado y emite el evento', async () => {
      const mockTask = { id: 1, title: 'Nueva tarea', status: 'TODO', priority: 'MEDIUM' }
      vi.mocked(sql).mockResolvedValue([mockTask])
      req.body = { title: 'Nueva tarea', priority: TaskPriority.MEDIUM }
      await createTask(req, res)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(mockTask)
      expect(req.io.emit).toHaveBeenCalledWith('task:created', { ...mockTask, assigned_name: null })
    })

    it('crea una tarea con asignado y emite el nombre', async () => {
      const mockTask = { id: 2, title: 'Tarea asignada', status: 'TODO', priority: 'HIGH' }
      const mockUser = { name: 'Developer A' }
      vi.mocked(sql)
        .mockResolvedValueOnce([mockTask])
        .mockResolvedValueOnce([mockUser])
      req.body = { title: 'Tarea asignada', assigned_to: 3, priority: TaskPriority.HIGH }
      await createTask(req, res)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(req.io.emit).toHaveBeenCalledWith('task:created', { ...mockTask, assigned_name: 'Developer A' })
    })

    it('retorna 400 con datos inválidos (Zod)', async () => {
      req.body = { title: 'ab' } // título muy corto
      await createTask(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Datos inválidos' })
      )
      expect(sql).not.toHaveBeenCalled()
    })

    it('retorna 400 cuando falta el título', async () => {
      req.body = { priority: TaskPriority.LOW }
      await createTask(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('retorna 500 en error de base de datos', async () => {
      vi.mocked(sql).mockRejectedValue(new Error('DB error'))
      req.body = { title: 'Tarea válida', priority: TaskPriority.LOW }
      await createTask(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('deleteTask', () => {
    it('elimina la tarea y emite el evento', async () => {
      vi.mocked(sql).mockResolvedValue([])
      req.params = { id: '1' }
      await deleteTask(req, res)
      expect(req.io.emit).toHaveBeenCalledWith('task:deleted', '1')
      expect(res.status).toHaveBeenCalledWith(204)
      expect(res.send).toHaveBeenCalled()
    })

    it('retorna 500 en error de base de datos', async () => {
      vi.mocked(sql).mockRejectedValue(new Error('DB error'))
      req.params = { id: '99' }
      await deleteTask(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'No se pudo eliminar la tarea' })
    })
  })

  describe('updateTaskStatus', () => {
    it('actualiza el status y emite el evento', async () => {
      const updatedTask = { id: 1, title: 'Tarea', status: TaskStatus.DONE }
      vi.mocked(sql).mockResolvedValue([updatedTask])
      req.params = { id: '1' }
      req.body = { status: TaskStatus.DONE }
      await updateTaskStatus(req, res)
      expect(req.io.emit).toHaveBeenCalledWith('task:updated', updatedTask)
      expect(res.json).toHaveBeenCalledWith(updatedTask)
    })

    it('retorna 500 en error de base de datos', async () => {
      vi.mocked(sql).mockRejectedValue(new Error('DB error'))
      req.params = { id: '1' }
      req.body = { status: TaskStatus.IN_PROGRESS }
      await updateTaskStatus(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al actualizar' })
    })
  })
})
