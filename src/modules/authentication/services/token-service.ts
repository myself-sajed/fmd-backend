import jwt, { JwtPayload } from "jsonwebtoken";
import { Config } from "../../../config/index";
import { IUser } from "../types/user-types";
import { RefreshTokenModel } from "../models/refresh-token-model";
import { Response } from "express";

export class TokenService {
    generateAccessToken(payload: JwtPayload): string {
        return jwt.sign(payload, Config.JWT_ACCESS_SECRET!, {
            expiresIn: "15m",
            algorithm: "HS256",
        });
    }

    generateRefreshToken(payload: JwtPayload & { id: string }): string {
        return jwt.sign(payload, Config.JWT_REFRESH_SECRET!, {
            expiresIn: "7d",
            algorithm: "HS256",
        });
    }

    async saveRefreshTokenRecord(user: IUser) {
        const token = this.generateRefreshToken({
            sub: String(user._id),
            email: user.email,
            role: user.role,
            name: user.name,
            id: String(user._id),
        });
        const tokenRecord = await RefreshTokenModel.create({
            user: user._id,
            token,
        });
        return tokenRecord;
    }

    async deleteRefreshToken(id: string) {
        await RefreshTokenModel.findByIdAndDelete(id);
    }

    setCookie(res: Response, key: string, token: string, maxAge: number) {
        res.cookie(key, token, {
            httpOnly: true,
            secure: Config.NODE_ENV === "production",
            sameSite: Config.NODE_ENV === "production" ? "none" : "strict",
            maxAge,
        });
    }

    clearAuthCookies(res: Response) {
        res.clearCookie("accessToken", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });
    }
}
