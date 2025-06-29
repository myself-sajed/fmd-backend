import {
    Router,
    Request,
    Response,
    NextFunction,
    RequestHandler,
} from "express";
import { CaseService } from "../services/case-crud-services";
import { CaseController } from "../controllers/case-crud-controller";
import authenticateUser from "../../authentication/middlewares/authenticateUser";

const router = Router();
export const caseService = new CaseService();
const caseController = new CaseController(caseService);

router.post(
    "/create-case",
    authenticateUser as RequestHandler,
    (req: Request, res: Response, next: NextFunction) =>
        caseController.create(req, res, next) as unknown as RequestHandler,
);
router.get(
    "/get-all-cases",
    authenticateUser as RequestHandler,
    (req: Request, res: Response, next: NextFunction) =>
        caseController.getAll(req, res, next) as unknown as RequestHandler,
);
router.get(
    "/get-one-case/:id",
    authenticateUser as RequestHandler,
    (req: Request, res: Response, next: NextFunction) =>
        caseController.getById(req, res, next) as unknown as RequestHandler,
);
router.put(
    "/update-case/:id",
    authenticateUser as RequestHandler,
    (req: Request, res: Response, next: NextFunction) =>
        caseController.update(req, res, next) as unknown as RequestHandler,
);
router.delete(
    "/delete-case/:id",
    authenticateUser as RequestHandler,
    (req: Request, res: Response, next: NextFunction) =>
        caseController.delete(req, res, next) as unknown as RequestHandler,
);

export default router;
