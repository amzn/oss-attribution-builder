import { NextFunction } from 'express';

export function globalCustomMiddleware(
  req: Express.Request,
  res: Express.Response,
  next: NextFunction
) {
  // override here with anything you please; this will never have "real" logic in it.
  // this is a suitable location to add in request timing/logging, rate limiting, etc.
  next();
}
