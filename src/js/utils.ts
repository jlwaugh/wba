export function generateRandomId(length: number = 16): string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    return Array.from(
        { length }, 
        () => chars[Math.floor(Math.random() * chars.length)]
    ).join('');
}

export function showResponse(container: HTMLElement, message: string, isError = false): void {
    // 获取当前激活的tab内容区域
    const activeTab = document.querySelector('.tab-content.active');
    if (!activeTab) return;

    // 获取当前tab中的响应区域
    const responseArea = activeTab.querySelector('.response-area');
    if (!responseArea) return;

    // 清除之前的类
    responseArea.classList.remove('success', 'error');
    // 添加新的类
    responseArea.classList.add(isError ? 'error' : 'success');
    // 设置消息
    responseArea.textContent = message;
}

export function validateDIDDocument(doc: string): boolean {
    try {
        const parsed = JSON.parse(doc);
        
        // Basic DID Document validation
        if (!parsed['@context'] || !Array.isArray(parsed['@context'])) return false;
        if (!parsed['@context'].includes('https://www.w3.org/ns/did/v1')) return false;
        
        // Check id format
        if (!parsed.id || !parsed.id.startsWith('did:')) return false;
        
        // Check authentication array
        if (!Array.isArray(parsed.authentication)) return false;
        
        // Check verificationMethod
        if (!Array.isArray(parsed.verificationMethod)) return false;
        if (parsed.verificationMethod.length === 0) return false;
        
        // Check first verification method
        const method = parsed.verificationMethod[0];
        if (!method.id || !method.type || !method.controller) return false;
        
        // Check publicKeyJwk
        if (!method.publicKeyJwk || 
            !method.publicKeyJwk.kty || 
            !method.publicKeyJwk.crv || 
            !method.publicKeyJwk.x) return false;

        return true;
    } catch {
        return false;
    }
}