import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'

export const validate = (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
  const { error } = schema.validate(req.body, { abortEarly: false })
  if (error) {
    const errors = error.details.map((detail) => detail.message)
    return res.status(400).json({ code: 'INVALID_INPUT', message: errors.join(', ') })
  }
  next()
}
