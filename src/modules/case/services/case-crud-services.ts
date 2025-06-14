import createHttpError from "http-errors";
import { CaseModel } from "../models/case-model";
import { ICase } from "../types/case-types";

export class CaseService {
    async createCase(payload: Partial<ICase>): Promise<ICase> {
        const newCase = await CaseModel.create(payload);
        return newCase;
    }

    async getAllCases(filter: Partial<ICase> = {}): Promise<ICase[]> {
        return CaseModel.find(filter).populate("client assigned_doctor").exec();
    }

    async getCaseById(id: string): Promise<ICase> {
        const caseItem = await CaseModel.findById(id)
            .populate("client assigned_doctor")
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
