import {
    NextFunction,
    Request,
    RequestHandler,
    Response,
    Router,
} from "express";
import { DoctorController } from "../controllers/doctor-crud-controller";
import { DoctorService } from "../services/doctor-crud-services";

const router = Router();
export const doctorService = new DoctorService();
const doctorController = new DoctorController(doctorService);

router.post(
    "/",
    (req: Request, res: Response, next: NextFunction) =>
        doctorController.create(req, res, next) as unknown as RequestHandler,
);

router.post(
    "/get-multiple-by-ids",
    (req: Request, res: Response, next: NextFunction) =>
        doctorController.getAllByIds(
            req,
            res,
            next,
        ) as unknown as RequestHandler,
);

router.get(
    "/",
    (req: Request, res: Response, next: NextFunction) =>
        doctorController.getAll(req, res, next) as unknown as RequestHandler,
);

router.get(
    "/:id",
    (req: Request, res: Response, next: NextFunction) =>
        doctorController.getById(req, res, next) as unknown as RequestHandler,
);

router.put(
    "/:id",
    (req: Request, res: Response, next: NextFunction) =>
        doctorController.update(req, res, next) as unknown as RequestHandler,
);

router.delete(
    "/:id",
    (req: Request, res: Response, next: NextFunction) =>
        doctorController.delete(req, res, next) as unknown as RequestHandler,
);

export default router;
