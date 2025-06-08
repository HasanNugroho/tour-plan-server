import { CreateUserDto, UpdateUserDto } from "src/account/presentation/dto/user.dto";
import { User } from "../user";

/**
 * Interface for the User service
 * Provides methods for handling user-related operations.
 */
export interface IUserService {
    /**
     * Fetch a user by their unique ID.
     * @param id - The ID of the user to retrieve.
     * @returns A promise that resolves to the user object.
     * @throws NotFoundException if the user is not found.
     */
    getById(id: string): Promise<User>;

    /**
     * Fetch a user by their email.
     * @param email - The email of the user to retrieve.
     * @returns A promise that resolves to the user object.
     * @throws NotFoundException if the user is not found.
     */
    getByEmail(email: string): Promise<User>;

    /**
     * Fetch a user by their username.
     * @param username - The username of the user to retrieve.
     * @returns A promise that resolves to the user object.
     * @throws NotFoundException if the user is not found.
     */
    getByUsername(uesrname: string): Promise<User>;

    /**
     * Create a new user.
     * @param userData - The data of the user to create.
     * @returns A promise that resolves to the newly created user object.
     * @throws ConflictException if the email or username already exists.
     */
    create(userData: CreateUserDto): Promise<void>;

    /**
     * Update an existing user's details.
     * @param id - The ID of the user to update.
     * @param userData - The new data to update the user with.
     * @returns A promise that resolves to the updated user object.
     * @throws NotFoundException if the user is not found.
     */
    update(id: string, userData: UpdateUserDto): Promise<void>;

    /**
     * Delete a user by their ID.
     * @param id - The ID of the user to delete.
     * @returns A promise that resolves when the user has been deleted.
     * @throws NotFoundException if the user is not found.
     */
    delete(id: string): Promise<void>;
}
