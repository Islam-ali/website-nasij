import * as CryptoJS from 'crypto-js';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
const SECRET_KEY = 'Pledge-Secret-Key-2025';

// 🟢 التشفير + الضغط
export function secureEncode(data: any): string {
  try {
    const json = JSON.stringify(data);

    // ضغط JSON لتقليل الحجم
    const compressed = compressToEncodedURIComponent(json);
    // تشفير AES
    const encrypted = CryptoJS.AES.encrypt(compressed, SECRET_KEY).toString();

    // Base64 لتأمين النقل في الرابط
    return encodeURIComponent(encrypted);
  } catch (err) {
    return '';
  }
}

// 🔵 فك التشفير + فك الضغط
export function secureDecode(encoded: string): any {
  try {
    const decrypted = CryptoJS.AES.decrypt(decodeURIComponent(encoded), SECRET_KEY)
      .toString(CryptoJS.enc.Utf8);

    const decompressed = decompressFromEncodedURIComponent(decrypted);
    return JSON.parse(decompressed);
  } catch (err) {
    return null;
  }
}

export function secureEncodeUrl(data: any): string {
  return compressToEncodedURIComponent(JSON.stringify(data));
}

export function secureDecodeUrl(encoded: string): any {
  return JSON.parse(decompressFromEncodedURIComponent(encoded));
}
