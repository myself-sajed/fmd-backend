import mongoose, { Schema } from "mongoose";

const refreshTokenSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

export const RefreshTokenModel = mongoose.model(
    "RefreshToken",
    refreshTokenSchema,
);
