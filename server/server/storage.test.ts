import { describe, it, expect, beforeAll } from 'vitest';
import { storagePut, storageGet, getStorageInfo } from './storage';

describe('Storage Integration (R2)', () => {
  beforeAll(() => {
    // Verify R2 is configured
    const info = getStorageInfo();
    console.log('Storage provider:', info.provider);
    console.log('Storage configured:', info.configured);
  });

  it('should report R2 as the active storage provider', () => {
    const info = getStorageInfo();
    expect(info.provider).toBe('r2');
    expect(info.configured).toBe(true);
  });

  it('should upload a test file to R2', async () => {
    const testContent = 'Test file content for R2 integration';
    const testKey = `test/r2-integration-${Date.now()}.txt`;
    
    const result = await storagePut(testKey, testContent, 'text/plain');
    
    expect(result.key).toBe(testKey);
    expect(result.url).toContain('pub-00403c9b844b4ab5a932e46119e654c8.r2.dev');
    expect(result.url).toContain(testKey);
  });

  it('should retrieve a file URL from R2', async () => {
    const testKey = 'test/existing-file.txt';
    
    const result = await storageGet(testKey);
    
    expect(result.key).toBe(testKey);
    expect(result.url).toContain('pub-00403c9b844b4ab5a932e46119e654c8.r2.dev');
    expect(result.url).toContain(testKey);
  });

  it('should handle binary data upload', async () => {
    const binaryData = Buffer.from([0x89, 0x50, 0x4E, 0x47]); // PNG header
    const testKey = `test/binary-${Date.now()}.png`;
    
    const result = await storagePut(testKey, binaryData, 'image/png');
    
    expect(result.key).toBe(testKey);
    expect(result.url).toContain('.r2.dev');
  });

  it('should normalize keys by removing leading slashes', async () => {
    const testContent = 'Key normalization test';
    const keyWithSlash = '/test/normalized-key.txt';
    const expectedKey = 'test/normalized-key.txt';
    
    const result = await storagePut(keyWithSlash, testContent, 'text/plain');
    
    expect(result.key).toBe(expectedKey);
  });
});
