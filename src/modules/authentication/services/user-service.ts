// src/services/user-service.ts
import { UserModel } from "../models/user-model";
import { IUser } from "../types/user-types";
import bcrypt from "bcryptjs";

export class UserService {
    async create(data: {
        name: string;
        email: string;
        password: string;
        photoURL: string;
        role?: string;
    }): Promise<IUser> {
        const { password } = data;
        const hashedPassword = bcrypt.hashSync(password, 10);

        const user = new UserModel({ ...data, password: hashedPassword });
        await user.save();
        return user;
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return await UserModel.findOne({ email });
    }

    async findById(id: string): Promise<IUser | null> {
        return await UserModel.findById(id).lean();
    }
}
