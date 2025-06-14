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
    role: UserRoles;
    password: string;
    photoURL: string;
    gender: Gender;
}

export enum Gender {
    MALE = "Male",
    FEMALE = "Female",
    OTHER = "Other",
}
