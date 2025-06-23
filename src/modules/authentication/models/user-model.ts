import mongoose, { Schema } from "mongoose";
import { Gender, IUser, UserRoles } from "../types/user-types";

const userSchema: Schema<IUser> = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        photoURL: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: Object.values(UserRoles),
            default: UserRoles.PATIENT,
        },
        gender: {
            type: String,
            enum: Object.values(Gender),
        },
        onboarded: {
            type: Boolean,
            required: false,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

export const UserModel = mongoose.model<IUser>("User", userSchema);
