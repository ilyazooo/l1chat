import CryptoJS from 'crypto-js';

const encryptionKey = "pKu&DX/eibYg4o].7bupOm|_*>!.!gAI";

export const encryptPrivateKey = (privateKey) => {
    return CryptoJS.AES.encrypt(privateKey, encryptionKey).toString();
};

export const decryptPrivateKey = (encryptedPrivateKey) => {
    const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};