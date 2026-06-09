# STL Fingerprinting Web 🛡️💎

A browser-based tool for invisible and secure fingerprinting of STL files using steganography and AES encryption.

## Project Overview

This project provides a complete client-side solution for embedding identification data (like customer emails) into the geometry of 3D models in STL format. The process is designed to be:
- **Invisible:** Modifications are made at the $10^{-7}$ scale of vertex coordinates.
- **Secure:** Data is encrypted using AES-CBC (Fernet-like implementation) before embedding.
- **Private:** All processing happens locally in the browser; no files or keys are uploaded to any server.

### Main Technologies
- **HTML5/CSS3:** Frontend structure and styling.
- **JavaScript (Vanilla):** Core logic for STL manipulation and steganography.
- **JSZip:** Used to package multiple marked files into a single ZIP archive.
- **CryptoJS:** Handles AES encryption, SHA256 (for HMAC), and MD5 (for file integrity).

## Project Structure

- `index.html`: The Batch Generator UI.
- `extrator.html`: The Mark Extractor UI.
- `src/js/core.js`: Core business logic (encryption, decryption, binary manipulation).
- `src/js/ui.js`: Shared UI helper functions.
- `src/js/generator.js`: Logic specific to the batch generator.
- `src/js/extractor.js`: Logic specific to the mark extractor.
- `src/css/styles.css`: Unified styling.
- `tests/`: Automated tests (Jest & Playwright).
- `test-files/`: Sample STL files for testing.

## Usage & Development

### Running the Project
Since this is a client-side only project, you can run it by simply opening the `.html` files in any modern web browser.

### Building & Testing
- **Build:** There is no build step.
- **Dependencies:** External libraries (JSZip, CryptoJS) are loaded via CDN.
- **Testing:** The project is now structured for unit testing (e.g., using Jest). You can test functions in `core.js` independently of the DOM.

### Development Conventions
- **Language:** Code comments and logic are in English, while the UI is in Portuguese.
- **Architecture:** Separated concerns between UI, Core logic, and Page-specific logic.
- **Responsiveness:** Always use the `yieldToMain` pattern to prevent UI freezing.

## TODO / Future Improvements
- [ ] Implement unit tests for the encryption and embedding logic (using Jest).
- [ ] Add support for ASCII STL (conversion to binary before processing).
- [x] Modernize the project structure by moving JS logic out of HTML files.
- [ ] Add a visual 3D preview of the STL before/after marking.
