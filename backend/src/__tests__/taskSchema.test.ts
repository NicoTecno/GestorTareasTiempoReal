import { describe, it, expect } from 'vitest'
import { createTaskSchema } from '../schemas/taskSchema.js'
import { TaskStatus, TaskPriority } from '../models/types.js'

describe('createTaskSchema', () => {
  it('valida una tarea válida con campos mínimos', () => {
    const result = createTaskSchema.safeParse({ title: 'Mi tarea' })
    expect(result.success).toBe(true)
  })

  it('asigna status TODO y priority MEDIUM por defecto', () => {
    const result = createTaskSchema.safeParse({ title: 'Tarea sin defaults' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe(TaskStatus.TODO)
      expect(result.data.priority).toBe(TaskPriority.MEDIUM)
    }
  })

  it('rechaza título con menos de 3 caracteres', () => {
    const result = createTaskSchema.safeParse({ title: 'ab' })
    expect(result.success).toBe(false)
  })

  it('rechaza cuando falta el título', () => {
    const result = createTaskSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rechaza un status inválido', () => {
    const result = createTaskSchema.safeParse({ title: 'Tarea', status: 'INVALIDO' })
    expect(result.success).toBe(false)
  })

  it('rechaza una priority inválida', () => {
    const result = createTaskSchema.safeParse({ title: 'Tarea', priority: 'URGENT' })
    expect(result.success).toBe(false)
  })

  it('acepta todos los campos opcionales', () => {
    const result = createTaskSchema.safeParse({
      title: 'Tarea completa',
      description: 'Una descripción',
      assigned_to: 5,
      project_id: 1,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
    })
    expect(result.success).toBe(true)
  })

  it('acepta título de exactamente 100 caracteres', () => {
    const result = createTaskSchema.safeParse({ title: 'a'.repeat(100) })
    expect(result.success).toBe(true)
  })

  it('rechaza título de más de 100 caracteres', () => {
    const result = createTaskSchema.safeParse({ title: 'a'.repeat(101) })
    expect(result.success).toBe(false)
  })
})
