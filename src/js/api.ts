import type { DIDDocument, APIResponse, AuthResponse } from '../types';

const BASE_URL = 'https://pi-unlimited.com';

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

export async function retrieveDIDDocument(
    userId: string
): Promise<APIResponse<DIDDocument>> {
    try {
        const url = `${BASE_URL}/wba/user/${userId}/did.json`;
        console.log(`Fetching DID Document from: ${url}`);

        const response = await fetch(url);
        
        let data: DIDDocument | undefined;
        if (response.ok) {
            data = await response.json() as DIDDocument;
            console.log('DID Document retrieved successfully:', data);
        } else {
            console.error(`Failed to retrieve DID Document. Status: ${response.status}`);
        }

        return {
            ok: response.ok,
            status: response.status,
            data
        };
    } catch (error) {
        console.error('Error retrieving DID Document:', error);
        return {
            ok: false,
            status: 0,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

export async function testAuthentication(
    endpoint: 'test' | 'test401',
    authToken?: string
): Promise<AuthResponse> {
    try {
        const headers = new Headers();
        if (authToken) {
            headers.append('Authorization', `Bearer ${authToken}`);
        }

        const response = await fetch(`${BASE_URL}/wba/${endpoint}`, {
            headers
        });

        const token = response.headers.get('Authorization');
        const wwwAuthenticate = response.headers.get('WWW-Authenticate');

        let data: string | undefined;
        if (response.ok) {
            data = await response.text();
        }

        return {
            ok: response.ok,
            status: response.status,
            token: token ? token.replace('Bearer ', '') : undefined,
            wwwAuthenticate: wwwAuthenticate ?? undefined,
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