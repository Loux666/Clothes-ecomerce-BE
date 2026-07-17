import { NextFunction, Request, RequestHandler, Response } from 'express';

export const asyncHandler = <T extends RequestHandler>(handler: T): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
};