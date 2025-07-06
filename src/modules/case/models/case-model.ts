import { model, Schema } from "mongoose";
import { CaseStatus, CaseUrgencyLevel, ICase } from "../types/case-types";

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
        ai_case_name: {
            type: String,
            required: false,
            trim: true,
        },
        client_preferences: {
            type: Object,
            default: {},
        },
        ai_summary: {
            type: String,
            trim: true,
        },
        suggested_specializations: {
            type: [String],
            default: [],
        },
        urgency_level: {
            type: String,
            enum: Object.values(CaseUrgencyLevel),
        },
        suggested_doctors: [
            {
                type: Schema.Types.ObjectId,
                ref: "Doctor",
            },
        ],
        assigned_doctor: {
            type: Schema.Types.ObjectId,
            ref: "Doctor",
        },
        ai_doctor_summary: {
            type: Object,
        },
        tips: {
            type: [String],
        },
        suggested_tests: {
            type: [String],
        },
        status: {
            type: String,
            enum: Object.values(CaseStatus),
            default: CaseStatus.Pending,
        },
        preferred_time: {
            type: String,
            required: false,
        },
        scheduled_time: {
            type: Date,
        },
        doctor_notes: {
            type: String,
        },
        voice_note_url: {
            type: String,
        },
        voice_transcript: {
            type: String,
        },
        case_errors: {
            type: Object,
            default: {},
        },
    },
    {
        timestamps: true,
    },
);

export const CaseModel = model<ICase>("Case", caseSchema);
