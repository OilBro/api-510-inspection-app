import { ENV } from './server/_core/env';

console.log('=== Docupipe API Key Test ===');
console.log('API Key:', ENV.docupipeApiKey ? `${ENV.docupipeApiKey.substring(0, 10)}...` : 'NOT FOUND');
console.log('Schema ID:', ENV.docupipeSchemaId || 'NOT FOUND');
console.log('API Key type:', typeof ENV.docupipeApiKey);
console.log('API Key length:', ENV.docupipeApiKey?.length || 0);
console.log('Test completed');
