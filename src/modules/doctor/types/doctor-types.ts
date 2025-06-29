import { IUser } from "../../authentication/types/user-types";

export interface IDoctor {
    _id: string;
    user: IUser;
    specialization: string[];
    degree: string[];
    experience: number;
    bio?: string;
    languages: string[];
    consultation_types: IDoctorConsultationTypes;
    availability?: {
        days: string[];
        from: string;
        to: string;
    };
    location?: {
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
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

export enum IDoctorConsultationTypes {
    ONLINE = "Online",
    OFFLINE = "Offline",
    BOTH = "Online & Offline",
}
