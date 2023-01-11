import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../../logger';
import { HttpBadRequestError } from './http.errors';

export function http_schema_handler(schema: Joi.Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const validation = schema.validate(req, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: true,
    });

    if (validation.error) {
      const { body, params, query } = req;
      logger.debug({ body, params, query });

      return next(
        new HttpBadRequestError(
          'Invalid request data',
          'request/validation-error',
          validation.error.details
        )
      );
    }

    Object.assign(req, validation.value);

    return next();
  };
}
