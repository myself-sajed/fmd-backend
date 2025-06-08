import { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncWrapper = (
    req: Request,
    res: Response,
    next: NextFunction,
    controller: RequestHandler,
) => controller(req, res, next) as unknown as RequestHandler;
