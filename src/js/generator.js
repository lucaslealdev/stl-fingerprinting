/**
 * Logic for STL Fingerprint Batch Generation
 */

async function generateBatch() {
    const fileInput = document.getElementById('fileInput');
    const listInput = document.getElementById('listInput');
    const btn = document.getElementById('btnGerar');
    const status = document.getElementById('statusText');
    const bar = document.getElementById('progressBar');
    const progressContainer = document.getElementById('progress');

    if (!fileInput || !listInput || !btn || !status || !bar || !progressContainer) return;

    const listText = listInput.value.trim();
    const recipients = listText.split('\n').map(r => r.trim()).filter(r => r.length > 0);

    if (!fileInput.files[0]) return alert("Selecione um arquivo STL.");
    if (recipients.length === 0) return alert("Insira ao menos um destinatário na lista.");

    btn.disabled = true;
    progressContainer.style.display = "block";
    bar.style.width = "0%";
    status.innerText = "Preparando processamento...";
    
    try {
        await yieldToMain(100);
        status.innerText = "Carregando arquivo original para memória...";
        await yieldToMain(50);
        const originalBuffer = await fileInput.files[0].arrayBuffer();
        const zip = new JSZip();
        const keyWA = CryptoJS.lib.WordArray.random(32);
        const keyB64 = CryptoJS.enc.Base64.stringify(keyWA).replace(/\+/g, '-').replace(/\//g, '_');
        zip.file("key.txt", keyB64);

        const stlName = fileInput.files[0].name.replace('.stl', '');
        const count = recipients.length;
        
        for (let i = 0; i < count; i++) {
            const currentRecipient = recipients[i];
            const baseProgress = (i / count) * 100;
            
            status.innerText = `[${i+1}/${count}] Criptografando: ${currentRecipient}`;
            bar.style.width = `${baseProgress}%`;
            await yieldToMain();

            const encryptedToken = encryptFernet(currentRecipient, keyB64);
            const tokenEncoder = new TextEncoder();
            const tokenBytes = tokenEncoder.encode(encryptedToken);
            
            // Estrutura Robusta: [SYNC 4 bytes] [LEN 4 bytes] [PAYLOAD]
            const syncMarker = [0x53, 0x54, 0x4c, 0x46]; // "STLF"
            const fullPayload = new Uint8Array(syncMarker.length + 4 + tokenBytes.length);
            fullPayload.set(syncMarker, 0);
            new DataView(fullPayload.buffer).setUint32(syncMarker.length, tokenBytes.length, false);
            fullPayload.set(tokenBytes, syncMarker.length + 4);

            let bits = [];
            for (let b of fullPayload) {
                for (let j = 0; j < 8; j++) bits.push((b >> j) & 1);
            }

            status.innerText = `[${i+1}/${count}] Aplicando marca robusta: ${currentRecipient}`;
            await yieldToMain();

            const newBuffer = originalBuffer.slice(0);
            const view = new DataView(newBuffer);
            const numTriangles = view.getUint32(80, true);
            
            let bitIdx = 0;
            let pos = 84;
            for (let t = 0; t < numTriangles; t++) {
                pos += 12; // Skip Normal
                for (let v = 0; v < 9; v++) {
                    // Loop infinito nos bits do payload (Redundância)
                    let val = view.getUint32(pos, true);
                    if (bits[bitIdx % bits.length]) val |= 1;
                    else val &= ~1;
                    view.setUint32(pos, val, true);
                    bitIdx++;
                    pos += 4;
                }
                pos += 2; // Attribute byte count
            }

            status.innerText = `[${i+1}/${count}] Calculando integridade: ${currentRecipient}`;
            bar.style.width = `${baseProgress + (0.5 / count) * 100}%`;
            await yieldToMain();

            const finalStlBytes = new Uint8Array(newBuffer);
            const words = await u8ToWords(finalStlBytes, (p) => {
                bar.style.width = `${baseProgress + (0.5 + p * 0.4) / count * 100}%`;
            });
            const md5 = CryptoJS.MD5(words).toString();
            
            const sanitizedId = sanitizeFilename(currentRecipient);
            const baseFileName = `${stlName}_ID_${sanitizedId}`;
            zip.file(`${baseFileName}.stl`, finalStlBytes);
            zip.file(`${baseFileName}.txt`, md5);
            
            bar.style.width = `${((i + 1) / count) * 100}%`;
        }

        status.innerText = "Finalizando pacote ZIP...";
        bar.style.width = "100%";
        await yieldToMain();
        
        const zipBlob = await zip.generateAsync({type: "blob"}, (p) => {
            status.innerText = `Comprimindo ZIP: ${Math.round(p.percent)}%`;
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = `fingerprints_${stlName}.zip`;
        link.click();
        status.innerText = "Concluído! ZIP baixado com sucesso.";
    } catch (e) {
        console.error(e);
        status.innerText = "Erro no processamento.";
    } finally {
        btn.disabled = false;
    }
}
