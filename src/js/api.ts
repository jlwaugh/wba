import type { DIDDocument, APIResponse, AuthResponse } from '../types';

const BASE_URL = 'https://pi-unlimited.com';
const AUTH_URL = 'agent-network-protocol.com'

export async function uploadDIDDocument(
    userId: string, 
    didDocument: string
): Promise<APIResponse<DIDDocument>> {
    try {
        // Parse the document to ensure it's valid JSON before sending
        const doc = JSON.parse(didDocument);
        
        const response = await fetch(`${BASE_URL}/wba/user/${userId}/did.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(doc) // Convert back to string for transmission
        });

        return {
            ok: response.ok,
            status: response.status,
            data: response.ok ? await response.json() : undefined
        };
    } catch (error) {
        return {
            ok: false,
            status: 0,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

// export async function uploadDIDDocument(userId: string, didDocument: string) {
//     const url = `https://pi-unlimited.com/wba/user/${userId}/did.json`;
//     try {
//         const response = await fetch(url, {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: didDocument
//         });

//         if (!response.ok) {
//             const errorResponse = await response.text();
//             throw new Error(`Error: ${response.status} - ${errorResponse}`);
//         }

//         const result = await response.json();
//         console.log('DID Document uploaded successfully:', result);
//     } catch (error) {
//         console.error('Error uploading DID Document:', error);
//     }
// }

export interface AuthResponse {
    authorization: string;
    auth_code: number;
    error_message: string | null;
    access_token: string;
}

export async function retrieveDIDDocument(
    did: string
): Promise<APIResponse<DIDDocument>> {
    try {
        // Parse DID format: did:wba:example.com%3A3000:user:alice -> https://example.com:3000/user/alice/did.json
        const parts = did.split(':');
        if (parts.length < 5 || parts[0] !== 'did' || parts[1] !== 'wba') {
            throw new Error('Invalid DID format');
        }

        // Decode the domain and port
        const domain = decodeURIComponent(parts[2]);
        // Join the remaining parts as the path
        const path = parts.slice(3).join('/');
        
        const url = `https://${domain}/${path}/did.json`;
        console.log(`Fetching DID Document from: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return {
            ok: true,
            status: response.status,
            data: await response.json()
        };
    } catch (error) {
        return {
            ok: false,
            status: 0,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

export async function testAuthentication(
    didDocument: string,
    privateKey: string
): Promise<APIResponse<AuthResponse>> {
    try {
        const response = await fetch(`https://${AUTH_URL}/wba/demo/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                did_document: didDocument,
                private_key: privateKey,
                auth_url: 'https://agent-network-protocol.com/wba/test'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            ok: true,
            status: response.status,
            data
        };
    } catch (error) {
        return {
            ok: false,
            status: 0,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

export async function generateDIDDocument(): Promise<APIResponse<{did_document: string, private_key: string}>> {
    try {
        const response = await fetch(`${BASE_URL}/wba/demo/generate`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            ok: true,
            status: response.status,
            data: {
                did_document: data.did_document,
                private_key: data.private_key
            }
        };
    } catch (error) {
        return {
            ok: false,
            status: 0,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}