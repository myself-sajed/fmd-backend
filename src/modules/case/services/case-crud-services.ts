import createHttpError from "http-errors";
import { CaseModel } from "../models/case-model";
import { ICase } from "../types/case-types";

export class CaseService {
    async createCase(payload: Partial<ICase>): Promise<ICase> {
        const caseName = `CASE-${new Date().getTime()}`;
        const newCase = await CaseModel.create({
            ...payload,
            ai_case_name: caseName,
        });
        return newCase;
    }

    async getAllCases(filter: Partial<ICase> = {}): Promise<ICase[]> {
        return await CaseModel.find(filter)
            .populate("client")
            .sort({ createdAt: -1 }) // Sort by createdAt descending
            .exec();
    }

    async getCaseById(id: string): Promise<ICase> {
        const caseItem = await CaseModel.findById(id)
            .populate("client")
            .populate({
                path: "suggested_doctors",
                populate: {
                    path: "user", // 👈 nested population inside each suggested_doctor
                    model: "User", // 👈 make sure this matches your User model name
                },
            })
            .exec();

        if (!caseItem) throw createHttpError(404, "Case not found");
        return caseItem;
    }

    async updateCase(id: string, payload: Partial<ICase>): Promise<ICase> {
        const updated = await CaseModel.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true,
        })
            .populate("client assigned_doctor")
            .exec();

        if (!updated) throw createHttpError(404, "Case not found");
        return updated;
    }

    async deleteCase(id: string): Promise<void> {
        const deleted = await CaseModel.findByIdAndDelete(id);
        if (!deleted) throw createHttpError(404, "Case not found");
    }
}
