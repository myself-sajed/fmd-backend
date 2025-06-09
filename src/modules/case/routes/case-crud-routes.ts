import {
    Router,
    Request,
    Response,
    NextFunction,
    RequestHandler,
} from "express";
import { CaseService } from "../services/case-crud-services";
import { CaseController } from "../controllers/case-crud-controller";

const router = Router();
const caseService = new CaseService();
const caseController = new CaseController(caseService);

router.post(
    "/",
    (req: Request, res: Response, next: NextFunction) =>
        caseController.create(req, res, next) as unknown as RequestHandler,
);
router.get(
    "/",
    (req: Request, res: Response, next: NextFunction) =>
        caseController.getAll(req, res, next) as unknown as RequestHandler,
);
router.get(
    "/:id",
    (req: Request, res: Response, next: NextFunction) =>
        caseController.getById(req, res, next) as unknown as RequestHandler,
);
router.put(
    "/:id",
    (req: Request, res: Response, next: NextFunction) =>
        caseController.update(req, res, next) as unknown as RequestHandler,
);
router.delete(
    "/:id",
    (req: Request, res: Response, next: NextFunction) =>
        caseController.delete(req, res, next) as unknown as RequestHandler,
);

export default router;
