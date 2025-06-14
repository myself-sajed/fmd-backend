import { Request, Response, NextFunction } from "express";
import { CaseService } from "../services/case-crud-services";
import { ICase } from "../types/case-types";
import { inngest } from "../../../config/inngest";

export class CaseController {
    constructor(private caseService: CaseService) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // create a case
            const createdCase: ICase = await this.caseService.createCase(
                req.body as ICase,
            );

            // trigger an Inngest event
            void inngest.send({
                name: "case/created",
                data: {
                    caseId: createdCase._id.toString(),
                },
            });

            // send the data without waiting...
            res.status(201).json({ success: true, data: createdCase });
        } catch (err) {
            next(err);
        }
    };

    getAll = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const allCases = await this.caseService.getAllCases();
            res.json({ success: true, data: allCases });
        } catch (err) {
            next(err);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const found = await this.caseService.getCaseById(req.params.id);
            res.json({ success: true, data: found });
        } catch (err) {
            next(err);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const updated = await this.caseService.updateCase(
                req.params.id,
                req.body as ICase,
            );
            res.json({ success: true, data: updated });
        } catch (err) {
            next(err);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.caseService.deleteCase(req.params.id);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    };
}
