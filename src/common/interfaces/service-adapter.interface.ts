export interface ServiceAdapter<T, U> {
    execute(command: T): Promise<U>;
}
