/**
 * UI Helper functions shared between Generator and Extractor
 */

function showOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
}

function hideOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

function updateFileStatus() {
    hideOverlay();
    const fileInput = document.getElementById('fileInput');
    const status = document.getElementById('statusText');
    if (fileInput && fileInput.files[0] && status) {
        const file = fileInput.files[0];
        status.innerText = `Arquivo selecionado: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    }
}
