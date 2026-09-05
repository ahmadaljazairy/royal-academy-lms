export interface ApiResponse<TData = unknown> {
    success: boolean;
    statusCode: number;
    message: string | string[];
    data: TData | null;
    error?: string;
    meta?: Record<string, unknown>;
    traceId: string;
    timestamp: string;
}