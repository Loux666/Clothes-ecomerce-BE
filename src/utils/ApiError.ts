export class ApiError extends Error {
    statusCode: number;
    code?: string;
    details?: unknown;

    constructor(statusCode: number, message: string, options?: { code?: string; details?: unknown }) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.code = options?.code;
        this.details = options?.details;

        Object.setPrototypeOf(this, ApiError.prototype);
    }
}