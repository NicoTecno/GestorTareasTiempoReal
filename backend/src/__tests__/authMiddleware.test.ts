import { describe, it, expect, vi, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'

vi.mock('jsonwebtoken')

import { authenticateToken } from '../middlewares/authMiddleware.js'

describe('authenticateToken', () => {
  let req: any
  let res: any
  let next: ReturnType<typeof vi.fn>

  beforeEach(() => {
    req = { headers: {} }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
    next = vi.fn()
    vi.clearAllMocks()
  })

  it('retorna 401 cuando no hay header Authorization', () => {
    authenticateToken(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Acceso denegado' })
    expect(next).not.toHaveBeenCalled()
  })

  it('retorna 401 cuando el header no trae token', () => {
    req.headers['authorization'] = 'Bearer '
    authenticateToken(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('retorna 403 cuando el token es inválido', () => {
    req.headers['authorization'] = 'Bearer tokeninvalido'
    vi.mocked(jwt.verify).mockImplementation((_t, _s, cb: any) => {
      cb(new Error('invalid token'), null)
    })
    authenticateToken(req, res, next)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido o expirado' })
    expect(next).not.toHaveBeenCalled()
  })

  it('llama next() y setea req.user cuando el token es válido', () => {
    req.headers['authorization'] = 'Bearer tokenvalido'
    const mockUser = { id: 1, role: 'ADMIN', name: 'Test' }
    vi.mocked(jwt.verify).mockImplementation((_t, _s, cb: any) => {
      cb(null, mockUser)
    })
    authenticateToken(req, res, next)
    expect(next).toHaveBeenCalled()
    expect(req.user).toEqual(mockUser)
    expect(res.status).not.toHaveBeenCalled()
  })
})
