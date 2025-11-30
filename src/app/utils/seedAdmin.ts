import bcryptjs from "bcryptjs"
import { User } from "../modules/user/user.model";
import { envVars } from "../config/env";
import { IUser, Role } from "../modules/user/user.interface";

export const seedAdmin = async () => {
    try {
        const Admin = await User.findOne({ email: envVars.ADMIN_email })

        if (Admin) {
            console.log("Admin already exists");
            return;
        }

        const hashedPassword = await bcryptjs.hash(envVars.ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUND));

        const payload: IUser = {
            name: "Admin",
            role: Role.ADMIN,
            email: envVars.ADMIN_email,
            password: hashedPassword,




        }
        const createAdmin = await User.create(payload)
        console.log(createAdmin);

    } catch (error) {
        console.log(error)

    }
}