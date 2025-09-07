// Configuration management for AdGuard Home
let ADGUARD_CONFIG = {
    baseUrl: 'http://localhost:3000',
    username: 'admin',
    password: 'admin'
};

// Function to update configuration
export function updateConfig(newConfig) {
    ADGUARD_CONFIG = { ...ADGUARD_CONFIG, ...newConfig };
    saveConfigToStorage();
    console.log('Configuration updated:', ADGUARD_CONFIG);
}

// Function to get current configuration
export function getConfig() {
    return { ...ADGUARD_CONFIG };
}

function simpleEncrypt(text) {
    // Very basic obfuscation - not real encryption
    return btoa(unescape(encodeURIComponent(text))).split('').reverse().join('');
}

function simpleDecrypt(text) {
    // Reverse the basic obfuscation
    try {
        return decodeURIComponent(escape(atob(text.split('').reverse().join(''))));
    } catch (e) {
        console.error('Decryption error:', e);
        return '';
    }
}

// Finction to save configuration to localStorage with basic obfuscation
function saveConfigToStorage() {
    try {
        const encryptedConfig = {
            baseUrl: ADGUARD_CONFIG.baseUrl,
            username: simpleEncrypt(ADGUARD_CONFIG.username),
            password: simpleEncrypt(ADGUARD_CONFIG.password)
        };
        localStorage.setItem('adguard-config', JSON.stringify(encryptedConfig));
    } catch (error) {
        console.error('Error saving configuration:', error);
    }
}

function loadConfigFromStorage() {
    try {
        const savedConfig = localStorage.getItem('adguard-config');
        if (savedConfig) {
            const encryptedConfig = JSON.parse(savedConfig);
            ADGUARD_CONFIG = {
                baseUrl: encryptedConfig.baseUrl,
                username: simpleDecrypt(encryptedConfig.username),
                password: simpleDecrypt(encryptedConfig.password)
            };
            console.log('Configuration loaded from storage');
        }
    } catch (error) {
        console.error('Error loading configuration:', error);
    }
}

// Load configuration when module is imported
loadConfigFromStorage();

// Function for API calls using curl via cockpit.spawn
export async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        console.log('API Call:', endpoint, method, data);

        const url = `${ADGUARD_CONFIG.baseUrl}${endpoint}`;
        const auth = btoa(`${ADGUARD_CONFIG.username}:${ADGUARD_CONFIG.password}`);

        // Prepare the curl command
        let args = [
            '-s',
            '-X', method,
            '-H', `Authorization: Basic ${auth}`,
            '-H', 'Content-Type: application/json',
            url
        ];

        if (data && (method === 'POST' || method === 'PUT')) {
            args.push('-d', JSON.stringify(data));
        }

        // Run curl via cockpit.spawn
        const result = await cockpit.spawn(['curl', ...args], {
            superuser: true,
            err: 'message'
        });

        console.log('API Response:', result);
        return JSON.parse(result);
    } catch (error) {
        console.error("API Call Error:", error);
        throw error;
    }
}

// Specific API functions
export async function getStatus() {
    return apiCall('/control/status');
}

export async function toggleProtection(enabled) {
    return apiCall('/control/protection', 'POST', { enabled });
}

export async function getStats() {
    return apiCall('/control/stats');
}

export async function getQueryLog(limit = 10) {
    return apiCall(`/control/querylog?limit=${limit}`);
}

export async function getClients() {
    return apiCall('/control/clients');
}

export async function getDhcpInfo() {
    return apiCall('/control/dhcp/status');
}

export async function getFilteringStatus() {
    return apiCall('/control/filtering/status');
}

export async function getDnsInfo() {
    return apiCall('/control/dns_info');
}

export async function getVersion() {
    return apiCall('/control/version');
}

export async function updateFilters() {
    return apiCall('/control/filters/update', 'POST');
}

// Function to test connection and authentication
export async function testConnection(config = null) {
    try {
        // Use provided config or default config
        const testConfig = config || ADGUARD_CONFIG;
        const auth = btoa(`${testConfig.username}:${testConfig.password}`);

        const result = await cockpit.spawn(['curl', '-s', '-X', 'GET', '-H', `Authorization: Basic ${auth}`, `${testConfig.baseUrl}/control/status`], {
            superuser: true,
            err: 'message'
        });

        const status = JSON.parse(result);
        return {
            success: true,
            message: 'Connection successful',
            version: status.version
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}