import './style.css';
import { showResponse, validateDIDDocument } from './js/utils';
import { uploadDIDDocument, retrieveDIDDocument, testAuthentication, generateDIDDocument } from './js/api';

// 辅助函数：自动调整textarea高度
function autoResizeTextarea(textarea: HTMLTextAreaElement) {
    // 先将高度设置为最小值，以便正确计算所需高度
    textarea.style.height = 'auto';
    // 设置高度为滚动高度
    textarea.style.height = (textarea.scrollHeight + 2) + 'px';
}

// 辅助函数：设置textarea的值并自动调整高度
function setTextareaValueAndResize(textarea: HTMLTextAreaElement, value: string) {
    textarea.value = value;
    autoResizeTextarea(textarea);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing application...');

    // 获取DOM元素
    const retrieveIdInput = document.getElementById('retrieveId') as HTMLInputElement;
    const generateDocBtn = document.getElementById('generateDocBtn');
    const generatedDocEl = document.getElementById('generatedDocument') as HTMLTextAreaElement;
    const generatedKeyEl = document.getElementById('generatedKey') as HTMLTextAreaElement;
    const uploadDidDocEl = document.getElementById('uploadDidDocument') as HTMLTextAreaElement;
    const uploadPrivateKeyEl = document.getElementById('uploadPrivateKey') as HTMLTextAreaElement;
    const uploadBtn = document.getElementById('uploadBtn');

    // 初始化所有textarea的自动调整高度
    const allTextareas = document.querySelectorAll('textarea');
    allTextareas.forEach(textarea => {
        // 为所有textarea添加input和change事件监听
        ['input', 'change'].forEach(event => {
            textarea.addEventListener(event, () => autoResizeTextarea(textarea as HTMLTextAreaElement));
        });
        // 初始化时调整高度
        autoResizeTextarea(textarea as HTMLTextAreaElement);
    });

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
                // 切换tab时重新调整文本框高度
                content?.querySelectorAll('textarea').forEach(textarea => {
                    autoResizeTextarea(textarea as HTMLTextAreaElement);
                });
            }
        });
    });

    // Generate DID Document and Private Key
    generateDocBtn?.addEventListener('click', async () => {
        try {
            const response = await generateDIDDocument();
            
            if (response.ok && response.data) {
                const generatedDocEl = document.getElementById('generatedDocument') as HTMLTextAreaElement;
                const generatedKeyEl = document.getElementById('generatedKey') as HTMLTextAreaElement;
                const uploadDocEl = document.getElementById('uploadDidDocument') as HTMLTextAreaElement;
                const uploadKeyEl = document.getElementById('uploadPrivateKey') as HTMLTextAreaElement;
                const retrieveIdEl = document.getElementById('retrieveId') as HTMLInputElement;
                const testDidEl = document.getElementById('testDid') as HTMLTextAreaElement;
                const authUrlEl = document.getElementById('authUrl') as HTMLTextAreaElement;

                // Parse and format the DID document
                const didDocument = JSON.parse(response.data.did_document);
                const formattedDoc = JSON.stringify(didDocument, null, 2);
                
                // Set values and resize textareas
                setTextareaValueAndResize(generatedDocEl, formattedDoc);
                setTextareaValueAndResize(generatedKeyEl, response.data.private_key);
                setTextareaValueAndResize(uploadDocEl, formattedDoc);
                setTextareaValueAndResize(uploadKeyEl, response.data.private_key);
                
                // Set the DID for retrieve and test
                if (didDocument && typeof didDocument === 'object' && 'id' in didDocument) {
                    setTextareaValueAndResize(retrieveIdEl, didDocument.id);
                    setTextareaValueAndResize(testDidEl, didDocument.id);
                }

                // Set default auth URL if empty
                if (!authUrlEl.value) {
                    setTextareaValueAndResize(authUrlEl, 'https://agent-network-protocol.com/wba/test');
                }

                showResponse(document.body, 'Successfully generated DID document and private key. \n\nWARNING: This DID document and private key are for testing purposes only. Do not use in a production environment!');
            } else {
                showResponse(document.body, response.error || 'Failed to generate DID document', true);
            }
        } catch (error) {
            showResponse(document.body, `Error generating DID document: ${error}`, true);
        }
    });

    // Upload
    uploadBtn?.addEventListener('click', async () => {
        if (!uploadDidDocEl?.value) {
            showResponse(document.body, 'Please generate a DID document first', true);
            return;
        }

        if (!validateDIDDocument(uploadDidDocEl.value)) {
            showResponse(document.body, 'Invalid DID Document format', true);
            return;
        }

        // 从DID文档中提取ID
        try {
            const didDoc = JSON.parse(uploadDidDocEl.value);
            const userId = didDoc.id?.split(':').pop() || '';
            
            const response = await uploadDIDDocument(userId, uploadDidDocEl.value);
            
            if (response.ok) {
                showResponse(document.body, 
                    `Successfully uploaded DID document.\nYour DID is: ${didDoc.id}`
                );
            } else {
                showResponse(document.body, 
                    response.error || `Upload failed with status: ${response.status}`,
                    true
                );
            }
        } catch (error) {
            showResponse(document.body, 'Failed to parse DID document', true);
        }
    });

    // Retrieve
    const retrieveBtn = document.getElementById('retrieveBtn');
    
    retrieveBtn?.addEventListener('click', async () => {
        if (!retrieveIdInput?.value) {
            showResponse(document.body, 'Please enter a User ID', true);
            return;
        }

        const response = await retrieveDIDDocument(retrieveIdInput.value);
        
        if (response.ok && response.data) {
            showResponse(document.body, 
                `Retrieved DID document success:\n${JSON.stringify(response.data, null, 2)}`
            );
        } else {
            showResponse(document.body, 
                response.error || `Retrieval failed with status: ${response.status}`,
                true
            );
        }
    });

    // 添加辅助函数来更新测试页面的 DID
    function updateTestDID() {
        const generatedDocEl = document.getElementById('generatedDocument') as HTMLTextAreaElement;
        const testDidEl = document.getElementById('testDid') as HTMLTextAreaElement;
        
        if (generatedDocEl.value) {
            try {
                const didDocument = JSON.parse(generatedDocEl.value);
                if (didDocument && typeof didDocument === 'object' && 'id' in didDocument) {
                    testDidEl.value = didDocument.id;
                    autoResizeTextarea(testDidEl);
                }
            } catch (error) {
                console.error('Error parsing DID document:', error);
            }
        }
    }

    // Tab 切换逻辑
    const tabButtons = document.querySelectorAll<HTMLElement>('.tab');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            if (!tabId) return;

            // 移除所有 active 类
            tabButtons.forEach(btn => btn.classList.remove('active'));
            const tabContents = document.querySelectorAll<HTMLElement>('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));

            // 添加 active 类到当前选中的 tab
            button.classList.add('active');
            document.getElementById(tabId)?.classList.add('active');

            // 如果切换到 retrieve 或 test tab，自动填充 DID
            if (tabId === 'retrieve') {
                const retrieveIdEl = document.getElementById('retrieveId') as HTMLInputElement;
                const generatedDocEl = document.getElementById('generatedDocument') as HTMLTextAreaElement;
                if (generatedDocEl.value) {
                    try {
                        const didDocument = JSON.parse(generatedDocEl.value);
                        if (didDocument && typeof didDocument === 'object' && 'id' in didDocument) {
                            retrieveIdEl.value = didDocument.id;
                        }
                    } catch (error) {
                        console.error('Error parsing DID document:', error);
                    }
                }
            } else if (tabId === 'test') {
                updateTestDID();
            }
        });
    });

    // Test Authentication
    const testAuthBtn = document.getElementById('testAuthBtn');
    testAuthBtn?.addEventListener('click', async () => {
        try {
            const generatedDocEl = document.getElementById('generatedDocument') as HTMLTextAreaElement;
            const generatedKeyEl = document.getElementById('generatedKey') as HTMLTextAreaElement;
            const authUrlEl = document.getElementById('authUrl') as HTMLTextAreaElement;
            
            if (!generatedDocEl.value || !generatedKeyEl.value || !authUrlEl.value) {
                showResponse(document.body, 'Please generate DID document and provide auth URL first', true);
                return;
            }

            const response = await testAuthentication(
                generatedDocEl.value,
                generatedKeyEl.value
            );

            if (response.ok && response.data) {
                // 更新响应字段
                const authorizationEl = document.getElementById('authorization') as HTMLTextAreaElement;
                const authCodeEl = document.getElementById('authCode') as HTMLTextAreaElement;
                const errorMessageEl = document.getElementById('errorMessage') as HTMLTextAreaElement;
                const accessTokenEl = document.getElementById('accessToken') as HTMLTextAreaElement;

                // 设置值并自动调整大小
                const setValueAndResize = (el: HTMLTextAreaElement, value: string) => {
                    el.value = value;
                    autoResizeTextarea(el);
                };

                setValueAndResize(authorizationEl, response.data.authorization || '');
                setValueAndResize(authCodeEl, response.data.auth_code?.toString() || '');
                setValueAndResize(errorMessageEl, response.data.error_message || '');
                setValueAndResize(accessTokenEl, response.data.access_token || '');

                showResponse(document.body, 'Authentication test completed successfully');
            } else {
                showResponse(document.body, response.error || 'Authentication test failed', true);
            }
        } catch (error) {
            showResponse(document.body, `Error during authentication test: ${error}`, true);
        }
    });

    // 为所有文本框添加自动调整大小的功能
    document.querySelectorAll('.input-group textarea').forEach(textarea => {
        textarea.addEventListener('input', () => {
            autoResizeTextarea(textarea as HTMLTextAreaElement);
        });
        // 初始化时调整大小
        autoResizeTextarea(textarea as HTMLTextAreaElement);
    });
});