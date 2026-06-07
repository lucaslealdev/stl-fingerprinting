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

- `index.html`: The Batch Generator. Allows users to upload an STL and a list of recipients to generate multiple personalized copies.
- `extrator.html`: The Mark Extractor. Allows users to upload a marked STL and provide the security key to reveal the hidden identifier.
- `styles.css`: Unified styling for both interfaces.
- `README.md`: User-facing documentation in Portuguese.

## Usage & Development

### Running the Project
Since this is a client-side only project, you can run it by simply opening the `.html` files in any modern web browser. No local server or installation is strictly required, although a local server (like `live-server`) is recommended for development to avoid certain CORS or file protocol limitations if they arise.

### Building & Testing
- **Build:** There is no build step. The project uses plain HTML/JS/CSS.
- **Dependencies:** External libraries (JSZip, CryptoJS) are loaded via CDN.
- **Testing:** Currently, testing is manual. Verify changes by generating a batch and then using the extractor to confirm the data can be retrieved.

### Development Conventions
- **Language:** Code comments and logic are in English/Mixed, while the UI is in Portuguese.
- **Architecture:** Procedural JavaScript within `<script>` tags. For larger features, consider extracting logic into dedicated `.js` files.
- **Responsiveness:** Always use the `yieldToMain` pattern (`await new Promise(r => setTimeout(r, 0))`) during heavy loops (MD5, geometry processing) to prevent UI freezing and allow progress bar updates.
- **STL Format:** Only **Binary STL** is supported. ASCII STL files will trigger errors in the extractor.
- **LSB Steganography:** The least significant bit (LSB) of the vertex coordinate values (treated as `uint32` bits) is used to store the encrypted payload.

## TODO / Future Improvements
- [ ] Implement unit tests for the encryption and embedding logic.
- [ ] Add support for ASCII STL (conversion to binary before processing).
- [ ] Modernize the project structure by moving JS logic out of HTML files.
- [ ] Add a visual 3D preview of the STL before/after marking.
