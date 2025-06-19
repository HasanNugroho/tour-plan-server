import { User } from '../user';

export interface IUserRepository {
	/**
	 * @param id - The ID of the user to get
	 *
	 * @returns The user with the given ID, or null if not found
	 */
	getById(id: string): Promise<User | null>;

	/**
	 * @param email - The email of the user to get
	 *
	 * @returns The user with the given email, or null if not found
	 */
	getByEmail(email: string): Promise<User | null>;

	/**
	 * @param username - The username of the user to get
	 *
	 * @returns The user with the given username, or null if not found
	 */
	getByUsername(username: string): Promise<User | null>;

	/**
	 * @param email - The email of the user to get
	 * @param username - The username of the user to get
	 *
	 * @returns The user with the given email or username, or null if not found
	 */
	getByEmailOrUsername(email: string, username: string): Promise<User | null>;

	/**
	 * @param roleId - The roleId of the users to fetch
	 *
	 * @returns The user with the given roleId, or null if not found
	 */
	getAllByRoleId(roleId: string): Promise<User[]>;

	/**
	 * @param user - The user to create
	 *
	 * @returns The created user
	 */
	create(user: User): Promise<User>;

	/**
	 * @param id - identifier of the user to update
	 * @param user - The user to update
	 *
	 * @returns The updated user
	 */
	update(id: string, user: User): Promise<User | null>;

	/**
	 * @param id - identifier of the user to update
	 * @param user - The user to update
	 *
	 * @returns The updated user
	 */
	delete(id: string): Promise<void>;

	/**
	 * @returns The super user, or null if not found
	 */
	getSuperUser(): Promise<User | null>;
}
