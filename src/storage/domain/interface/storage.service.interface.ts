import { File, FileStatus } from "../file";

/**
 * Defines the contract for storage service operations.
 */
export interface StorageServiceInterface {
    /**
     * Uploads a single file to storage.
     *
     * @param file - The file object received from multer.
     * @returns A promise resolving to the uploaded File entity.
     */
    uploadFile(file: Express.Multer.File): Promise<File>;

    /**
     * Uploads multiple files to storage.
     *
     * @param files - Array of file objects received from multer.
     * @returns A promise resolving to an array of uploaded File entities.
     */
    uploadFiles(files: Express.Multer.File[]): Promise<File[]>;

    /**
     * Deletes a file from storage.
     *
     * @param storedName - The internal storage name of the file.
     * @param tenantId - (Optional) Tenant ID for multi-tenant scenarios.
     * @returns A promise that resolves when the file is deleted.
     */
    delete(
        storedName: string,
        tenantId?: string | null
    ): Promise<void>;

    /**
     * Updates file metadata or properties.
     *
     * @param status - Status file data to update.
     * @returns A promise that resolves when the update is complete.
     */
    updateStatus(status: FileStatus): Promise<void>;

    /**
     * Retrieves a file entity by its ID.
     *
     * @param id - The unique identifier of the file.
     * @param expired - (Optional) Expiration time in milliseconds.
     * @returns A promise resolving to the File entity, or null if not found.
     */
    getById(id: string, expired?: number): Promise<File | null>;
}
