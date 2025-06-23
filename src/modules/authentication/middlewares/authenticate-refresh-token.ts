import { expressjwt } from "express-jwt";
import { Request } from "express";
import { Config } from "../../../config/index";
import logger from "../../../config/logger";
import { IRevokeToken } from "../types/auth-types";
import { RefreshTokenModel } from "../models/refresh-token-model";

export default expressjwt({
    secret: Config.JWT_REFRESH_SECRET!,
    algorithms: ["HS256"],

    getToken: (req: Request) => {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            if (token && token !== "undefined") return token;
        }

        const { refreshToken } =
            (req.cookies as { refreshToken?: string }) || {};
        return refreshToken;
    },

    isRevoked: async (req: Request, token) => {
        try {
            const payload = token?.payload as IRevokeToken;
            const tokenDoc = await RefreshTokenModel.findOne({
                _id: payload.id,
                user: payload.sub,
            });

            return !tokenDoc;
        } catch (error) {
            logger.error(`Refresh token revocation check failed`, {
                error,
                tokenId: (token?.payload as IRevokeToken)?.id,
            });
            return true;
        }
    },
});
