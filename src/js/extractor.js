/**
 * Logic for STL Fingerprint Extraction
 */

async function extract() {
    const fileInput = document.getElementById('fileInput');
    const keyInputElem = document.getElementById('keyInput');
    const resultDiv = document.getElementById('result');
    const status = document.getElementById('statusText');
    const bar = document.getElementById('progressBar');
    const progressContainer = document.getElementById('progress');
    
    if (!fileInput || !keyInputElem || !resultDiv || !status || !bar || !progressContainer) return;

    const keyInput = keyInputElem.value.trim();

    if (!fileInput.files[0] || !keyInput) {
        alert("Preencha todos os campos.");
        return;
    }

    resultDiv.style.display = "none";
    progressContainer.style.display = "block";
    bar.style.width = "0%";
    status.innerText = "Lendo cabeçalho do arquivo...";

    try {
        await yieldToMain(50); 
        const file = fileInput.files[0];
        const buffer = await file.arrayBuffer();
        const view = new DataView(buffer);
        
        status.innerText = "Analisando geometria completa (Modo Robusto)...";
        bar.style.width = "20%";
        await yieldToMain(50);

        const headerText = new TextDecoder().decode(buffer.slice(0, 5));
        if (headerText === "solid") throw new Error("Este arquivo está em formato ASCII. Use STL Binário.");
        if (buffer.byteLength < 84) throw new Error("Arquivo STL inválido ou muito pequeno.");

        const numTriangles = view.getUint32(80, true);
        let bits = new Uint8Array(numTriangles * 9); 
        let pos = 84;
        let bitCount = 0;

        for (let i = 0; i < numTriangles; i++) {
            if (pos + 50 > buffer.byteLength) break; 
            pos += 12; 
            for (let v = 0; v < 9; v++) {
                bits[bitCount++] = view.getUint32(pos, true) & 1;
                pos += 4;
            }
            pos += 2; 
        }

        status.innerText = "Escaneando marcas redundantes...";
        bar.style.width = "50%";
        await yieldToMain(50);

        const syncMarker = [0x53, 0x54, 0x4c, 0x46]; // "STLF"
        const markerBits = [];
        for (let b of syncMarker) {
            for (let j = 0; j < 8; j++) markerBits.push((b >> j) & 1);
        }

        // Função para extrair bytes de um ponto específico dos bits
        function getBytes(bitArray, startBit, byteLen) {
            let out = new Uint8Array(byteLen);
            for (let i = 0; i < byteLen; i++) {
                let byte = 0;
                for (let j = 0; j < 8; j++) {
                    if (bitArray[startBit + i * 8 + j]) byte |= (1 << j);
                }
                out[i] = byte;
            }
            return out;
        }

        let foundResult = null;

        // Escaneamento bit a bit para robustez máxima contra deleção de triângulos
        for (let i = 0; i < bitCount - markerBits.length - 64; i++) {
            let match = true;
            for (let j = 0; j < markerBits.length; j++) {
                if (bits[i + j] !== markerBits[j]) { match = false; break; }
            }

            if (match) {
                try {
                    const lenStart = i + markerBits.length;
                    const lenBytes = getBytes(bits, lenStart, 4);
                    const payloadLen = (lenBytes[0] << 24 | lenBytes[1] << 16 | lenBytes[2] << 8 | lenBytes[3]) >>> 0;
                    
                    if (payloadLen > 0 && payloadLen < 2000) { // Sanity check
                        const payloadStart = lenStart + 32;
                        const payloadBytes = getBytes(bits, payloadStart, payloadLen);
                        const fernetBase64 = new TextDecoder().decode(payloadBytes).replace(/-/g, '+').replace(/_/g, '/');
                        
                        // Tentar descriptografar
                        const result = decryptFernet(fernetBase64, keyInput);
                        if (result) {
                            foundResult = result;
                            break; // Encontramos uma cópia válida!
                        }
                    }
                } catch (e) {
                    // Silenciosamente ignorar falhas nesta cópia e tentar a próxima
                }
                i += markerBits.length; // Pular o marcador encontrado
            }
            
            if (i % 50000 === 0) {
                status.innerText = `Escaneando: ${Math.round((i/bitCount)*100)}%...`;
                await yieldToMain(0);
            }
        }

        if (!foundResult) throw new Error("Nenhuma marca válida encontrada ou chave incorreta.");

        bar.style.width = "100%";
        status.innerText = "Extração concluída com sucesso!";
        resultDiv.style.display = "block";
        resultDiv.className = "success";
        resultDiv.innerHTML = "<strong>✅ SUCESSO!</strong><br><br>ID Identificado:<br><code>" + foundResult + "</code>";

    } catch (e) {
        bar.style.width = "0%";
        status.innerText = "Falha na extração.";
        resultDiv.style.display = "block";
        resultDiv.className = "error";
        resultDiv.innerHTML = "<strong>❌ ERRO:</strong><br>" + e.message;
    }
}
