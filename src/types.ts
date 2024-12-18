export interface DIDDocument {
    id: string;
    [key: string]: any;  // Allow for additional DID document properties
}

export interface APIResponse<T> {
    ok: boolean;
    status: number;
    error?: string;
    data?: T;
}

export interface AuthResponse {
    authorization: string;
    auth_code: number;
    error_message: string | null;
    access_token: string;
}
