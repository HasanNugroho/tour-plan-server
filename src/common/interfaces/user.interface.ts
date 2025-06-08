import { Role } from "src/account/domain/role";

export interface IUser {
    id: string;
    name: string;
    fullname: string;
    email: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;

    password?: string;
}