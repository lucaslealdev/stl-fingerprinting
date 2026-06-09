/**
 * Core Logic for STL Fingerprinting
 * Shared functions for encryption, decryption, and binary manipulation.
 */

const yieldToMain = (ms = 10) => new Promise(r => setTimeout(r, ms));

/**
 * Sanitizes filenames for batch generation
 */
function sanitizeFilename(name) {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);
}

/**
 * Converts Uint8Array to CryptoJS WordArray
 */
async function u8ToWords(u8, onProgress) {
    const words = [];
    const total = u8.length;
    for (let i = 0; i < total; i += 4) {
        if (i % 1000000 === 0 && onProgress) {
            onProgress(i / total);
            await yieldToMain(0);
        }
        words.push((u8[i] << 24) | (u8[i+1] << 16) | (u8[i+2] << 8) | (u8[i+3]));
    }
    return CryptoJS.lib.WordArray.create(words, u8.length);
}

/**
 * Encrypts a string using a Fernet-like AES-CBC implementation
 */
function encryptFernet(plaintext, keyB64) {
    const key = CryptoJS.enc.Base64.parse(keyB64.replace(/-/g, '+').replace(/_/g, '/'));
    const hmacKey = CryptoJS.lib.WordArray.create(key.words.slice(0, 4));
    const aesKey = CryptoJS.lib.WordArray.create(key.words.slice(4, 8));
    const version = CryptoJS.enc.Hex.parse('80');
    const timestamp = CryptoJS.lib.WordArray.create([0, Math.floor(Date.now() / 1000)], 8);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(plaintext, aesKey, {
        iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7
    });
    const ciphertext = encrypted.ciphertext;
    const hmacPayload = version.clone().concat(timestamp).concat(iv).concat(ciphertext);
    const hmac = CryptoJS.HmacSHA256(hmacPayload, hmacKey);
    const token = hmacPayload.concat(hmac);
    return CryptoJS.enc.Base64.stringify(token).replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Decrypts a Fernet-like token
 */
function decryptFernet(tokenB64, keyB64) {
    try {
        const fernetBase64 = tokenB64.replace(/-/g, '+').replace(/_/g, '/');
        const binaryTokenString = atob(fernetBase64);
        const fernetData = new Uint8Array(binaryTokenString.length);
        for (let i = 0; i < binaryTokenString.length; i++) fernetData[i] = binaryTokenString.charCodeAt(i);
        
        if (fernetData.length < 57) return null;

        // Note: u8ToWords is async for large files, but for tokens we use a simple sync version
        const simpleU8ToWords = (u8) => {
            const words = [];
            for (let i = 0; i < u8.length; i += 4) {
                words.push((u8[i] << 24) | (u8[i+1] << 16) | (u8[i+2] << 8) | (u8[i+3]));
            }
            return CryptoJS.lib.WordArray.create(words, u8.length);
        };

        const iv = simpleU8ToWords(fernetData.slice(9, 25));
        const ciphertext = simpleU8ToWords(fernetData.slice(25, -32));
        const cleanKey = keyB64.replace(/-/g, '+').replace(/_/g, '/');
        const rawKey = CryptoJS.enc.Base64.parse(cleanKey);
        
        const encKey = CryptoJS.lib.WordArray.create(rawKey.words.slice(4, 8));
        const decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphertext }, encKey, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return null;
    }
}
