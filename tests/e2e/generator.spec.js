const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('STL Fingerprint Maker', () => {
    test('should load the page and have correct title', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/STL Fingerprint Maker/);
    });

    test('should show error if generating without file', async ({ page }) => {
        await page.goto('/');
        
        // Setup dialog listener for alert
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('Selecione um arquivo STL');
            await dialog.dismiss();
        });

        await page.click('#btnGerar');
    });

    // Note: To test the full download flow, we would need a real .stl file in fixtures.
    // I'll create a dummy one for the test.
    test('should trigger download when all fields are valid', async ({ page }) => {
        const fixturePath = path.join(__dirname, 'fixtures', 'test.stl');
        if (!fs.existsSync(path.dirname(fixturePath))) {
            fs.mkdirSync(path.dirname(fixturePath), { recursive: true });
        }
        
        // Create a minimal valid binary STL header (84 bytes)
        const dummyStl = Buffer.alloc(84);
        dummyStl.write('DUMMY BINARY STL HEADER', 0);
        dummyStl.writeUInt32LE(0, 80); // 0 triangles
        fs.writeFileSync(fixturePath, dummyStl);

        await page.goto('/');
        
        // Upload file
        await page.setInputFiles('#fileInput', fixturePath);
        
        // Fill recipients
        await page.fill('#listInput', 'test-recipient');

        // Start download and wait for it
        const [ download ] = await Promise.all([
            page.waitForEvent('download'),
            page.click('#btnGerar')
        ]);

        expect(download.suggestedFilename()).toContain('fingerprints_');
    });
});
