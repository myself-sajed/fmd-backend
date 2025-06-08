import { model, Schema } from "mongoose";
import { IDoctor } from "../types/doctor-types";

const doctorSchema = new Schema<IDoctor>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        specialization: {
            type: [String],
            required: true,
        },
        degree: {
            type: [String],
            required: true,
        },
        experience: {
            type: Number,
            required: true,
        },
        bio: {
            type: String,
        },
        availability: {
            days: [String],
            from: String,
            to: String,
        },
    },
    {
        timestamps: true,
    },
);

export const DoctorModel = model<IDoctor>("Doctor", doctorSchema);
