import { Types } from "mongoose";
import { IUser } from "../../authentication/types/user-types";

export interface IDoctor extends Document {
    user: Types.ObjectId | IUser;
    specialization: string[]; // e.g., ['Cardiology', 'Neurology']
    degree: string[]; // e.g., ['MBBS', 'MD']
    experience: number;
    bio?: string;
    availability?: {
        days: string[]; // e.g., ['Monday', 'Wednesday']
        from: string; // e.g., '09:00'
        to: string; // e.g., '17:00'
    };
}

export interface IGetAllDoctorFilter {
    specialization?: string;
    degree?: string;
    experience?: number;
    availability?: {
        days?: string[];
        from?: string;
        to?: string;
    };
    page?: number;
    limit?: number;
}
