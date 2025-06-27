import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Config } from "../../../config/index";

declare module "express-serve-static-core" {
    interface Request {
        auth?: JwtPayload;
        tokenError?: boolean;
    }
}

export default function selfAuthenticate(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const authHeader = req.headers.authorization;
    const token: string | undefined =
        (authHeader?.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : undefined) ||
        (typeof req.cookies?.accessToken === "string"
            ? req.cookies.accessToken
            : undefined);

    if (!token) {
        req.tokenError = true;
        return next();
    }

    try {
        const decoded = jwt.verify(
            token,
            Config.JWT_ACCESS_SECRET!,
        ) as JwtPayload;
        req.auth = decoded;
        return next();
    } catch (err) {
        req.tokenError = true;
        return next(); // Don't block here — controller will handle
    }
}
