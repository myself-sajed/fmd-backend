export enum UserRoles {
    ADMIN = "Admin",
    PATIENT = "Client",
    DOCTOR = "Doctor",
}

export interface IUser {
    _id: string;
    name: string;
    email: string;
    photoURL: string;
    password: string;
    role: UserRoles;
}
