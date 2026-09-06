// Native SHA-256 Checksum generator using Web Cryptography API
export async function calculateSHA256(blobOrFile) {
  try {
    const buffer = await blobOrFile.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.warn('Checksum calculation failed:', err);
    return null;
  }
}