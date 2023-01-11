import {
  NextFunction,
  Request,
  Response
} from 'express';
import { logger } from '../../logger';
import { HttpError } from './http.errors';

export function http_error_handler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error(err);

  if (err instanceof HttpError) {
    const { http_status, message, code, details } = err;
    return res
      .status(http_status)
      .send({
        code,
        ...(message && { message }),
        ...(details && { details })
      });
  }

  res
    .status(500)
    .send({
      code: 'internal/unexpected-error',
      message: 'Unexpected error'
    });
}
