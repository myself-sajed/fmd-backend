// src/services/user-service.ts
import { UserModel } from "../models/user-model";
import { IUser } from "../types/user-types";

export class UserService {
    async create(data: {
        name: string;
        email: string;
        password: string;
        role?: string;
    }): Promise<IUser> {
        const user = new UserModel(data);
        await user.save();
        return user;
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return await UserModel.findOne({ email });
    }

    async findById(id: string): Promise<IUser | null> {
        return await UserModel.findById(id);
    }
}
