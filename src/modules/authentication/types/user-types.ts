import { Types } from "mongoose";

export enum UserRoles {
    ADMIN = "Admin",
    PATIENT = "Client",
    DOCTOR = "Doctor",
}

export interface IUser {
    _id: Types.ObjectId;
    name: string;
    email: string;
    photoURL: string;
    password: string;
    role: UserRoles;
}
