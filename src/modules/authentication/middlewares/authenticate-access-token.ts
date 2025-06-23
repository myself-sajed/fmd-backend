import { expressjwt } from "express-jwt";
import { Request } from "express";
import { Config } from "../../../config/index";

export default expressjwt({
    secret: Config.JWT_ACCESS_SECRET!,
    algorithms: ["HS256"],

    getToken: (req: Request) => {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            if (token && token !== "undefined") return token;
        }

        const { accessToken } = (req.cookies as { accessToken?: string }) || {};
        return accessToken;
    },
});
