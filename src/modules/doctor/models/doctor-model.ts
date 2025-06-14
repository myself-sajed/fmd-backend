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
        languages: {
            type: [String],
            required: true,
        },
        availability: {
            days: [String],
            from: String,
            to: String,
        },
        location: {
            address: String,
            city: String,
            state: String,
            country: String,
            pincode: String,
            coordinates: {
                lat: Number,
                lng: Number,
            },
        },
    },
    {
        timestamps: true,
    },
);

export const DoctorModel = model<IDoctor>("Doctor", doctorSchema);
