import { Request } from "express";

export interface UserInfo {
    name: string;
    email: string;
    password: string;
    role: string;
}

export interface RequestWithUserInfo extends Request {
    body: UserInfo;
}

export interface RequestWithAuthInfo extends Request {
    auth: {
        sub: string;
        name: string;
        email: string;
        role: string;
        id?: string;
        tenant?: string;
    };
}
export interface IRevokeToken {
    sub: string;
    id: string;
}
export interface ICreateTenantData {
    name: string;
    address: string;
}

export interface RequestWithCreateTenantData extends Request {
    body: ICreateTenantData;
}
export interface RequestWithTenantId extends Request {
    body: {
        id: number;
    };
}

export interface RequestWithTenantUpdateInfo extends Request {
    body: {
        tenantToUpdate: number;
        detailsToUpdate: {
            name?: string;
            address?: string;
        };
    };
}
export interface RequestWithUserUpdateInfo extends Request {
    body: {
        userToUpdate: number;
        detailsToUpdate: {
            name?: string;
            password?: string;
            email?: string;
        };
    };
}

export interface TenantDetailsToUpdate {
    name?: string;
    address?: string;
}
export interface UserDetailsToUpdate {
    name?: string;
    password?: string;
    email?: string;
}

export interface ResponseBody {
    users: UserInfo[];
}

export interface UserListQueryParams {
    qTerm: string;
    role: string;
    currentPage: number;
    perPage: number;
}
export interface TenantListQueryParams {
    qTerm: string;
    currentPage: number;
    perPage: number;
}
