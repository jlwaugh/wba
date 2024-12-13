import './style.css';
import { generateRandomId, showResponse, validateDIDDocument } from './js/utils';
import { uploadDIDDocument, retrieveDIDDocument, testAuthentication } from './js/api';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing application...');

    // Initialize tabs
    const tabs = document.querySelectorAll<HTMLElement>('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll<HTMLElement>('.tab, .tab-content')
                .forEach(el => el.classList.remove('active'));
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            if (tabId) {
                const content = document.getElementById(tabId);
                content?.classList.add('active');
            }
        });
    });

    // Initialize event listeners
    const responseEl = document.getElementById('response');
    if (!responseEl) return;

    // Generate ID
    const generateBtn = document.getElementById('generateId');
    const userIdInput = document.getElementById('userId') as HTMLInputElement;
    const retrieveIdInput = document.getElementById('retrieveId') as HTMLInputElement;

    generateBtn?.addEventListener('click', () => {
        const id = generateRandomId();
        if (userIdInput) userIdInput.value = id;
        if (retrieveIdInput) retrieveIdInput.value = id;
    });

    // Upload
    const uploadBtn = document.getElementById('uploadBtn');
    const didDocInput = document.getElementById('didDocument') as HTMLTextAreaElement;

    uploadBtn?.addEventListener('click', async () => {
        if (!userIdInput?.value || !didDocInput?.value) {
            showResponse(responseEl, 'Please fill in all fields', true);
            return;
        }

        if (!validateDIDDocument(didDocInput.value)) {
            showResponse(responseEl, 'Invalid DID Document format', true);
            return;
        }

        const response = await uploadDIDDocument(userIdInput.value, didDocInput.value) as { ok: boolean; error?: string; status?: number } | unknown;
        
        if (typeof response === 'object' && response !== null && 'ok' in response) {
            if (response.ok) {
                showResponse(responseEl, 
                    `Successfully uploaded DID document.\nYour DID is: did:wba:pi-unlimited.com:wba:user:${userIdInput.value}`
                );
            } else {
                const { error, status } = response as { ok: boolean; error?: string; status?: number };
                showResponse(responseEl, 
                    error || `Upload failed with status: ${status}`,
                    true
                );
            }
        } else {
            showResponse(responseEl, 'Unexpected response format', true);
        }
    });

    // Retrieve
    const retrieveBtn = document.getElementById('retrieveBtn');
    
    retrieveBtn?.addEventListener('click', async () => {
        if (!retrieveIdInput?.value) {
            showResponse(responseEl, 'Please enter a User ID', true);
            return;
        }

        const response = await retrieveDIDDocument(retrieveIdInput.value);
        
        if (response.ok && response.data) {
            showResponse(responseEl, 
                `Retrieved DID document:\n${JSON.stringify(response.data, null, 2)}`
            );
        } else {
            showResponse(responseEl, 
                response.error || `Retrieval failed with status: ${response.status}`,
                true
            );
        }
    });

    // Test Authentication
    const authTokenInput = document.getElementById('authToken') as HTMLInputElement;
    
    document.getElementById('testNormalBtn')?.addEventListener('click', () => 
        handleAuthTest('test')
    );
    document.getElementById('test401Btn')?.addEventListener('click', () => 
        handleAuthTest('test401')
    );

    async function handleAuthTest(endpoint: 'test' | 'test401') {
        const response = await testAuthentication(endpoint, authTokenInput?.value);
        
        if (response.ok) {
            if (response.token && authTokenInput) {
                authTokenInput.value = response.token;
            }
            showResponse(responseEl!, 
                `Authentication test successful: ${response.data}`
            );
        } else if (response.status === 401 && response.wwwAuthenticate) {
            showResponse(responseEl!, 
                `Received 401 response with WWW-Authenticate: ${response.wwwAuthenticate}`
            );
        } else if (responseEl) {
            showResponse(responseEl, 
                response.error || `Authentication test failed with status: ${response.status}`,
                true
            );
        }
    }
});