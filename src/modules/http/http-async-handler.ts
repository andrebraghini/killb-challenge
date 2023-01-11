import { NextFunction, Request, Response } from 'express';

export function http_async_handler(fn: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
}
