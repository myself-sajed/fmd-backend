import bcrypt from "bcryptjs";

export class CredentialManagerService {
    async comparePasswords(userPassword: string, hashedPassword: string) {
        return await bcrypt.compare(userPassword, hashedPassword);
    }
}
