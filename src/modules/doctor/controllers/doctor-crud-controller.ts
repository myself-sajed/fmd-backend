import { NextFunction, Request, Response } from "express";
import { DoctorService } from "../services/doctor-crud-services";
import { IDoctor } from "../types/doctor-types";

export class DoctorController {
    constructor(private doctorService: DoctorService) {
        this.doctorService = doctorService;
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.doctorService.createDoctor(
                req.body as IDoctor,
            );
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.doctorService.getAllDoctors(req.query);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.doctorService.getDoctorById(
                req.params.id,
            );
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await this.doctorService.updateDoctor(
                req.params.id,
                req.body as Partial<IDoctor>,
            );
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await this.doctorService.deleteDoctor(req.params.id);
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
