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

// Recursive webkitGetAsEntry directory tree crawler
export async function extractFilesFromDataTransfer(items) {
  const files = [];

  const traverseFileTree = async (item, path = '') => {
    return new Promise((resolve) => {
      if (item.isFile) {
        item.file((file) => {
          // Attach relative directory path
          Object.defineProperty(file, 'relativePath', {
            value: path ? `${path}/${file.name}` : file.name,
            writable: false
          });
          files.push(file);
          resolve();
        });
      } else if (item.isDirectory) {
        const dirReader = item.createReader();
        dirReader.readEntries(async (entries) => {
          for (const entry of entries) {
            await traverseFileTree(entry, path ? `${path}/${item.name}` : item.name);
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  };

  const entries = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.webkitGetAsEntry) {
      const entry = item.webkitGetAsEntry();
      if (entry) entries.push(entry);
    } else if (item.getAsFile) {
      const file = item.getAsFile();
      if (file) files.push(file);
    }
  }

  for (const entry of entries) {
    await traverseFileTree(entry);
  }

  return files;
}