const { encryptFernet, decryptFernet, sanitizeFilename } = require('../../src/js/core.js');

describe('Core Logic - Fingerprinting', () => {
    test('should sanitize filenames correctly', () => {
        expect(sanitizeFilename('User Name!')).toBe('user_name_');
        expect(sanitizeFilename('test@email.com')).toBe('test_email_com');
    });

    test('should encrypt and decrypt a message correctly', () => {
        const message = 'test-message';
        const keyB64 = 'kYI_XJ_S_W_Z_A_B_C_D_E_F_G_H_I_J_K_L_M_N_O_P_Q='; 
        // Note: Real key needs to be 32 bytes base64. Let's generate one properly for the test.
        const keyWA = CryptoJS.lib.WordArray.random(32);
        const realKeyB64 = CryptoJS.enc.Base64.stringify(keyWA).replace(/\+/g, '-').replace(/\//g, '_');

        const encrypted = encryptFernet(message, realKeyB64);
        expect(encrypted).toBeDefined();
        expect(typeof encrypted).toBe('string');

        const decrypted = decryptFernet(encrypted, realKeyB64);
        expect(decrypted).toBe(message);
    });

    test('should return null for invalid tokens during decryption', () => {
        const keyWA = CryptoJS.lib.WordArray.random(32);
        const keyB64 = CryptoJS.enc.Base64.stringify(keyWA);
        expect(decryptFernet('invalid-token', keyB64)).toBeNull();
    });
});
