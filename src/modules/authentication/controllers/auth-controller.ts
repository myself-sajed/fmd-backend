import { NextFunction, Response } from "express";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";
import { CredentialManagerService } from "../services/cred-manager-service";
import { TokenService } from "../services/token-service";
import { RequestWithAuthInfo, RequestWithUserInfo } from "../types/auth-types";
import { UserService } from "../services/user-service";
import { Config } from "../../../config/index";
import jwt from "jsonwebtoken";

export default class AuthController {
    constructor(
        private userservice: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialManagerService,
    ) {}

    async register(
        req: RequestWithUserInfo,
        res: Response,
        next: NextFunction,
    ) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { name, email, password, role, photoURL } = req.body;
        try {
            const user = await this.userservice.create({
                name,
                email,
                password,
                role,
                photoURL,
            });

            const payload: JwtPayload = {
                sub: String(user._id),
                role: user.role,
                name: user.name,
                email: user.email,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const refreshTokenRecord =
                await this.tokenService.saveRefreshTokenRecord(user);
            const refreshToken = refreshTokenRecord.token;

            this.tokenService.setCookie(
                res,
                "accessToken",
                accessToken,
                15 * 60 * 1000,
            ); // 15m
            this.tokenService.setCookie(
                res,
                "refreshToken",
                refreshToken,
                7 * 24 * 60 * 60 * 1000,
            ); // 7d

            this.logger.info("User registration successful", { id: user._id });
            res.status(201).json({ status: "success", user });
        } catch (error) {
            next(error);
        }
    }

    async login(req: RequestWithUserInfo, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { email, password } = req.body;
        try {
            const user = await this.userservice.findByEmail(email);
            if (!user) return next(createHttpError(401, "Invalid credentials"));

            const isPasswordMatched =
                await this.credentialService.comparePasswords(
                    password,
                    user.password,
                );
            if (!isPasswordMatched)
                return next(createHttpError(401, "Invalid credentials"));

            const payload: JwtPayload = {
                sub: String(user._id),
                role: user.role,
                name: user.name,
                email: user.email,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);
            const refreshTokenRecord =
                await this.tokenService.saveRefreshTokenRecord(user);
            const refreshToken = refreshTokenRecord.token;

            this.tokenService.setCookie(
                res,
                "accessToken",
                accessToken,
                15 * 60 * 1000,
            );
            this.tokenService.setCookie(
                res,
                "refreshToken",
                refreshToken,
                7 * 24 * 60 * 60 * 1000,
            );

            this.logger.info("User login successful", { id: user._id });
            res.json({ status: "success", user });
        } catch (error) {
            next(error);
        }
    }

    async self(req: RequestWithAuthInfo, res: Response, next: NextFunction) {
        if (req.tokenError) {
            // fallback to refresh token
            const refreshToken = req.cookies?.refreshToken as
                | string
                | undefined;
            if (!refreshToken) {
                this.tokenService.clearAuthCookies(res);
                return res
                    .status(401)
                    .json({ error: "Session expired. Please log in again." });
            }

            try {
                const payload = jwt.verify(
                    refreshToken,
                    Config.JWT_REFRESH_SECRET!,
                ) as JwtPayload;

                // Set req.auth manually from refresh token payload
                req.auth = payload as {
                    sub: string;
                    name: string;
                    email: string;
                    role: string;
                    id?: string;
                };

                return await this.refresh(req, res, next); // Use updated auth
            } catch (err) {
                this.tokenService.clearAuthCookies(res);
                return res
                    .status(403)
                    .json({ error: "Invalid or expired refresh token." });
            }
        }

        try {
            const user = await this.userservice.findById(String(req.auth.sub));
            if (!user) return res.status(404).json({ error: "User not found" });
            res.json({ ...user, password: undefined });
        } catch (err) {
            next(err);
        }
    }

    async refresh(req: RequestWithAuthInfo, res: Response, next: NextFunction) {
        try {
            const payload: JwtPayload = {
                sub: req.auth.sub,
                role: req.auth.role,
                name: req.auth.name,
                email: req.auth.email,
            };

            const user = await this.userservice.findById(String(req.auth.sub));
            if (!user) return next(createHttpError(400, "Invalid user"));

            const accessToken = this.tokenService.generateAccessToken(payload);
            const refreshTokenRecord =
                await this.tokenService.saveRefreshTokenRecord(user);

            // Optionally: revoke old refresh token if passed in req.auth.id
            if (req.auth.id)
                await this.tokenService.deleteRefreshToken(req.auth.id);

            const refreshToken = refreshTokenRecord.token;

            this.tokenService.setCookie(
                res,
                "accessToken",
                accessToken,
                15 * 60 * 1000,
            );
            this.tokenService.setCookie(
                res,
                "refreshToken",
                refreshToken,
                7 * 24 * 60 * 60 * 1000,
            );

            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }

    async logout(req: RequestWithAuthInfo, res: Response, next: NextFunction) {
        try {
            if (req.auth.id) {
                await this.tokenService.deleteRefreshToken(req.auth.id);
            }

            this.logger.info("User logged out", { id: req.auth.sub });

            this.tokenService.clearAuthCookies(res);

            res.json({ status: "success" });
        } catch (err) {
            next(createHttpError(400, "Could not log out"));
        }
    }
}
