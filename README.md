# STL Fingerprinting Web 🛡️💎

Uma solução completa e baseada em navegador para marcar arquivos STL de forma invisível e segura. Proteja sua propriedade intelectual em modelos 3D através de esteganografia de alta precisão e criptografia AES, tudo processado localmente no seu computador.

## 🚀 O que este projeto faz?

Este sistema permite embutir informações de identificação (como nomes ou e-mails de clientes) diretamente na geometria de arquivos STL. A marcação é:
- **Invisível:** Alterações na escala de $10^{-7}$ nas coordenadas dos vértices.
- **Segura:** Dados protegidos por criptografia de nível militar (AES-CBC via Fernet).
- **Privada:** Todo o processamento ocorre no seu navegador. Nenhum arquivo ou chave é enviado para servidores externos.

## 🛠️ Como Funciona?

1.  **Criptografia:** O identificador (ex: `cliente@email.com`) é encriptado com uma chave de 32 bytes.
2.  **Esteganografia LSB:** O token encriptado é convertido em bits e escondido no "Bit Menos Significativo" (LSB) das coordenadas X, Y e Z de cada triângulo do modelo.
3.  **Integridade:** Para cada arquivo gerado, o sistema calcula um hash MD5 para garantir que você saiba se o arquivo foi alterado após a entrega.

## 📖 Como Usar

Não é necessário instalar nada além de um navegador moderno. Basta abrir os arquivos `.html`.

### 1. Gerador de Lote (`index.html`)
Use esta ferramenta para criar cópias personalizadas para seus clientes.
-   **Passo 1:** Selecione seu arquivo STL original (formato binário).
-   **Passo 2:** Cole a lista de destinatários (um nome ou e-mail por linha).
-   **Passo 3:** Clique em **Gerar e Baixar ZIP**.
-   **Resultado:** Você receberá um arquivo ZIP contendo o STL de cada cliente, um arquivo de texto com o hash MD5 e o arquivo `key.txt` com a chave do lote.

### 2. Extrator de Marca (`extrator.html`)
Use esta ferramenta para validar a origem de um arquivo suspeito.
-   **Passo 1:** Selecione o arquivo STL marcado.
-   **Passo 2:** Insira a chave de segurança que você salvou no `key.txt`.
-   **Passo 3:** Clique em **Verificar Identidade**.
-   **Resultado:** O sistema revelará o identificador exato escondido no modelo.

## ⚙️ Detalhes Técnicos

-   **Formato Suportado:** STL Binário (ASCII não suportado).
-   **Bibliotecas:** 
    -   `JSZip`: Para empacotamento das cópias.
    -   `CryptoJS`: Para criptografia AES e hashes MD5.
-   **Resistência:** A marca sobrevive a renomeações e conversões de binário/ASCII. Modificações pesadas (remeshing ou simplificação agressiva) podem destruir os bits.

## 📁 Estrutura de Arquivos

-   `index.html`: Interface do Gerador.
-   `extrator.html`: Interface do Extrator.
-   `styles.css`: Estilização unificada do projeto.
-   `README.md`: Este manual.

---
*Desenvolvido para proteção de modelos 3D com foco em simplicidade e privacidade.*
