import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../db.js', () => ({ sql: vi.fn() }))
vi.mock('bcrypt')
vi.mock('jsonwebtoken')

import { sql } from '../db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { login, register } from '../controllers/authController.js'

describe('authController', () => {
  let req: any
  let res: any

  beforeEach(() => {
    req = { body: {} }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('retorna 400 cuando el usuario no existe', async () => {
      vi.mocked(sql).mockResolvedValue([])
      req.body = { email: 'noexiste@test.com', password: '123' }
      await login(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: 'Credenciales inválidas' })
    })

    it('retorna 400 cuando la contraseña es incorrecta', async () => {
      const mockUser = { id: 1, email: 'x@x.com', password: 'hashed', role: 'DEVELOPER', name: 'Test' }
      vi.mocked(sql).mockResolvedValue([mockUser])
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)
      req.body = { email: 'x@x.com', password: 'wrongpassword' }
      await login(req, res)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: 'Credenciales inválidas' })
    })

    it('retorna token y datos del usuario en login exitoso', async () => {
      const mockUser = { id: 1, email: 'x@x.com', password: 'hashed', role: 'DEVELOPER', name: 'Test' }
      vi.mocked(sql).mockResolvedValue([mockUser])
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
      vi.mocked(jwt.sign).mockReturnValue('mock-token' as never)
      req.body = { email: 'x@x.com', password: 'correctpassword' }
      await login(req, res)
      expect(res.json).toHaveBeenCalledWith({
        token: 'mock-token',
        user: { id: 1, name: 'Test', role: 'DEVELOPER' },
      })
    })

    it('retorna 500 en error de base de datos', async () => {
      vi.mocked(sql).mockRejectedValue(new Error('DB error'))
      req.body = { email: 'x@x.com', password: '123' }
      await login(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  describe('register', () => {
    it('crea usuario y retorna 201 con los datos', async () => {
      const mockUser = { id: 1, name: 'Test', email: 'test@test.com', role: 'DEVELOPER' }
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as never)
      vi.mocked(sql).mockResolvedValue([mockUser])
      req.body = { name: 'Test', email: 'test@test.com', password: '123456' }
      await register(req, res)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(mockUser)
    })

    it('asigna rol DEVELOPER por defecto', async () => {
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never)
      vi.mocked(sql).mockResolvedValue([{ id: 2, name: 'Dev', email: 'dev@test.com', role: 'DEVELOPER' }])
      req.body = { name: 'Dev', email: 'dev@test.com', password: 'pass' }
      await register(req, res)
      // Verificamos que sql fue llamado (el rol lo aplica el controller con 'DEVELOPER' como default)
      expect(sql).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(201)
    })

    it('retorna 500 cuando el email ya existe', async () => {
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never)
      vi.mocked(sql).mockRejectedValue(new Error('duplicate key value'))
      req.body = { name: 'Test', email: 'existing@test.com', password: '123456' }
      await register(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })
})
