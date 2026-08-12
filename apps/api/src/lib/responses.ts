import type { Response } from 'express';

export function success<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ data });
}

export function created<T>(res: Response, data: T) {
  return res.status(201).json({ data });
}

export function noContent(res: Response) {
  return res.status(204).send();
}

export function error(
  res: Response,
  code: string,
  message: string,
  status = 400,
  details?: unknown
) {
  return res.status(status).json({
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  });
}
