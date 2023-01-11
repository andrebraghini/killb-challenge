export class HttpError extends Error {
  constructor(
    message?: string,
    public code = 'internal/unexpected-error',
    public http_status = 500,
    public details?: any
  ) {
    super(message);
  }
}

export class HttpNotFoundError extends HttpError {
  constructor(message = 'Resource not found', details?: unknown) {
    super(message, 'resource/not-found', 404, details);
  }
}

export class HttpBadRequestError extends HttpError {
  constructor(
    message = 'Bad request',
    code = 'request/bad-request',
    details?: unknown
  ) {
    super(message, code, 400, details);
  }
}
