import axios from 'axios';
import { TOTP } from "totp-generator"


const toHexString = (byteArray: Uint8Array) =>
    Array.from(byteArray, (b) => b.toString(16).padStart(2, "0")).join("");

const hexToBytes = (hex: string) => {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
};

const base64ToBase32 = (base64: string) => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const binary = Array.from(atob(base64))
        .map((ch) => ch.charCodeAt(0).toString(2).padStart(8, "0"))
        .join("");

    let base32 = "";
    for (let i = 0; i < binary.length; i += 5) {
        const chunk = binary.substr(i, 5);
        if (chunk.length === 5) {
            base32 += alphabet[parseInt(chunk, 2)];
        } else {
            base32 += alphabet[parseInt(chunk.padEnd(5, "0"), 2)];
        }
    }
    return base32;
};

function generateSecret(secretCipherBytes: number[]) {
    // Step 1: Transform bytes with XOR
    const transformed = secretCipherBytes.map((byte, index) => {
        return byte ^ ((index % 33) + 9);
    });

    // Step 2: Join numbers into decimal string
    const joined = transformed.join("");

    // Step 3: Convert decimal string to hex string
    const hexStr = toHexString(new TextEncoder().encode(joined));

    // Step 4: Hex → bytes → Base64 → Base32 → trim '='
    const base64 = btoa(String.fromCharCode(...hexToBytes(hexStr)));
    const secret = base64ToBase32(base64).replace(/=+$/, "");

    return secret;
}

export async function generateTokenUrl() {
    const secret = await axios.get(
        "https://raw.githubusercontent.com/Thereallo1026/spotify-secrets/refs/heads/main/secrets/secretDict.json"
    );
    const secretsMap = secret.data;
    const totpVer = Object.keys(secretsMap).at(-1);

    if (!totpVer) return
    const totpSecretBytes = secretsMap[totpVer];
    const totpSecretKey = generateSecret(totpSecretBytes);

    const { otp } = TOTP.generate(totpSecretKey);
    const tokenURL = `https://open.spotify.com/api/token?reason=init&productType=web-player&totp=${otp}&totpVer=${totpVer}`;
    return tokenURL
}