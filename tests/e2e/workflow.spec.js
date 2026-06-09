const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');

test.describe('STL Fingerprinting End-to-End Workflow', () => {
    const stlPath = path.join(__dirname, '../../test-files/simple.stl');
    const downloadPath = path.join(__dirname, '../output/fingerprints.zip');
    const extractPath = path.join(__dirname, '../output/extracted');

    test.beforeAll(async () => {
        if (!fs.existsSync(stlPath)) {
            throw new Error(`Arquivo de teste não encontrado: ${stlPath}`);
        }
        if (!fs.existsSync(path.dirname(downloadPath))) {
            fs.mkdirSync(path.dirname(downloadPath), { recursive: true });
        }
    });

    test('should complete the full cycle: Generate -> Download -> Extract -> Verify', async ({ page }) => {
        // --- FASE 1: GERAÇÃO ---
        await page.goto('/index.html');
        
        await page.setInputFiles('#fileInput', stlPath);
        const recipient = 'user_test_e2e';
        await page.fill('#listInput', recipient);

        // Inicia o download
        const [ download ] = await Promise.all([
            page.waitForEvent('download'),
            page.click('#btnGerar')
        ]);

        const fileName = download.suggestedFilename();
        const zipFile = path.join(path.dirname(downloadPath), fileName);
        await download.saveAs(zipFile);

        expect(fs.existsSync(zipFile)).toBeTruthy();

        // --- FASE 2: DESCOMPACTAÇÃO ---
        const zip = new AdmZip(zipFile);
        zip.extractAllTo(extractPath, true);

        const extractedFiles = fs.readdirSync(extractPath);
        const keyFile = extractedFiles.find(f => f === 'key.txt');
        const markedStl = extractedFiles.find(f => f.endsWith('.stl'));
        
        expect(keyFile).toBeDefined();
        expect(markedStl).toBeDefined();

        const keyContent = fs.readFileSync(path.join(extractPath, keyFile), 'utf-8').trim();
        const markedStlPath = path.join(extractPath, markedStl);

        // --- FASE 3: EXTRAÇÃO/VERIFICAÇÃO ---
        await page.goto('/extrator.html');

        await page.setInputFiles('#fileInput', markedStlPath);
        await page.fill('#keyInput', keyContent);
        
        await page.click('button:has-text("Verificar Identidade")');

        // Espera pelo resultado de sucesso
        const resultDiv = page.locator('#result');
        await expect(resultDiv).toBeVisible({ timeout: 15000 });
        await expect(resultDiv).toHaveClass(/success/);
        await expect(resultDiv).toContainText(recipient);
    });
});
