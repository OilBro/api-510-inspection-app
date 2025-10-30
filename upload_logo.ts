import { storagePut } from './server/storage';
import { readFileSync } from 'fs';

async function uploadLogo() {
  const logoBuffer = readFileSync('./client/public/oilpro-logo.png');
  const { url } = await storagePut('assets/oilpro-logo.png', logoBuffer, 'image/png');
  console.log('Logo uploaded to S3:', url);
  return url;
}

uploadLogo().catch(console.error);
