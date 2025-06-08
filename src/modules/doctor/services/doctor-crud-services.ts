import createHttpError from "http-errors";
import { UserModel } from "../../authentication/models/user-model";
import { IDoctor, IGetAllDoctorFilter } from "../types/doctor-types";
import { DoctorModel } from "../models/doctor-model";
import { IUser, UserRoles } from "../../authentication/types/user-types";

export class DoctorService {
    async createDoctor(payload: IDoctor): Promise<IDoctor> {
        const user = await UserModel.findById(payload.user);
        if (!user) throw createHttpError(404, "User not found");
        if (user.role !== UserRoles.DOCTOR)
            throw createHttpError(400, "User is not a doctor");

        const doctor = await DoctorModel.create(payload);
        return doctor;
    }

    async getAllDoctors(filter: IGetAllDoctorFilter = {}): Promise<IDoctor[]> {
        return DoctorModel.find(filter).populate("user").exec();
    }

    async getDoctorById(id: string): Promise<IDoctor> {
        const doctor = await DoctorModel.findById(id).populate("user");
        if (!doctor) throw createHttpError(404, "Doctor not found");
        return doctor;
    }

    async updateDoctor(
        id: string,
        payload: Partial<IDoctor>,
    ): Promise<IDoctor> {
        const doctor = await DoctorModel.findById(id).populate("user").exec();
        if (!doctor) throw createHttpError(404, "Doctor not found");

        // If user data is included in the update
        if (payload.user && typeof payload.user === "object") {
            const userPayload = payload.user as Partial<IUser>;
            const userId = (doctor.user as IUser)._id;

            await UserModel.findByIdAndUpdate(userId, userPayload, {
                new: true,
            });
        }

        // Remove user field from payload to avoid ObjectId casting error
        delete payload.user;

        Object.assign(doctor, payload);
        const savedDoctor = await doctor.save();
        return await savedDoctor.populate("user");
    }

    async deleteDoctor(id: string): Promise<void> {
        const doctor = await DoctorModel.findById(id);
        if (!doctor) throw createHttpError(404, "Doctor not found");
        await DoctorModel.deleteOne({ _id: id });
    }
}
