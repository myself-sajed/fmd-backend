import express, {
    Request,
    Response,
    NextFunction,
    RequestHandler,
} from "express";
import { UserService } from "../services/user-service";
import { TokenService } from "../services/token-service";
import { CredentialManagerService } from "../services/cred-manager-service";
import { RequestWithAuthInfo } from "../types/auth-types";
import AuthController from "../controllers/auth-controller";
import logger from "../../../config/logger";
import authenticateAccessToken from "../middlewares/authenticate-access-token";
import authenticateRefreshToken from "../middlewares/authenticate-refresh-token";
import parseRefreshToken from "../middlewares/parse-refresh-token";
import registrationValidators from "../validators/registration-validators";
import loginValidators from "../validators/login-validators";

const router = express.Router();

// Instantiate services
const userService = new UserService();
const tokenService = new TokenService();
const credentialService = new CredentialManagerService();
const authController = new AuthController(
    userService,
    logger,
    tokenService,
    credentialService,
);

// Routes
router.post(
    "/register",
    registrationValidators,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next) as unknown as RequestHandler,
);

router.post(
    "/login",
    loginValidators,
    (req: Request, res: Response, next: NextFunction) =>
        authController.login(req, res, next) as unknown as RequestHandler,
);

router.get(
    "/self",
    authenticateAccessToken as RequestHandler,
    (req: Request, res: Response) =>
        authController.self(
            req as RequestWithAuthInfo,
            res,
        ) as unknown as RequestHandler,
);

router.post(
    "/refresh",
    authenticateRefreshToken as RequestHandler,
    (req: Request, res: Response, next: NextFunction) =>
        authController.refresh(
            req as RequestWithAuthInfo,
            res,
            next,
        ) as unknown as RequestHandler,
);

router.post(
    "/logout",
    authenticateAccessToken as RequestHandler,
    parseRefreshToken as RequestHandler,
    (req: Request, res: Response, next: NextFunction) =>
        authController.logout(
            req as RequestWithAuthInfo,
            res,
            next,
        ) as unknown as RequestHandler,
);

export default router;
