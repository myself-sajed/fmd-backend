import { model, Schema } from "mongoose";
import { CaseStatus, ICase } from "../types/case-types";

const caseSchema = new Schema<ICase>(
    {
        client: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        client_raw_query: {
            type: String,
            required: true,
            trim: true,
        },
        summary: {
            type: String,
            trim: true,
        },
        suggested_specializations: {
            type: [String],
            default: [],
        },
        urgency_level: {
            type: String,
            enum: ["low", "medium", "high"],
        },
        assigned_doctor: {
            type: Schema.Types.ObjectId,
            ref: "Doctor",
        },
        status: {
            type: String,
            enum: Object.values(CaseStatus),
            default: CaseStatus.Pending,
        },
        preferred_time: {
            type: String,
            required: true,
        },
        scheduled_time: {
            type: Date,
        },
        notes: {
            type: String,
        },
        voice_note_url: {
            type: String,
        },
        voice_transcript: {
            type: String,
        },
        ai_response_log: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    },
);

export const CaseModel = model<ICase>("Case", caseSchema);
