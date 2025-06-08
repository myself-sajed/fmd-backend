export enum UserRoles {
    ADMIN = "admin",
    PATIENT = "client",
    DOCTOR = "doctor",
}

export interface IUser {
    name: string;
    email: string;
    password: string;
    role: UserRoles;
}
