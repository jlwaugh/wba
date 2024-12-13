export interface DIDDocument {
    "@context": string[];
    id: string;
    authentication: string[];
    verificationMethod: VerificationMethod[];
    [key: string]: any;
}

export interface VerificationMethod {
    id: string;
    type: string;
    controller: string;
    publicKeyJwk?: {
        kty: string;
        crv: string;
        x: string;
        [key: string]: any;
    };
}

export interface APIResponse<T = unknown> {
    ok: boolean;
    status: number;
    data?: T;
    error?: string;
}

export interface AuthResponse extends APIResponse {
    token?: string;
    wwwAuthenticate?: string;
}